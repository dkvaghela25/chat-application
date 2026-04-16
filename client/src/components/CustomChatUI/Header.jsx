import { HiDotsVertical, HiOutlineSearch } from "react-icons/hi";
import { useSocketContext } from "../../contexts/socketContext";
import { useEffect, useState } from "react";
import SearchInput from "../ui/SearchInput";
import { searchMessage } from "../../api/message";
import { IoMdClose, IoMdArrowBack } from "react-icons/io";

const Header = ({ setActiveChatDetailsIsOpen, setHighlightedMessageId, setDisplayChat, displayChat }) => {
    const { activeChat, setRoomId, username } = useSocketContext();
    const [displayId, setDisplayId] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const handleToggle = (id) => {
        setDisplayId(prev => prev === id ? false : id)
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key == "f" && e.ctrlKey) {
                e.preventDefault();
                setDisplayId("search-modal")
            };
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (!searchInput.trim()) {
                setSearchResults([]);
                return;
            }
            const res = await searchMessage(searchInput, activeChat.roomId);
            if (res.success) setSearchResults(res.messages);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchInput]);

    const highlightMessage = (messageId) => {
        setHighlightedMessageId(messageId);
        setDisplayId(false)

        setTimeout(() => {
            setHighlightedMessageId(null);
        }, 3000);

    }

    if (!activeChat) return null;

    return (
        <>
            <header className="px-4 py-4 md:px-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
                <div className="w-full h-full flex items-center gap-2 md:gap-3">
                    <button 
                        onClick={() => setRoomId(null)}
                        className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                        <IoMdArrowBack size={24} />
                    </button>
                    <img
                        className="rounded-full w-10 h-10 md:w-12 md:h-12 shadow-sm border border-slate-100"
                        src={`https://ui-avatars.com/api/?name=${activeChat?.name}&background=random&color=fff&bold=true`}
                        alt={activeChat?.name}
                    />

                    <div className="flex-1 min-w-0">
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

                    <div className="hidden sm:flex ml-2 md:ml-5 gap-3 md:gap-5 text-sm font-semibold h-full items-center">
                        <span onClick={() => setDisplayChat(true)} className={`py-3 cursor-pointer ${displayChat ? "border-b-2 border-indigo-600 text-indigo-600" : ""}`}>Chat</span>
                        <span onClick={() => setDisplayChat(false)} className={`py-3 cursor-pointer ${!displayChat ? "border-b-2 border-indigo-600 text-indigo-600" : ""}`}>Attachments</span>
                    </div>

                    <div className="ml-auto flex gap-1 md:gap-2">

                        <div className="relative">
                            <button type="button" onClick={() => handleToggle("search-modal")} className="cursor-pointer relative p-2 rounded-full hover:bg-slate-100">
                                <HiOutlineSearch size={20} />
                            </button>
                            {displayId === "search-modal" && activeChat && (
                                <>
                                    <div className="absolute top-10 right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[400px] p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 z-30 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                                            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Find in chat</span>
                                            <button 
                                                onClick={() => handleToggle(false)}
                                                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                            >
                                                <IoMdClose size={20} />
                                            </button>
                                        </div>
                                        <SearchInput searchInput={searchInput} setSearchInput={setSearchInput} placeholder="Search messages..." />
                                        
                                        {searchResults.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                    <HiOutlineSearch size={32} />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-700 mb-1">Search Messages</h3>
                                                <p className="text-sm text-slate-400">Find specific messages, links, and text shared in this conversation.</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col max-h-[400px] overflow-y-auto mt-4 pr-1 -mr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full gap-2">
                                                {searchResults.map((msg) => (
                                                    <div
                                                        key={msg._id}
                                                        onClick={() => highlightMessage(msg._id)}
                                                        className="p-3 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 cursor-pointer transition-all group"
                                                    >
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
                                                                {msg.sender === activeChat?.name ? msg.sender : (msg.sender === username ? "You" : msg.sender)}
                                                            </span>
                                                            <span className="text-[10px] font-medium text-slate-400">
                                                                {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 line-clamp-2 leading-snug">
                                                            {msg.text}
                                                        </p>
                                                        {msg.attachments?.length > 0 && (
                                                            <div className="mt-2 text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                                {msg.attachments.length} attachment{msg.attachments.length > 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="relative">
                            <button type="button" onClick={() => handleToggle("menu-modal")} className="cursor-pointer p-2 rounded-full hover:bg-slate-100">
                                <HiDotsVertical size={20} />
                            </button>
                            {displayId === "menu-modal" && activeChat && (
                                <>
                                    <div className="absolute top-8 right-0 mt-3 w-48 bg-white rounded-lg text-slate-700 font-semibold shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                        
                                        <button
                                            onClick={() => { setDisplayChat(true); handleToggle("menu-modal"); }}
                                            className="sm:hidden w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <span>Chat View</span>
                                        </button>
                                        <button
                                            onClick={() => { setDisplayChat(false); handleToggle("menu-modal"); }}
                                            className="sm:hidden w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <span>Attachments</span>
                                        </button>

                                        <button
                                            onClick={() => { setActiveChatDetailsIsOpen(true); handleToggle("menu-modal"); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <span> {activeChat.isGroup ? "Group Details" : "User Details"}</span>
                                        </button>

                                    </div>
                                </>
                            )}
                        </div>


                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;