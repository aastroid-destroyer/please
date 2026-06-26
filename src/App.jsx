import { Outlet } from "react-router";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import "./App.css";

function App() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 w-11/12 mx-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
