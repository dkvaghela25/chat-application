import Header from './Header';
import ChatMessages from './ChatMessages';
import Footer from './Footer';

const CustomChatUI = () => {
    return (
        <div className="flex flex-col w-full mx-auto bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
            <Header />
            <ChatMessages />
            <Footer />
        </div>
    );
};

export default CustomChatUI;