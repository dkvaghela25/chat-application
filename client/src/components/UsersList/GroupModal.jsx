import { useEffect, useState } from "react";
import { fetchAllUser, searchUser } from "../../api/user";
import { useSocketContext } from "../../contexts/socketContext";
import { IoMdSearch } from "react-icons/io";
import SearchInput from "../ui/SearchInput";

const GroupModal = ({ setIsGroupModalOpen, groupDetails }) => {
    const { socket, username } = useSocketContext();

    const [searchInput, setSearchInput] = useState("");
    const [options, setOptions] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [groupName, setGroupName] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (groupDetails) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGroupName(groupDetails.name);
        }
    }, [groupDetails]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            const res = searchInput.trim()
                ? await searchUser(searchInput)
                : await fetchAllUser();

            if (res.success) {
                const existingMembers = groupDetails?.members?.map(m => m.username) || [];
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

                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800">{groupDetails ? "Add Members" : "Create New Group"}</h3>
                    <p className="text-sm text-slate-500">Search and select people to add.</p>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Group Name <span className='text-red-500'>*</span></label>
                        <input
                            disabled={!!groupDetails}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="e.g. Project X"
                            className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${errors.groupName ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-indigo-500 bg-slate-50/50'}`}
                        />
                        {errors.groupName && <p className='text-xs text-red-500 mt-1 ml-1 font-medium'>{errors.groupName}</p>}
                    </div>

                    <SearchInput searchInput={searchInput} setSearchInput={setSearchInput} placeholder="Search by name or username..." />

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <div className="max-h-40 overflow-y-auto  [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 divide-y divide-slate-50 custom-scrollbar">
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