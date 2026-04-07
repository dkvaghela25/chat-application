import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import { IoSend } from "react-icons/io5";
import Emoji from './Icons/Emoji';
import Attachment from './Icons/Attachment';

const CustomChatUI = () => {
    const userName = localStorage.getItem("userName");
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        socket.emit("sendMessage", { username: userName, message: inputValue });
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
            <div className="flex flex-col w-full mx-auto bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                
                <header className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                            <span className="font-bold text-lg">P</span>
                        </div>
                        <div>
                            <h2 className="text-slate-800 font-bold tracking-tight">Project Workspace</h2>
                            <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Active Now
                            </p>
                        </div>
                    </div>
                </header>

                <div
                    ref={scrollRef}
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
                                        {msg.message}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <footer className="p-4 bg-white border-t border-slate-100">
                    <form
                        onSubmit={handleSend}
                        className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:ring-2 ring-indigo-100 focus-within:border-indigo-400 transition-all"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Message #workspace..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 py-2"
                        />
                        <div className='flex items-center gap-1 text-slate-900 font-black'>
                            <Emoji />
                            <Attachment />
                            <button 
                                type="submit"
                                className={`p-2 rounded-lg  border-l border-slate-200 pl-3 transition-colors hover:text-indigo-700 ${inputValue.trim() ? 'text-slate-700' : 'text-slate-400 cursor-not-allowed'}`}
                                disabled={!inputValue.trim()}
                            >
                                <IoSend size={18} />
                            </button>
                        </div>
                    </form>
                </footer>
            </div>
    );
};

export default CustomChatUI;