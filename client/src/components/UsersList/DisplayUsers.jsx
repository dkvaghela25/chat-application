import { useSocketContext } from "../../contexts/socketContext";

const DisplayUsers = ({ userList, setSearchResults, setSearchInput }) => {

    const { socket, username } = useSocketContext();

    const handleClick = (user) => {
        if (!socket) return console.error("Socket not connected");
        console.log("user.username............................................", user.username)
        socket.emit("joinRoom", { receiver: user.username });
        if (setSearchInput && setSearchInput) {
            setSearchResults(false);
            setSearchInput("");
        }
    };

    return (
        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-200">
            {userList.map((user) => (
                <div
                    key={user._id}
                    onClick={() => handleClick(user)}
                    className="group flex items-center gap-3 px-4 py-3 mx-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-all duration-200"
                >
                    <div className="relative">
                        <img className="rounded-full w-12 h-12" src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="" />

                        <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white 
                                ${user.online ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[14px] font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                                {user.name} {user.username === username && <span>(You)</span>}
                            </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                            {user.online ? 'Active now' : 'Offline'}
                        </p>
                    </div>

                </div>
            ))}
        </div>
    );
};

export default DisplayUsers;