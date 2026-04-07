import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { IoSend } from "react-icons/io5";

const ChatMessages = () => {

    const userName = localStorage.getItem("userName");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const callback = (data) => {
            setMessages(prev => [...prev, data]);
        };
        socket.on("receiveMessage", callback);
        return () => socket.off("receiveMessage");
    }, []);

    return (
        <>
            <div
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200"
            >
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
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                    }`}
                                >
                                    {msg.message.text}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};

export default ChatMessages;