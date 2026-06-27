import { createBrowserRouter } from "react-router";
import Home from "../Home/Home";
import { CoverageMap } from "../Coverage";
import RootLayout from "../../pages/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [

      {
        index: true,
        element: <Home />,
      },
      {
        path: "/coverage",
        element: <CoverageMap></CoverageMap>,
      }

    ]

  },
]);