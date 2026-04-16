import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = () => {
    
    const username = localStorage.getItem("username");

    if (!username) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;