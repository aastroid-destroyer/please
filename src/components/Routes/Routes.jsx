import { createBrowserRouter, RouterProvider } from "react-router";
import App from "../../App";
import Home from "../Home/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

