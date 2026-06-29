import { IoPersonRemoveSharp } from "react-icons/io5";
import Item from "./Item";

const DisplayUsers = ({ items, handleJoin, handleRemove, loading, removingId }) => {

    if (loading) return (
        Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="group flex items-center gap-4 px-4 py-3 mx-2 rounded-xl transition-all duration-200 animate-pulse">
                <div className="relative shrink-0">
                    <div className="rounded-full w-12 h-12 bg-slate-200" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="h-4 w-32 bg-slate-200 rounded-md" />
                    </div>
                    <div className="h-3 w-24 bg-slate-200 rounded-md mt-1" />
                </div>
            </div>
        ))
    )

    return (
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400">
            {items.map((item) => (
                <Item
                    key={item?.roomId || item?._id || item?.username}
                    item={item}
                    handleJoin={handleJoin}
                    handleRemove={handleRemove}
                    removingId={removingId}
                />
            ))}

            {items.length === 0 && (
                <div className="py-10 text-center">
                    <p className="text-sm text-slate-400 italic">No members found</p>
                </div>
            )}
        </div>
    );
};

export default DisplayUsers;