import React from 'react';
import { GrAttachment } from 'react-icons/gr';

const Attachments = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-white h-full p-8 text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-slate-200 rounded-3xl blur-2xl opacity-20 transform scale-110"></div>
                
                <div className="relative bg-linear-to-br from-slate-50 to-slate-200 p-10 rounded-3xl shadow-sm border border-slate-100">
                    <div className="bg-white p-4 rounded-2xl shadow-md transform -rotate-3">
                        <GrAttachment size={64} className="text-indigo-500/80" />
                    </div>
                    
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full shadow-lg border-4 border-white"></div>
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-green-400 rounded-lg shadow-md border-4 border-white rotate-12"></div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">
                No Attachments shared in the chat
            </h2>
            <p className="text-sm text-slate-500 max-w-70 leading-relaxed">
                Attachments added to chat automatically show up here.
            </p>
        </div>
    );
};

export default Attachments;