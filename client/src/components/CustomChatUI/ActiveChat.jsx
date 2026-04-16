import Header from './Header';
import Footer from './Footer';
import NothingHere from './NothingHere';
import { useSocketContext } from '../../contexts/socketContext';
import { useEffect, useState } from 'react';
import ActiveChatDetails from './ActiveChatDetails';
import Messages from './Messages';

const ActiveChat = () => {

    const { roomId } = useSocketContext();
    const [activeChatDetailsIsOpen, setActiveChatDetailsIsOpen] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveChatDetailsIsOpen(false);
    }, [roomId]);

    return (
        <>
            {!roomId
                ? <NothingHere />
                : activeChatDetailsIsOpen
                    ? <ActiveChatDetails setActiveChatDetailsIsOpen={setActiveChatDetailsIsOpen} />
                    : (
                        <div className="flex flex-col w-full mx-auto bg-white/80 backdrop-blur-md border border-slate-200 overflow-hidden shadow-xl">
                            <Header setActiveChatDetailsIsOpen={setActiveChatDetailsIsOpen} />
                            <Messages />
                            <Footer />
                        </div>
                    )
            }
        </>
    );
};

export default ActiveChat;