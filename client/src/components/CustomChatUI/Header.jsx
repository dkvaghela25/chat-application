import { HiDotsVertical } from "react-icons/hi";
import { useSocketContext } from "../../contexts/socketContext";
import { useState } from "react";

const Header = ({ setActiveChatDetailsIsOpen }) => {
    const { activeChat } = useSocketContext();
    const [isOpen, setIsOpen] = useState(false);

    if (!activeChat) return null;

    return (
        <>
            <header className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center">
                <div className="w-full flex items-center gap-3">
                    <img
                        className="rounded-full w-12 h-12 shadow-sm border border-slate-100"
                        src={`https://ui-avatars.com/api/?name=${activeChat?.name}&background=random&color=fff&bold=true`}
                        alt={activeChat?.name}
                    />
                    <div>
                        <h2 className="text-slate-800 font-bold tracking-tight">{activeChat.name}</h2>
                        {activeChat.isGroup ? (
                            <p className="text-[11px] text-slate-400 font-medium truncate">
                                {(activeChat.members?.length || 0)} members
                            </p>
                        ) : (
                            <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                                <span className={`h-1.5 w-1.5 ${activeChat.online ? 'bg-emerald-500' : 'bg-slate-300'} rounded-full animate-pulse`}></span>
                                <p className="text-[11px] text-slate-400 font-medium truncate">
                                    {activeChat.online ? 'Active now' : 'Offline'}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="ml-auto">
                        <button type="button" onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-slate-100">
                            <HiDotsVertical />
                        </button>

                        {isOpen && activeChat && (
                            <>
                                <div className="absolute top-15 right-6 mt-3 w-48 bg-white rounded-lg text-slate-700 font-semibold shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">

                                    <button
                                        onClick={() => { setActiveChatDetailsIsOpen(true); setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                    >
                                        <span> {activeChat.isGroup ? "Group Details" : "User Details"}</span>
                                    </button>

                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;