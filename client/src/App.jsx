import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatMessages from "./pages/ChatMessages";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import LoginPage from "./pages/LoginPage";

const App = () => {

  const router = createBrowserRouter([
    {
      element: <PublicRoutes />,
      children: [{
        path: "/login",
        element: <LoginPage />
      }]
    },
    {
      element: <ProtectedRoutes />,
      children: [{
        path: "/",
        element: <ChatMessages />
      }]
    },
  ])

  return (
    <RouterProvider router={router} />
  );
};

export default App;