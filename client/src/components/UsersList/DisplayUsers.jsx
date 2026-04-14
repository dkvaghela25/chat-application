import { IoPersonRemoveSharp } from "react-icons/io5";
import { useSocketContext } from "../../contexts/socketContext";

const DisplayUsers = ({ userList, handleJoin, handleRemove }) => {
    const { username } = useSocketContext();

    return (
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
            {userList.map((user) => (
                <div
                    key={user.roomId || user._id || user.username}
                    onClick={handleJoin ? () => handleJoin(user) : null}
                    className={`group flex items-center gap-4 px-4 py-3 mx-2 rounded-xl transition-all duration-200 
                        ${handleJoin ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}
                >
                    {/* Avatar Section */}
                    <div className="relative shrink-0">
                        <img 
                            className="rounded-full w-12 h-12 shadow-sm border border-slate-100" 
                            src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&bold=true`} 
                            alt={user.name} 
                        />

                        {Object.prototype.hasOwnProperty.call(user, "online") && (
                            <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white 
                                ${user.online ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            />
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[14px] font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                                {user.name} 
                                {!user.isGroup && user.username === username && (
                                    <span className="ml-1 text-slate-400 font-normal">(You)</span>
                                )}
                            </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {user.isGroup
                                ? `${user.members?.length || 0} members`
                                : Object.prototype.hasOwnProperty.call(user, "online") 
                                    ? (user.online ? 'Active now' : 'Offline') 
                                    : `@${user.username}`}
                        </p>
                    </div>

                    {/* Action Section (Remove Button) */}
                    {(handleRemove && user.username !== username) && (
                        <button
                            onClick={(e) => { 
                                e.stopPropagation(); // Prevents handleJoin from firing
                                handleRemove(user.username);
                            }}
                            className="p-2.5 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 active:scale-90"
                            title="Remove Member"
                        >
                            <IoPersonRemoveSharp size={18} />
                        </button>
                    )}
                </div>
            ))}

            {userList.length === 0 && (
                <div className="py-10 text-center">
                    <p className="text-sm text-slate-400 italic">No members found</p>
                </div>
            )}
        </div>
    );
};

export default DisplayUsers;