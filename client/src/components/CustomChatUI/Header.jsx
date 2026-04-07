const Header = () => {
    return (
        <>
            <header className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                        <span className="font-bold text-lg">P</span>
                    </div>
                    <div>
                        <h2 className="text-slate-800 font-bold tracking-tight">Project Workspace</h2>
                        <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Active Now
                        </p>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;