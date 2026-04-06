import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import { IoSend } from "react-icons/io5";

const CustomChatUI = () => {
    const userName = localStorage.getItem("userName");
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        socket.emit("sendMessage", inputValue);
        setInputValue("");
    };

    useEffect(() => {
        const callback = (data) => {
            setMessages(prev => [...prev, data]);
        };
        socket.on("receiveMessage", callback);
        return () => socket.off("receiveMessage");
    }, []);

    return (
        <div className="flex w-full font-sans">
            <div className="flex flex-col w-full mx-auto backdrop-blur-xl border border-slate-300 rounded-xl overflow-hidden shadow-2xl">

                {/* Custom Header */}
                <header className="px-6 py-4 border-b border-slate-300 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {/* <div className="h-12 w-12 rounded-2xl bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            P
                        </div> */}
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Project Workspace</h2>
                        </div>
                    </div>
                </header>

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide scroll-smooth"
                >
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                            <p className="text-sm italic">No messages yet. Start the conversation.</p>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        const isMe = msg.username === userName;
                        return (
                            <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                                        {isMe ? 'You' : msg.username}
                                    </span>
                                </div>
                                <div
                                    className={`relative px-4 py-3 rounded-xl max-w-[85%] md:max-w-[60%] text-sm leading-relaxed shadow-sm
                                        ${isMe
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-gray-200 rounded-tl-none'
                                        }`}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <footer className="p-4 border-t border-slate-300">
                    <form
                        onSubmit={handleSend}
                        className="relative flex items-center border rounded-xl px-4 py-3 border-slate-300 focus-within:border-indigo-500 transition-all"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Write a message..."
                            className="flex-1 bg-transparent border-none outline-none text-sm placeholder-slate-500"
                        />
                        <button>
                            <IoSend size={20} className='hover:text-indigo-600' />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default CustomChatUI;