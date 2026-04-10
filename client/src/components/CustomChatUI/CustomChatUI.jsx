import Header from './Header';
import ChatMessages from './ChatMessages';
import Footer from './Footer';
import NothingHere from './NothingHere';

const CustomChatUI = ({ receiver }) => {
    
    return (
        <>
            {!receiver
                ? <NothingHere />
                : (
                    <div className="flex flex-col w-full mx-auto bg-white/80 backdrop-blur-md border border-slate-200 overflow-hidden shadow-xl">
                        <Header receiver={receiver} />
                        <ChatMessages receiver={receiver} />
                        <Footer receiver={receiver} />
                    </div>
                )
            }
        </>
    );
};

export default CustomChatUI;