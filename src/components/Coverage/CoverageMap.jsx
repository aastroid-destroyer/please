import { useEffect, useMemo, useRef, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icons in bundlers like Vite/Webpack.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [23.685, 90.3563];
const DEFAULT_ZOOM = 7;
const SEARCH_ZOOM = 12;

const getWarehouseCoordinates = (warehouse) => {
  const lat =
    warehouse?.lat ??
    warehouse?.latitude ??
    warehouse?.Latitude ??
    warehouse?.y;

  const lng =
    warehouse?.lng ??
    warehouse?.lon ??
    warehouse?.long ??
    warehouse?.longitude ??
    warehouse?.Longitude ??
    warehouse?.x;

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
    return null;
  }

  return [parsedLat, parsedLng];
};

const normalizeWarehouses = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.warehouses)) {
    return data.warehouses;
  }

  if (Array.isArray(data?.features)) {
    return data.features
      .map((feature) => ({
        ...feature.properties,
        lat: feature?.geometry?.coordinates?.[1],
        lng: feature?.geometry?.coordinates?.[0],
      }))
      .filter(Boolean);
  }

  return [];
};

// Must be rendered inside MapContainer to access the map instance.
const MapSearch = () => {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(""); // "not-found" | "error" | ""
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  // Prevent map interactions (drag/scroll/click) from firing while the user
  // is typing or interacting with the search box.
  const stopPropagation = (e) => e.stopPropagation();

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setStatus("");

    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(trimmed)}&format=json&limit=1`;

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Geocoding request failed");

      const data = await res.json();

      if (!data.length) {
        setStatus("not-found");
        return;
      }

      const { lat, lon } = data[0];
      map.flyTo([Number(lat), Number(lon)], SEARCH_ZOOM, { duration: 1.2 });
      setStatus("");
    } catch {
      setStatus("error");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        width: "min(360px, 90vw)",
      }}
      // Prevent map drag/scroll/click from capturing events inside the box
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}
      onClick={stopPropagation}
      onDoubleClick={stopPropagation}
      onWheelCapture={stopPropagation}
    >
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setStatus("");
          }}
          placeholder="Search city name…"
          aria-label="Search city"
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "none",
            outline: "none",
            fontSize: "14px",
            background: "#fff",
            color: "#111",
          }}
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          aria-label="Search"
          style={{
            padding: "10px 16px",
            border: "none",
            background: "#2563eb",
            color: "#fff",
            cursor: isSearching || !query.trim() ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: 600,
            opacity: isSearching || !query.trim() ? 0.6 : 1,
            transition: "opacity 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {isSearching ? "…" : "Search"}
        </button>
      </form>

      {status === "not-found" && (
        <span
          style={{
            background: "rgba(255,255,255,0.95)",
            color: "#b91c1c",
            fontSize: "13px",
            padding: "4px 10px",
            borderRadius: "6px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          }}
        >
          City not found. Try a different name.
        </span>
      )}

      {status === "error" && (
        <span
          style={{
            background: "rgba(255,255,255,0.95)",
            color: "#b91c1c",
            fontSize: "13px",
            padding: "4px 10px",
            borderRadius: "6px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          }}
        >
          Search failed. Please try again.
        </span>
      )}
    </div>
  );
};

const CoverageMap = () => {
  const [divisions, setDivisions] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadMapData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [divisionsResponse, warehousesResponse] = await Promise.all([
          fetch("/division.json"),
          fetch("/warehouses.json"),
        ]);

        if (!divisionsResponse.ok) {
          throw new Error(
            `Failed to load division.json (${divisionsResponse.status})`,
          );
        }

        if (!warehousesResponse.ok) {
          throw new Error(
            `Failed to load warehouses.json (${warehousesResponse.status})`,
          );
        }

        const [divisionsData, warehousesData] = await Promise.all([
          divisionsResponse.json(),
          warehousesResponse.json(),
        ]);

        if (!isMounted) {
          return;
        }

        setDivisions(divisionsData);
        setWarehouses(normalizeWarehouses(warehousesData));
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to load map data",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMapData();

    return () => {
      isMounted = false;
    };
  }, []);

  const center = useMemo(() => {
    const firstValidWarehouse = warehouses.find((warehouse) =>
      Boolean(getWarehouseCoordinates(warehouse)),
    );

    return firstValidWarehouse
      ? getWarehouseCoordinates(firstValidWarehouse)
      : DEFAULT_CENTER;
  }, [warehouses]);

  if (isLoading) {
    return <div>Loading coverage map...</div>;
  }

  if (error) {
    return <div>Unable to load coverage map: {error}</div>;
  }

  return (
    <MapContainer
      className="mt-10 mb-10"
      center={center}
      zoom={DEFAULT_ZOOM}
      style={{ height: "700px", width: "100%", position: "relative" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapSearch />

      {divisions && (
        <GeoJSON
          data={divisions}
          style={{
            color: "#2563eb",
            weight: 1.5,
            fillColor: "#60a5fa",
            fillOpacity: 0.2,
          }}
        />
      )}

      {warehouses.map((warehouse, index) => {
        const position = getWarehouseCoordinates(warehouse);

        if (!position) {
          return null;
        }

        const warehouseName =
          warehouse?.name ??
          warehouse?.Name ??
          warehouse?.city ??
          warehouse?.district ??
          `Warehouse ${index + 1}`;

        return (
          <Marker
            key={warehouse?.id ?? warehouse?.name ?? warehouse?.city ?? index}
            position={position}
          >
            <Popup>{warehouseName}</Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default CoverageMap;
