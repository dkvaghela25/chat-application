import { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { getIcon } from "../../utils/getIcon";
import CodeEditor from "./CodeEditor";
import { useSocketContext } from "../../contexts/socketContext";

const Messages = ({ highlightedMessageId }) => {

    const { socket, activeChat, username, roomId } = useSocketContext();

    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!messagesEndRef.current) return;
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        if (!socket || !roomId) return;
        socket.emit("getMessages", { roomId });
    }, [socket, roomId]);

    useEffect(() => {

        const chatHistoryCallback = (data) => {
            setMessages(data);
        };

        const receiveMessageCallback = (data) => {
            setMessages(prev => {
                if (data.roomId === roomId) {
                    return [...prev, data];
                }
                return prev;
            });
            setIsTyping(false);
        };

        const typingCallBack = (data) => {
            if (data.roomId === roomId) {
                setIsTyping(data);
            }
        };

        socket.on("chatHistory", chatHistoryCallback);
        socket.on("receiveMessage", receiveMessageCallback);
        socket.on("isTyping", typingCallBack);

        return () => {
            socket.off("chatHistory", chatHistoryCallback);
            socket.off("receiveMessage", receiveMessageCallback);
            socket.off("isTyping", typingCallBack);
        };

    }, [socket, roomId]);

    useEffect(() => {
        if (highlightedMessageId) {

            const element = document.getElementById(highlightedMessageId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }

        }
    }, [highlightedMessageId]);

    const handleContextMenu = (e) => {
        e.preventDefault();
        console.log("Right click detected!");
    }

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
                        const isMe = msg.sender === username;
                        const isHighlighted = highlightedMessageId === msg._id;

                        return (
                            <div
                                id={msg._id}
                                key={msg._id || `${msg.sender}-${msg.createdAt}-${index}`}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-2">
                                    {isMe ? 'You' : activeChat?.isGroup ? msg.sender : activeChat?.name}
                                </span>
                                <div onContextMenu={handleContextMenu}
                                    className={`px-4 py-2.5 rounded-2xl max-w-[80%] shadow-sm transition-all duration-500
                                        ${isHighlighted ? 'ring-2 ring-red-400 ring-opacity-50 animate-highlight shadow-xl' : ''}
                                        ${isMe
                                            ? `${isHighlighted ? 'bg-indigo-500' : 'bg-indigo-600'} text-white rounded-tr-none`
                                            : `${isHighlighted ? 'bg-white border-indigo-300' : 'bg-slate-300/30 border-slate-100'} text-slate-700 rounded-tl-none`
                                        }`}
                                >
                                    {msg?.attachments?.length !== 0 && (
                                        <div className="flex flex-wrap gap-2 my-2">
                                            {msg.attachments?.map((attachment, index) => (
                                                <div
                                                    key={index}
                                                    className="flex w-70 items-center bg-white border border-slate-200 rounded-lg p-2 pr-1 group animate-in fade-in zoom-in-95 duration-200"
                                                >
                                                    <div className="bg-indigo-600/20 p-2 rounded-md shadow-sm text-indigo-700 mr-2">
                                                        {getIcon(attachment.type.split("/")[0])}
                                                    </div>

                                                    <div className="flex flex-col max-w-[70%]  mr-2">
                                                        <span className="text-sm font-semibold text-slate-700 truncate ">
                                                            {attachment.name}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                            {attachment.size > 1024 * 1024
                                                                ? `${(attachment.size / (1024 * 1024)).toFixed(2)} MB`
                                                                : `${Math.ceil(attachment.size / 1024)} KB`
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
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
            </div>
        </>
    );
};

export default Messages;
