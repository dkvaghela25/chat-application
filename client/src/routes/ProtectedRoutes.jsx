import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = () => {
    
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!username && !token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;