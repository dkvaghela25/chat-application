import { useEffect, useRef, useState } from "react";
import DisplayUsers from "./DisplayUsers";
import { useSocketContext } from "../../contexts/socketContext";
import GroupModal from "./GroupModal";
import SearchInput from "../ui/SearchInput";
import { RiChatNewLine } from "react-icons/ri";
import { FiLogOut } from "react-icons/fi"; // Added logout icon
import { fetchConversationList } from "../../api/user";
import { useNavigate } from "react-router-dom";
import UIAvatar from "../ui/UIAvatar";

const ConversationList = () => {
    const { socket, user, joinRoom } = useSocketContext();
    const searchResultsRef = useRef(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [conversationList, setConversationList] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const navigate = useNavigate();

    const getConversationList = async () => {
        try {
            setLoadingConversations(true);
            const data = await fetchConversationList();
            if (data.success) {
                setConversationList(data.conversationList);
            } else {
                console.error("Failed to fetch conversation list:", data.message);
            }
        } catch (error) {
            console.error("Error fetching conversation list:", error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    useEffect(() => {
        if (!user) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getConversationList();
    }, [user]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (!searchInput.trim()) {
                setSearchResults([]);
                return;
            }

            const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escapeRegExp(searchInput), "i");
            const filteredData = conversationList.filter((curr) => {
                const matchesName = regex.test(String(curr.name ?? ""));
                return matchesName;
            });

            setSearchResults(filteredData);
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
        console.log("user", user);
        joinRoom({ roomId: user.roomId });
        setSearchResults([]);
        setSearchInput("");
    };

    const handleListClick = (user) => {
        joinRoom({ roomId: user.roomId });
    };

    useEffect(() => {
        const handleStatusChange = (statusData) => {
            setConversationList(prev => prev.map(conversation => {
                if (conversation.roomId === statusData.roomId) {
                    return {
                        ...conversation,
                        online: statusData.online
                    };
                } else {
                    return conversation;
                }
            }));
        };

        const handleNewGroupCreated = (groupData) => {
            setConversationList(prev => [groupData, ...prev]);
        };

        const handleNewChat = (chatData) => {
            setConversationList(prev => [chatData, ...prev]);
        };

        const handleReceiveMessage = (messageData) => {
            setConversationList(prev => {
                if (prev[0]?.roomId === messageData.roomId) return prev;
                const conversation = prev.find(item => item.roomId === messageData.roomId);
                if (!conversation) return prev;
                return [conversation, ...prev.filter(item => item.roomId !== messageData.roomId)];
            });
        };

        socket.on("userStatusChanged", handleStatusChange);
        socket.on("newGroupCreated", handleNewGroupCreated);
        socket.on("newChatStarted", handleNewChat);
        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("userStatusChanged", handleStatusChange);
            socket.off("newGroupCreated", handleNewGroupCreated);
            socket.off("newChatStarted", handleNewChat);
            socket.off("receiveMessage", handleReceiveMessage);
        };

    }, [conversationList, socket]);

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
                            className="cursor-pointer p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-indigo-200 flex items-center justify-center group"
                            title="Start New Chat"
                        >
                            <RiChatNewLine className="h-5 w-5 group-hover:scale-110 transition-transform" />
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
                                        <div className="max-h-90 overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400"><DisplayUsers items={searchResults} handleJoin={handleSearchClick} /></div>
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
                    <DisplayUsers handleJoin={handleListClick} items={conversationList} loading={loadingConversations} />
                </div>

                <footer className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    {!user
                        ? <div className="group flex items-center gap-4 rounded-xl transition-all duration-200 animate-pulse">
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
                        : <div className="flex items-center gap-3">
                            {user?.name ? <UIAvatar name={user?.name} userId={user?._id} /> : null}
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 truncate max-w-30">
                                    {user?.name}
                                </span>
                                <span className="text-[12px] font-medium text-slate-500 truncate max-w-30">
                                    @{user?.username}
                                </span>
                            </div>
                        </div>}
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center justify-center"
                        title="Logout"
                    >
                        <FiLogOut className="h-5 w-5" />
                    </button>
                </footer>
            </div>

            {isGroupModalOpen && <GroupModal conversationList={conversationList} setIsGroupModalOpen={setIsGroupModalOpen} />}
        </>
    );
};

export default ConversationList;