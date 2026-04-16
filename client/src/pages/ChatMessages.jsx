import { useSocketContext } from "../contexts/socketContext";
import ActiveChat from "../components/CustomChatUI/ActiveChat";
import UsersList from "../components/UsersList/UsersList";

const ChatMessages = () => {
    const { roomId } = useSocketContext();

    return (
        <div className="flex flex-col md:flex-row p-0 md:p-5 gap-0 md:gap-5 bg-gray-100 h-screen overflow-hidden">
            <div className={`w-full md:w-[35%] lg:w-[30%] ${roomId ? 'hidden md:flex' : 'flex'} flex-col h-full`}>
                <UsersList />
            </div>
            <div className={`w-full justify-center md:w-[65%] lg:w-[70%] ${!roomId ? 'hidden md:flex' : 'flex'} flex-col h-full`}>
                <ActiveChat />
            </div>
        </div>
    );
};

export default ChatMessages;