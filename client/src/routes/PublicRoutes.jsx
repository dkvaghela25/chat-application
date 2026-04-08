import { Outlet, Navigate } from "react-router-dom";

const PublicRoutes = () => {
    const userName  = localStorage.getItem("userName");

    if (userName) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />

};

export default PublicRoutes;