import ActiveChat from "../components/CustomChatUI/ActiveChat";
import UsersList from "../components/UsersList/UsersList";

const ChatMessages = () => {

    return (
        <div className="flex p-5 gap-5 bg-gray-100 h-screen">
            <UsersList />
            <ActiveChat />
        </div>
    );
};

export default ChatMessages;