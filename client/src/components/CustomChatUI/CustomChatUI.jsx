import Header from './Header';
import ChatMessages from './ChatMessages';
import Footer from './Footer';
import NothingHere from './NothingHere';
import { useSocketContext } from '../../contexts/socketContext';

const CustomChatUI = () => {

    const { roomId } = useSocketContext();

    return (
        <>
            {!roomId
                ? <NothingHere />
                : (
                    <div className="flex flex-col w-full mx-auto bg-white/80 backdrop-blur-md border border-slate-200 overflow-hidden shadow-xl">
                        <Header />
                        <ChatMessages />
                        <Footer />
                    </div>
                )
            }
        </>
    );
};

export default CustomChatUI;