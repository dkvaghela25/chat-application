import { Outlet, Navigate } from "react-router-dom";

const PublicRoutes = () => {
    const username  = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (username && token) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />

};

export default PublicRoutes;