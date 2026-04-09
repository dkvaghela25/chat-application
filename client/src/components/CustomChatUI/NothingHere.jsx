const NothingHere = () => {
    return (
        <>
            <div className="flex flex-col items-center justify-center p-8 text-center bg-transparent mx-auto w-full">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-indigo-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    <div className="relative h-24 w-24 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                        <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
                    Your Workspace
                </h2>
                <p className="text-slate-500 max-w-70 text-sm leading-relaxed mb-8">
                    Select a teammate from the list on the left to start a secure conversation.
                </p>

            </div>
        </>
    );
};

export default NothingHere;