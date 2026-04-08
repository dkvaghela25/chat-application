import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import { IoSend } from "react-icons/io5";
import { getIcon } from "../../utils/getIcon";
import CodeEditor from "./CodeEditor";

const ChatMessages = () => {

    const messagesEndRef = useRef(null);
    const userName = localStorage.getItem("userName");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!messagesEndRef.current) return;
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {

        const oldMessageCallback = (data) => {
            setMessages(prev => [...prev, ...data]);
        };

        const receiveMessageCallback = (data) => {
            setMessages(prev => [...prev, data]);
        };

        socket.on("oldMessages", oldMessageCallback);
        socket.on("receiveMessage", receiveMessageCallback);

        return () => {
            socket.off("oldMessages")
            socket.off("receiveMessage")
        };

    }, []);

    return (
        <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-400 ">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-100 p-4 rounded-full mb-3">
                            <IoSend className="-rotate-45 opacity-20" size={30} />
                        </div>
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs">Start the conversation below</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.username === userName;
                        return (
                            <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-2">
                                    {isMe ? 'You' : msg.username}
                                </span>
                                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-[14px] shadow-sm transition-all
                                        ${isMe
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-slate-300/30 border border-slate-100 text-slate-700 rounded-tl-none'
                                    }`}
                                >
                                    {msg.attachments.length !== 0 && (
                                        <div className="flex flex-wrap gap-2 my-2">
                                            {msg.attachments.map((attachment, index) => (
                                                <div
                                                    key={index}
                                                    className="flex w-70 items-center bg-white border border-slate-200 rounded-lg p-1.5 pr-1 group animate-in fade-in zoom-in-95 duration-200"
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

                                    {msg.monaco_editor.code && (
                                        <CodeEditor previewMode={true} monaco_editor={msg.monaco_editor} />
                                    )}
                                    <pre>{msg.text}</pre>
                                </div>
                            </div>
                        );
                    })
                )}
                {messages.length !== 0 && <div ref={messagesEndRef} className="h-0" />}
            </div>
        </>
    );
};

export default ChatMessages;
