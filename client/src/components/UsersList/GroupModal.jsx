import { useEffect, useState } from "react";
import { fetchAllUser } from "../../api/user";
import { useSocketContext } from "../../contexts/socketContext";

const GroupModal = ({ setIsGroupModalOpen, groupDetails }) => {
    const [options, setOptions] = useState([]);
    const { socket, username } = useSocketContext()

    const initialData = {
        groupName: "",
        members: [],
    };

    const [formData, setFormData] = useState();
    const [errors, setErrors] = useState({});

    const initializeFormData = async () => {
        if (groupDetails) {
            setFormData({
                groupName: groupDetails.name,
                members: []
            })
        }
        else {
            setFormData(initialData)
        }
    }

    useEffect(() => {
        initializeFormData();
    }, [])

    useEffect(() => {
        const getOptions = async () => {
            const res = await fetchAllUser();
            if (res.success) {
                const existingMembers = groupDetails?.members?.map(m => m.username) || [];
                setOptions(res.users.filter((user) => (user.username !== username && !existingMembers.includes(user.username))));
            }
        };
        getOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        const { name, value, type, options: selectOptions } = e.target;

        if (type === "select-multiple") {
            const selectedValues = Array.from(selectOptions)
                .filter(opt => opt.selected)
                .map(opt => opt.value);
            setFormData(prev => ({ ...prev, [name]: selectedValues }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        let tempErrors = {};

        if (!formData.groupName.trim()) tempErrors.groupName = "Group Name is required";
        if (formData.members.length === 0) tempErrors.members = "Select at least one member";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (groupDetails) {
            // Hello
            socket.emit("addMember", { roomId: groupDetails?.roomId, newMembers: formData.members });
        } else {
            socket.emit("createGroup", formData);
        }

        setIsGroupModalOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <form
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                onSubmit={handleSubmit}
            >
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800">Create New Group</h3>
                    <p className="text-sm text-slate-500">Organize your team and start chatting.</p>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                            Group Name
                        </label>
                        <input
                            disabled={groupDetails}
                            name="groupName"
                            value={formData?.groupName}
                            onChange={handleChange}
                            type="text"
                            placeholder="e.g. Design Team"
                            className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all duration-200 
                                ${errors.groupName ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-slate-50/50'}`}
                        />
                        {errors.groupName && <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">{errors.groupName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                            Add Members
                        </label>
                        <select
                            name="members"
                            value={formData?.members}
                            onChange={handleChange}
                            multiple
                            size={1}
                            className={`w-full px-2 py-2 rounded-xl border outline-none transition-all duration-200 
                                ${errors.members ? 'border-red-400' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-slate-50/50'}`}
                        >
                            {options.map(opt => (
                                <option
                                    key={opt.username}
                                    value={opt.username}
                                    className="p-2 m-1 accent-indigo-600"
                                >
                                    {opt.name} (@{opt.username})
                                </option>
                            ))}
                        </select>
                        {errors.members && <p className="text-xs font-medium text-red-500"> {errors.members}</p>}

                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setIsGroupModalOpen(false)}
                        className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {groupDetails ? "Add Member" : "Create Group"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GroupModal;