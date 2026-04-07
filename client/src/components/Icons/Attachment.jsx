import { useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { CiImageOn, CiVideoOn } from "react-icons/ci";
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineAudiotrack } from "react-icons/md";

const Attachment = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="relative flex items-center">
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all duration-200 ${
                    isOpen 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
            >
                <GrAttachment size={20} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    
                    <div className="absolute bottom-full right-0 mb-3 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-2xl p-3 grid grid-cols-2 gap-2 min-w-40 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 ease-out origin-bottom-right">
                        <AttachmentOption icon={<CiImageOn size={24} />} label="Image" color="text-blue-500" bgColor="bg-blue-50" />
                        <AttachmentOption icon={<CiVideoOn size={24} />} label="Video" color="text-purple-500" bgColor="bg-purple-50" />
                        <AttachmentOption icon={<MdOutlineAudiotrack size={24} />} label="Audio" color="text-pink-500" bgColor="bg-pink-50" />
                        <AttachmentOption icon={<IoDocumentTextOutline size={24} />} label="File" color="text-amber-500" bgColor="bg-amber-50" />
                        
                        <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45"></div>
                    </div>
                </>
            )}
        </div>
    );
};

const AttachmentOption = ({ icon, label, color, bgColor }) => (
    <button className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${bgColor} ${color}`}>
        <div className="mb-1">{icon}</div>
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{label}</span>
    </button>
);

export default Attachment;