import { useSocketContext } from "../../contexts/socketContext";

const Header = () => {
    const { activeChat } = useSocketContext();

    if (!activeChat) return null;

    return (
        <>
            <header className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {/* <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200"> */}
                    <img className="rounded-full w-12 h-12" src={`https://ui-avatars.com/api/?name=${activeChat.name}&background=random`} alt="" />
                    {/* </div> */}
                    <div>
                        <h2 className="text-slate-800 font-bold tracking-tight">{activeChat.name}</h2>
                        {activeChat.isGroup ? (
                            <p className="text-[11px] text-slate-400 font-medium truncate">
                                {(activeChat.members?.length || 0)} members
                            </p>
                        ) : (
                            <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                                <span className={`h-1.5 w-1.5 ${activeChat.online ? 'bg-emerald-500' : 'bg-slate-300'} rounded-full animate-pulse`}></span>
                                <p className="text-[11px] text-slate-400 font-medium truncate">
                                    {activeChat.online ? 'Active now' : 'Offline'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;