import { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import CodeEditor from "./Footer/CodeEditor";
import { useSocketContext } from "../../contexts/socketContext";
import Chat from "./Chat";
import Attachments from "./Attachments";
import { fetchMessages } from "../../api/message";

const Messages = ({ highlightedMessageId, displayChat }) => {

    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState({});

    const { socket, roomId, isActiveChatMember } = useSocketContext();

    const getMessages = async () => {
        try {
            if (!roomId) return;
            const res = await fetchMessages(roomId);
            setMessages(res.messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
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
            {displayChat
                ? <Chat messages={messages} highlightedMessageId={highlightedMessageId} isTyping={isTyping} />
                : <Attachments messages={messages} />
            }
        </>
    );
};

export default Messages;
