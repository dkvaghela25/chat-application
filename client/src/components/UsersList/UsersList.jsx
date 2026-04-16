import { useEffect, useRef, useState } from "react";
import { searchUser } from "../../api/user";
import DisplayUsers from "./DisplayUsers";
import { IoMdSearch } from "react-icons/io";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { useSocketContext } from "../../contexts/socketContext";
import GroupModal from "./GroupModal";
import SearchInput from "../ui/SearchInput";

const UsersList = () => {

    const { socket } = useSocketContext();
    const searchResultsRef = useRef(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [conversationList, setConversationList] = useState([]);

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    useEffect(() => {
        if (!socket) return;
        const callback = (data) => {
            setConversationList(data)
        };
        socket.on("conversationList", callback);
        return () => socket.off("conversationList", callback)
    }, []);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (!searchInput.trim()) {
                setSearchResults([]);
                return;
            }
            const res = await searchUser(searchInput);
            if (res.success) setSearchResults(res.users);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchInput]);

    useEffect(() => {
        const handleClick = (e) => {
            if (searchResultsRef.current && !searchResultsRef.current.contains(e.target)) {
                setSearchResults([]);
                setSearchInput("");
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleSearchClick = async (user) => {
        if (!socket) return console.error("Socket not connected");
        await socket.emit("joinRoom", { receiver: user.username });
        setSearchResults([]);
        setSearchInput("");
    };

    const handleListClick = (user) => {
        if (!socket) return console.error("Socket not connected");
        if (user.isGroup) {
            socket.emit("joinRoom", { roomId: user.roomId });
        } else {
            socket.emit("joinRoom", { receiver: user.username });
        }
    };

    return (
        <>
            <div className="w-full flex flex-col bg-white/80 backdrop-blur-md border md:border-slate-200 shadow-xl h-full overflow-hidden">
                <header className="p-4 md:p-6 bg-white border-b border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-5">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                                Team
                            </h2>
                        </div>

                        <button
                            onClick={() => setIsGroupModalOpen(true)}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-indigo-200 flex items-center justify-center group"
                            title="Create New Group"
                        >
                            <AiOutlineUsergroupAdd className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <div className="relative group">
                        <div className="relative">
                            <SearchInput searchInput={searchInput} setSearchInput={setSearchInput} placeholder="Find a teammate..." />
                            {searchInput.length > 0 && (
                                <div ref={searchResultsRef} className="absolute z-20 shadow-md rounded-xl mt-2 bg-white w-full animate-in fade-in slide-in-from-top-2 duration-200 border border-slate-100">
                                    <p className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Search Results
                                    </p>
                                    {searchResults.length > 0 ? (
                                        <div className="max-h-90 overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400"><DisplayUsers userList={searchResults} handleJoin={handleSearchClick} /></div>
                                    ) : (
                                        <p className="px-6 py-4 text-sm text-slate-500 italic">No members found.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 custom-scrollbar bg-white">
                    <p className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Your Conversations
                    </p>
                    <DisplayUsers handleJoin={handleListClick} userList={conversationList} />
                </div>

            </div>

            {isGroupModalOpen && <GroupModal setIsGroupModalOpen={setIsGroupModalOpen} />}

        </>
    );
};

export default UsersList;