import { createBrowserRouter } from "react-router";
import App from "../../App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Add child routes here, e.g.:
      // { index: true, element: <Home /> },
      // { path: "shifts", element: <Shifts /> },
    ],
  },
]);
