import { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import CodeEditor from "./Footer/CodeEditor";
import { useSocketContext } from "../../contexts/socketContext";
import Chat from "./Chat";
import Attachments from "./Attachments";
import { fetchMessages } from "../../api/message";

const MessagesSkeleton = () => {
    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-pulse bg-white">
            {Array.from({ length: 4 }).map((_, index) => {
                const isMe = index % 2 === 0;
                return (
                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="h-3 w-16 bg-slate-200 rounded mb-1.5" />
                        <div className={`h-12 w-[60%] sm:w-[40%] bg-slate-100 rounded-2xl ${isMe ? 'rounded-tr-none bg-indigo-50/50' : 'rounded-tl-none bg-slate-200/30'}`} />
                    </div>
                );
            })}
        </div>
    );
};

const Messages = ({ highlightedMessageId, displayChat }) => {

    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState({});
    const [loading, setLoading] = useState(false);

    const { socket, roomId, isActiveChatMember } = useSocketContext();

    const getMessages = async () => {
        try {
            if (!roomId) return;
            setLoading(true);
            const res = await fetchMessages(roomId);
            setMessages(res.messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getMessages();
    }, [roomId]);

    useEffect(() => {

        const receiveMessageCallback = (data) => {
            if (!isActiveChatMember) return;
            setMessages(prev => {
                if (data.roomId === roomId) {
                    return [...prev, data];
                }
                return prev;
            });
            setIsTyping(false);
        };

        const typingCallBack = (data) => {
            if (!isActiveChatMember) return;
            if (data.roomId === roomId) {
                setIsTyping(data);
            }
        };

        socket.on("receiveMessage", receiveMessageCallback);
        socket.on("isTyping", typingCallBack);

        return () => {
            socket.off("receiveMessage", receiveMessageCallback);
            socket.off("isTyping", typingCallBack);
        };

    }, [socket, roomId, messages, isActiveChatMember]);

    return (
        <>
            {loading ? (
                <MessagesSkeleton />
            ) : displayChat
                ? <Chat messages={messages} highlightedMessageId={highlightedMessageId} isTyping={isTyping} />
                : <Attachments messages={messages} />
            }
        </>
    );
};

export default Messages;
