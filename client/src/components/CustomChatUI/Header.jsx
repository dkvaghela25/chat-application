import { HiDotsVertical, HiOutlineSearch } from "react-icons/hi";
import { useSocketContext } from "../../contexts/socketContext";
import { useEffect, useState } from "react";
import SearchInput from "../ui/SearchInput";
import { searchMessage } from "../../api/message";
import { IoMdClose } from "react-icons/io";

const Header = ({ setActiveChatDetailsIsOpen, setHighlightedMessageId }) => {
    const { activeChat } = useSocketContext();
    const [displayId, setDisplayId] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([])

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
                    <div className="ml-auto flex gap-2">

                        <div className="relative">
                            <button type="button" onClick={() => handleToggle("search-modal")} className="relative p-2 rounded-full hover:bg-slate-100">
                                <HiOutlineSearch size={20} />
                            </button>
                            {displayId === "search-modal" && activeChat && (
                                <>
                                    <div className="absolute top-8 right-0 mt-3 w-100 p-3 bg-white rounded-lg text-slate-700 shadow-xl border border-slate-100 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex justify-between items-center mb-3 font-semibold border-b border-slate-300 pb-2">
                                            <span>Find in chat</span>
                                            <IoMdClose size={20} onClick={() => handleToggle(false)} />
                                        </div>
                                        <SearchInput searchInput={searchInput} setSearchInput={setSearchInput} placeholder="Search in this chat..." />
                                        {searchResults.length === 0
                                            ? <div className="flex flex-col gap-3 items-center p-15 text-center">
                                                <div className="text-xl font-semibold">Search in this chat</div>
                                                <div>Find messages and links shared in this chat.</div>
                                            </div>
                                            : <div
                                                className="flex flex-col max-h-100 overflow-y-auto mt-3"
                                            >
                                                {searchResults.map((msg) => (
                                                    <div
                                                        key={msg._id}
                                                        onClick={() => highlightMessage(msg._id)}
                                                        className="p-3 border-b first:border-t border-slate-200 hover:bg-slate-50 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-xs ">
                                                                {msg.sender}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">
                                                                {new Date(msg.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-700 font-semibold line-clamp-2">
                                                            {msg.text}
                                                        </p>
                                                        {msg.attachments?.length > 0 && (
                                                            <span className="text-[10px] text-indigo-400 italic">
                                                                {msg.attachments.length} attachment(s)
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                        }
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="relative">
                            <button type="button" onClick={() => handleToggle("menu-modal")} className="p-2 rounded-full hover:bg-slate-100">
                                <HiDotsVertical size={20} />
                            </button>
                            {displayId === "menu-modal" && activeChat && (
                                <>
                                    <div className="absolute top-8 right-0 mt-3 w-48 bg-white rounded-lg text-slate-700 font-semibold shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">

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