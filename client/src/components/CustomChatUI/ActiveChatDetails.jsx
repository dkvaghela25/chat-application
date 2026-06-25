import { useEffect, useState } from "react";
import { useSocketContext } from "../../contexts/socketContext";
import { BiMessageDetail, BiUser, BiEnvelope, BiTime, BiHash } from "react-icons/bi";
import { GoDeviceCameraVideo } from "react-icons/go";
import { IoCallOutline, IoClose } from "react-icons/io5";
import { fetchUserDetails } from "../../api/user";
import { fetchGroupDetails, removeMemberFromGroup } from "../../api/room";
import DisplayUsers from "../ConversationList/DisplayUsers";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import GroupModal from "../ConversationList/GroupModal";
import UIAvatar from "../ui/UIAvatar";

const ActiveChatDetails = ({ setActiveChatDetailsIsOpen }) => {

    const { socket, roomId, activeChat, user } = useSocketContext();
    const [activeChatDetails, setActiveChatDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    const userId = user?._id;

    const getActiveChatDetails = async () => {
        setLoading(true);

        if (roomId.startsWith("group")) {
            const res = await fetchGroupDetails(roomId);
            if (res.success) {
                setActiveChatDetails(res.roomDetails);
            }
        } else {
            const res = await fetchUserDetails(activeChat.username);
            if (res.success) {
                setActiveChatDetails(res.userDetails);
            }
        }

        setLoading(false);
    }

    useEffect(() => {

        const handleMemberRemoved = (data) => {
            setActiveChatDetails((prev) => {
                if (prev.roomId !== data.roomId) return prev;
                const updatedMembers = prev.members.filter((member) => member._id !== data.memberId);
                return {
                    ...prev,
                    members: updatedMembers,
                };
            })
        }

        const handleNewMembersAdded = (data) => {
            setActiveChatDetails((prev) => {
                if (prev.roomId !== data.roomId) return prev;
                const updatedMembers = [...prev.members, ...data.newMembers];
                return {
                    ...prev,
                    members: updatedMembers,
                };
            })
        }

        socket.on("newMembersAdded", handleNewMembersAdded)
        socket.on("memberRemoved", handleMemberRemoved)
        return () => {
            socket.off("newMembersAdded", handleNewMembersAdded)
            socket.off("memberRemoved", handleMemberRemoved)
        }
    })

    useEffect(() => {
        if (!activeChat) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getActiveChatDetails();
    }, [activeChat.username]);

    // Helper to format the Date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const handleRemove = async (memberId) => {
        try {
            await removeMemberFromGroup(roomId, memberId);
        } catch (error) {
            console.error("Error removing member:", error);
        }
    }

    return (
        <>
            <div className="w-full h-full bg-white flex flex-col justify-between p-6 md:p-15 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 ">
                <div>
                    <button
                        onClick={() => setActiveChatDetailsIsOpen(false)}
                        className="cursor-pointer absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <IoClose size={24} />
                    </button>

                    <div className="">
                        <div className="flex flex-col md:flex-row items-center gap-5">
                            <div className="relative">
                                <UIAvatar name={activeChatDetails?.name} userId={activeChatDetails?._id} size="xl" />
                                {!activeChatDetails?.isGroup && (
                                    <span className={`absolute bottom-0 -right-1 h-6 w-6 rounded-full border-4 border-white 
                                    ${activeChatDetails?.online ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    />
                                )}
                            </div>
                            <div className="text-center md:text-left space-y-3">
                                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{activeChatDetails?.name}</h2>
                                <div className="flex text-2xl gap-8 items-center justify-center md:justify-start text-slate-400">
                                    <BiMessageDetail
                                        className="hover:text-indigo-600 cursor-pointer transition-colors"
                                        onClick={() => setActiveChatDetailsIsOpen(false)}
                                    />
                                    <GoDeviceCameraVideo className="hover:text-indigo-600 cursor-pointer transition-colors" />
                                    <IoCallOutline className="hover:text-indigo-600 cursor-pointer transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col flex-1 gap-3">
                    <div className={`w-full flex justify-between items-baseline ${!activeChatDetails?.isGroup ? "mt-10" : ""}`}>
                        <h3 className={`text-sm font-bold uppercase tracking-wider text-slate-400 `}>{activeChatDetails?.isGroup ? "Group Members" : "User Details"}</h3>
                        {activeChatDetails?.adminId === userId && <button
                            onClick={() => setIsGroupModalOpen(true)}
                            className="cursor-pointer p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-indigo-200 flex items-center justify-center"
                            title="Add New Member"
                        >
                            <AiOutlineUsergroupAdd className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </button>}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-5">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : activeChatDetails ? (
                        <div className={`flex flex-col gap-y-6 gap-x-10 flex-1 ${activeChatDetails?.isGroup ? "justify-between" : ""}`}>
                            {activeChatDetails.isGroup
                                ? <>
                                    <div className="flex-1 max-h-90 -ml-5 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-400">
                                        <DisplayUsers items={activeChatDetails.members} handleRemove={activeChatDetails.adminId === userId ? handleRemove : null} />
                                    </div>
                                    <DetailItem icon={<BiTime />} label="Created On" value={formatDate(activeChatDetails?.createdAt)} />
                                </>
                                : <>
                                    <DetailItem icon={<BiUser />} label="Username" value={`@${activeChatDetails?.username}`} />
                                    <DetailItem icon={<BiEnvelope />} label="Email Address" value={activeChatDetails?.email} />
                                    <DetailItem icon={<BiTime />} label="Joined On" value={formatDate(activeChatDetails?.createdAt)} />
                                </>
                            }
                        </div>
                    ) : (
                        <p className="text-center text-slate-500">Failed to load user details.</p>
                    )}
                </div>
            </div>

            {isGroupModalOpen && <GroupModal setIsGroupModalOpen={setIsGroupModalOpen} groupDetails={activeChatDetails} />}
        </>
    );
};

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-1 text-indigo-500 text-xl">
            {icon}
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">{label}</p>
            <p className="text-slate-700 font-medium break-all">{value}</p>
        </div>
    </div>
);

export default ActiveChatDetails;