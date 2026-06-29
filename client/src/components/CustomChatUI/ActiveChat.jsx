import Header from './Header';
import Footer from './Footer/Footer';
import NothingHere from './NothingHere';
import { useSocketContext } from '../../contexts/socketContext';
import { useEffect, useState } from 'react';
import ActiveChatDetails from './ActiveChatDetails';
import Messages from './Messages';

const ActiveChat = () => {

    const { roomId, isActiveChatMember, loadingRoom } = useSocketContext();
    const [activeChatDetailsIsOpen, setActiveChatDetailsIsOpen] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState(null);
    const [displayChat, setDisplayChat] = useState(true);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveChatDetailsIsOpen(false);
        setDisplayChat(true);
        setHighlightedMessageId(null);
    }, [roomId]);

    return (
        <>
            {loadingRoom ? (
                <div className="flex flex-col w-full h-full mx-auto bg-white/80 backdrop-blur-md border border-slate-200 overflow-hidden shadow-xl items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                    <p className="mt-4 text-slate-500 font-semibold animate-pulse">Loading chat...</p>
                </div>
            ) : !roomId
                ? <NothingHere />
                : activeChatDetailsIsOpen
                    ? <ActiveChatDetails setActiveChatDetailsIsOpen={setActiveChatDetailsIsOpen} />
                    : (
                        <div className="flex flex-col w-full h-full mx-auto bg-white/80 backdrop-blur-md border border-slate-200 overflow-hidden shadow-xl">
                            <Header
                                setActiveChatDetailsIsOpen={setActiveChatDetailsIsOpen}
                                setHighlightedMessageId={setHighlightedMessageId}
                                displayChat={displayChat}
                                setDisplayChat={setDisplayChat}
                            />
                            <Messages highlightedMessageId={highlightedMessageId} displayChat={displayChat} />
                            {displayChat && isActiveChatMember && <Footer />}
                        </div>
                    )
            }
        </>
    );
};

export default ActiveChat;