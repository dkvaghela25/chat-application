import { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import CodeEditor from "./CodeEditor";
import { useSocketContext } from "../../contexts/socketContext";
import Chat from "./Chat";
import Attachments from "./Attachments";

const Messages = ({ highlightedMessageId, displayChat }) => {

    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    const { socket, roomId } = useSocketContext();

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

    return (
        <>
            {displayChat
                ? <Chat messages={messages} highlightedMessageId={highlightedMessageId} isTyping={isTyping} />
                : <Attachments messages={messages} />
            }
        </>
    );
};

export default Messages;
