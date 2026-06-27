import { createBrowserRouter } from "react-router";
import Home from "../Home/Home";
import { CoverageMap } from "../Coverage";
import RootLayout from "../../pages/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
<<<<<<< HEAD
    element: <App></App>,
    children:[
=======
    element: <RootLayout />,
    children: [
>>>>>>> feature-ai-agent
      {
        index: true,
        element: <Home />,
      },
<<<<<<< HEAD
    ]
=======
      {
        path: "/coverage",
        element: <CoverageMap></CoverageMap>,
      }
    ],
>>>>>>> feature-ai-agent
  },
]);