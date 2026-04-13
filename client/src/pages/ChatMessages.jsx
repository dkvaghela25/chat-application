import { useEffect } from "react";
import CustomChatUI from "../components/CustomChatUI/CustomChatUI";
import UsersList from "../components/UsersList/UsersList";
import { useSocketContext } from "../contexts/socketContext";

const ChatMessages = () => {

    const { connectAndJoin, username } = useSocketContext();

    useEffect(() => {
        connectAndJoin(username);
    }, [username]);

    return (
        <div className="flex p-5 gap-5 bg-gray-100 h-screen">
            <UsersList />
            <CustomChatUI />
        </div>
    );
};

export default ChatMessages;