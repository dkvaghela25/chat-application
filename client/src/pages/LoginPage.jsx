import React, { useState } from 'react';

const LoginPage = () => {

    const [userName, setUserName] = useState("")

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            {/* Main Card */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">

                <div className="pt-10 pb-6 px-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Create New User</h1>
                    <p className="text-slate-500 mt-2">Enter your name to start new chat</p>
                </div>

                <form className="px-8 pb-10 space-y-5" onSubmit={(e) => localStorage.setItem("userName", userName)}>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                            Name
                        </label>
                        <input
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            type="text"
                            placeholder="Enter Your Name"
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
                        />
                    </div>


                    <div className="pt-2">
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
                            Create User
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default LoginPage;