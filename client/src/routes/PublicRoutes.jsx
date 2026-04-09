import { Outlet, Navigate } from "react-router-dom";

const PublicRoutes = () => {
    const username  = localStorage.getItem("username");

    if (username) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />

};

export default PublicRoutes;