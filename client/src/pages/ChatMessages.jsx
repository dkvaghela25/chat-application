import CustomChatUI from "../components/CustomChatUI/CustomChatUI";
import UsersList from "../components/UsersList";

const ChatMessages = () => {
    return (
        <div className="flex p-5 gap-5 bg-gray-100 h-screen">
            <UsersList />
            <CustomChatUI />
        </div>
    );
};

export default ChatMessages;