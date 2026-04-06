import { useEffect, useState } from "react";
import { socket } from "../socket";

const UsersList = () => {

    const [userList, setUserList] = useState([]);

    useEffect(() => {
        const callback = (data) => setUserList(data);
        socket.on("userList", callback);
        return () => socket.off("userList", callback)
    })

    console.log("userList........................", userList)

    return (
        <div className="w-[25%] flex flex-col mx-auto backdrop-blur-xl border border-slate-300 rounded-xl overflow-hidden shadow-2xl">
            <header className="px-6 py-4 border-b border-slate-300">
                <h2 className="text-xl font-semibold">Users List</h2>
            </header>
        </div>
    );
};

export default UsersList;