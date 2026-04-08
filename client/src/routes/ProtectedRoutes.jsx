import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = () => {
    
    const userName = localStorage.getItem("userName")

    if (!userName) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;