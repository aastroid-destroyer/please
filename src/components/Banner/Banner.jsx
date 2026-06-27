import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

import banner1 from "../../assets/banner/banner1.png";
import banner2 from "../../assets/banner/banner2.png";
import banner3 from "../../assets/banner/banner3.png";

const banners = [banner1, banner2, banner3];

const Banner = () => {
  return (
    <Carousel
      autoPlay
      infiniteLoop
      interval={3000}
      transitionTime={600}
      showArrows={false}
      showThumbs={false}
      showStatus={false}
      stopOnHover={false}
    >
      {banners.map((src, i) => (
        <div key={i}>
          <img
            src={src}
            alt={`ZapShift banner ${i + 1}`}
            className="w-full object-cover"
          />
        </div>
      ))}
    </Carousel>
  );
};

export default Banner;
