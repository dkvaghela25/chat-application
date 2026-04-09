import { useEffect, useState } from "react";
import CustomChatUI from "../components/CustomChatUI/CustomChatUI";
import UsersList from "../components/UsersList";
import { connectAndJoin } from "../socket";

const ChatMessages = () => {

    const username = localStorage.getItem("username");
    const [receiver, setReceiver] = useState(null);

    useEffect(() => {
        connectAndJoin(username);
    }, [username]);

    return (
        <div className="flex p-5 gap-5 bg-gray-100 h-screen">
            <UsersList setReceiver={setReceiver} />
            <CustomChatUI receiver={receiver} />
        </div>
    );
};

export default ChatMessages;