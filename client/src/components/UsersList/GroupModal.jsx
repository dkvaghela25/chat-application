import { useEffect, useState } from "react";
import { fetchAllUser, searchUser } from "../../api/user"; // Ensure searchUser is imported
import { useSocketContext } from "../../contexts/socketContext";
import { IoMdSearch } from "react-icons/io";

const GroupModal = ({ setIsGroupModalOpen, groupDetails }) => {
    const { socket, username } = useSocketContext();
    
    const [searchInput, setSearchInput] = useState("");
    const [options, setOptions] = useState([]); // This will hold the filtered/searched list
    const [selectedMembers, setSelectedMembers] = useState([]); // Local state for selections
    
    const [groupName, setGroupName] = useState("");
    const [errors, setErrors] = useState({});

    // 1. Initialize data
    useEffect(() => {
        if (groupDetails) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGroupName(groupDetails.name);
        }
    }, [groupDetails]);

    // 2. Debounced Search Logic
    useEffect(() => {
        const handler = setTimeout(async () => {
            const res = searchInput.trim() 
                ? await searchUser(searchInput) 
                : await fetchAllUser();

            if (res.success) {
                const existingMembers = groupDetails?.members?.map(m => m.username) || [];
                // Filter out: Current User and already existing Group Members
                const filtered = res.users.filter((user) => (
                    user.username !== username && !existingMembers.includes(user.username)
                ));
                setOptions(filtered);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchInput, username, groupDetails]);

    const handleCheckboxChange = (user) => {
        const isSelected = selectedMembers.some(m => m.username === user.username);
        if (isSelected) {
            setSelectedMembers(prev => prev.filter(m => m.username !== user.username));
        } else {
            setSelectedMembers(prev => [...prev, user]);
        }
    };

    const validateForm = () => {
        let tempErrors = {};
        if (!groupName.trim()) tempErrors.groupName = "Group name is required";
        if (selectedMembers.length === 0) tempErrors.members = "Select at least one member";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const memberUsernames = selectedMembers.map(m => m.username);

        if (groupDetails) {
            socket.emit("addMember", { roomId: groupDetails?.roomId, newMembers: memberUsernames });
        } else {
            socket.emit("createGroup", { groupName, members: memberUsernames });
        }
        setIsGroupModalOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <form className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden" onSubmit={handleSubmit}>
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800">{groupDetails ? "Add Members" : "Create New Group"}</h3>
                    <p className="text-sm text-slate-500">Search and select people to add.</p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Group Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Group Name</label>
                        <input
                            disabled={!!groupDetails}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="e.g. Project X"
                            className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${errors.groupName ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-indigo-500 bg-slate-50/50'}`}
                        />
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <IoMdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>

                    {/* Users List */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <div className="max-h-40 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                            {options.map(user => (
                                <label key={user.username} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.some(m => m.username === user.username)}
                                        onChange={() => handleCheckboxChange(user)}
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="text-sm">
                                        <p className="font-medium text-slate-700">{user.name}</p>
                                        <p className="text-xs text-slate-400">@{user.username}</p>
                                    </div>
                                </label>
                            ))}
                            {options.length === 0 && <p className="p-4 text-center text-xs text-slate-400">No users found</p>}
                        </div>
                    </div>

                    {/* Selected Badges */}
                    {selectedMembers.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {selectedMembers.map(user => (
                                <span key={user.username} className="inline-flex items-center bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-1 rounded-md border border-indigo-100">
                                    {user.name}
                                    <button 
                                        type="button" 
                                        onClick={() => handleCheckboxChange(user)}
                                        className="ml-1.5 hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    {errors.members && <p className="text-xs font-medium text-red-500 ml-1">*{errors.members}</p>}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800">
                        Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-all active:scale-95">
                        {groupDetails ? "Add Members" : "Create Group"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GroupModal;