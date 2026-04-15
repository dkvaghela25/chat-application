import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatMessages from "./pages/ChatMessages";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import { ToastContainer } from "react-toastify";

const App = () => {

  const router = createBrowserRouter([
    {
      element: <PublicRoutes />,
      children: [
        {
          path: "/login",
          element: <LoginPage />
        },
        {
          path: "/register",
          element: <RegistrationPage />
        },
      ]
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
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
};

export default App;