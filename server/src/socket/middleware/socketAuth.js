import jwt from "jsonwebtoken";

const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decoded) {
            throw new Error("Unauthorized");
        }

        socket.userId = decoded.userId;

        console.log("User authenticated with ID:", socket.userId);

        next();
    } catch (err) {
        next(new Error("Unauthorized"));
    }
}

export { socketAuth };