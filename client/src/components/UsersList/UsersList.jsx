import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import { searchUser } from "../../api/user";
import DisplayUsers from "./DisplayUsers";
import { IoMdSearch } from "react-icons/io";

const UsersList = ({ setReceiver }) => {

    const searchResultsRef = useRef(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        const callback = (data) => setUserList(data);
        socket.on("userList", callback);
        return () => socket.off("userList", callback);
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
                setSearchResults(false);
                setSearchInput("");
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <aside className="w-[30%] hidden md:flex flex-col bg-slate-50 border-r border-slate-200 h-full overflow-hidden">
            <header className="p-6 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        Team
                    </h2>
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                        {userList.length} Online
                    </span>
                </div>

                <div className="relative group">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IoMdSearch className="h-4 w-4 text-slate-900 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            type="text"
                            placeholder="Find a teammate..."
                            className="bg-slate-100 border-none rounded-xl w-full py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 outline-none"
                        />
                        {searchInput.length > 0 && (
                            <div ref={searchResultsRef} className="absolute z-20 shadow-md rounded-xl mt-5 bg-white w-full animate-in fade-in slide-in-from-top-2 duration-200">
                                <p className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    Search Results
                                </p>
                                {searchResults.length > 0 ? (
                                    <DisplayUsers userList={searchResults} setReceiver={setReceiver} />
                                ) : (
                                    <p className="px-6 py-4 text-sm text-slate-500 italic">No members found.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <p className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Recent Conversations
                </p>
                <DisplayUsers userList={userList} setReceiver={setReceiver} />
            </div>
        </aside>
    );
};

export default UsersList;