import { useEffect, useRef } from "react";
import { useSocketContext } from "../../contexts/socketContext";

import { IoSend } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import CodeEditor from "./Footer/CodeEditor";
import Attachment from "./Attachment";
import { useState } from "react";

const Chat = ({ messages, highlightedMessageId, isTyping }) => {

    const messagesEndRef = useRef(null);
    const { activeChat, user, roomId, socket } = useSocketContext();
    const username = user?.username;
    const userId = user?._id;
    const members = activeChat?.members || [];

    const isActiveChatMember = members.includes(userId);
    const [isActiveChatMemberState, setIsActiveChatMemberState] = useState(isActiveChatMember);

    const getSenderUsername = (sender) => typeof sender === "object" ? sender?.username : sender;

    useEffect(() => {
        if (highlightedMessageId) {
            const element = document.getElementById(highlightedMessageId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [highlightedMessageId]);

    useEffect(() => {
        if (!messagesEndRef.current) return;
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        const handleMemberRemoved = (data) => {
            console.log("🚀 ~ handleMemberRemoved ~ data:", data)

            if (data.roomId === roomId) {
                setIsActiveChatMemberState(false);
            }
        }

        socket.on("removedFromGroup", handleMemberRemoved);

        return () => {
            socket.off("removedFromGroup", handleMemberRemoved);
        };
    }, []);

    return (
        <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 ">
                {messages?.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-100 p-4 rounded-full mb-3">
                            <IoSend className="-rotate-45 opacity-20" size={30} />
                        </div>
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs">Start the conversation below</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const senderUsername = getSenderUsername(msg.sender);
                        const isMe = senderUsername === username;
                        const isHighlighted = highlightedMessageId === msg._id;

                        if (msg.type === "notification") {
                            return (
                                <div
                                    key={msg._id || `${msg.sender}-${msg.createdAt}-${index}`}
                                    className="flex justify-center"
                                >
                                    <div className="px-4 py-2.5 rounded-2xl max-w-[82%] shadow-sm bg-slate-100 text-slate-400 text-xs italic">
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                id={msg._id}
                                key={msg._id || `${msg.sender}-${msg.createdAt}-${index}`}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-2">
                                    {isMe ? 'You' : activeChat?.isGroup ? senderUsername : activeChat?.name}
                                </span>
                                <div
                                    className={`px-4 py-2.5 rounded-2xl max-w-[82%] shadow-sm transition-all duration-500
                                        ${isHighlighted ? 'ring-2 ring-red-400 ring-opacity-50 animate-highlight shadow-xl' : ''}
                                        ${isMe
                                            ? `${isHighlighted ? 'bg-indigo-500' : 'bg-indigo-600'} text-white rounded-tr-none`
                                            : `${isHighlighted ? 'bg-white border-indigo-300' : 'bg-slate-300/30 border-slate-100'} text-slate-700 rounded-tl-none`
                                        }`}
                                >
                                    {msg?.attachments?.length !== 0 && (
                                        <div className="flex flex-wrap gap-2 my-2">
                                            {msg.attachments?.map((attachment, index) => (
                                                <Attachment key={index} attachment={attachment} />
                                            ))}
                                        </div>
                                    )}

                                    {msg?.monaco_editor?.code && (
                                        <CodeEditor previewMode={true} monaco_editor={msg.monaco_editor} />
                                    )}

                                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                                </div>
                            </div>
                        );
                    })
                )}

                {!isActiveChatMemberState && (
                    <div className="flex justify-center">
                        <div className="px-4 py-2.5 rounded-2xl max-w-[82%] shadow-sm bg-red-100 text-red-400 text-xs italic">
                            You are no longer a member of this chat. You cannot view other messages.
                        </div>
                    </div>
                )}

                {(isTyping.bool && isTyping.roomId === roomId && isTyping.sender !== username && messages.length !== 0) && (
                    <div className="w-fit">
                        {activeChat?.isGroup && (
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-2">
                                {isTyping.sender}
                            </p>
                        )}
                        <div className="p-4 w-fit flex gap-1 bg-slate-100 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-dot"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-dot animation-delay-200"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-dot animation-delay-400"></div>
                        </div>
                    </div>
                )}

                {messages.length !== 0 && <div ref={messagesEndRef} className="h-0" />}
            </div >
        </>
    );
};

export default Chat;