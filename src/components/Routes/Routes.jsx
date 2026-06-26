import { createBrowserRouter, RouterProvider } from "react-router";
import App from "../../App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

const Routes = () => {
  return <RouterProvider router={router} />;
};

export default Routes;
