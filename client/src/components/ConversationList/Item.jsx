import { IoPersonRemoveSharp } from "react-icons/io5";
import { useSocketContext } from "../../contexts/socketContext";
import UIAvatar from "../ui/UIAvatar";

const Item = ({ item, handleJoin, handleRemove }) => {

    const { user: currentUser } = useSocketContext();
    const username = currentUser?.username;

    return (
        <div
            key={item.roomId || item._id || item.username}
            onClick={handleJoin ? () => handleJoin(item) : null}
            className={`group flex items-center gap-4 px-4 py-3 mx-2 rounded-xl transition-all duration-200 
                            ${handleJoin ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}
        >
            <div className="relative shrink-0">
                <UIAvatar name={item.name} userId={item._id} />
                {Object.prototype.hasOwnProperty.call(item, "online") && (
                    <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white 
                                    ${item.online ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                        {item.name}
                        {!item.isGroup && item.username === username && (
                            <span className="ml-1 text-slate-400 font-normal">(You)</span>
                        )}
                    </h3>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {item.isGroup
                        ? `${item.members?.length || 0} members`
                        : Object.prototype.hasOwnProperty.call(item, "online")
                            ? (item.online ? 'Active now' : 'Offline')
                            : `@${item.username}`}
                </p>
            </div>

            {(handleRemove && item.username !== username) && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item._id);
                    }}
                    className="p-2.5 cursor-pointer rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 active:scale-90"
                    title="Remove Member"
                >
                    <IoPersonRemoveSharp size={18} />
                </button>
            )}
        </div>
    );
};

export default Item;