import { useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { CiImageOn, CiVideoOn } from "react-icons/ci";
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineAudiotrack } from "react-icons/md";

const Attachment = ({ setInputValue }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (e) => {
        const { files } = e.target;
        setInputValue(prev => ({ ...prev, attachments: [...prev.attachments, ...Array.from(files)] }))
        setIsOpen(false)
    }

    const attachmentIcons = [
        { icon: < CiImageOn size={24} />, label: "Image", accept: "image/*", color: "text-blue-500", bgColor: "bg-blue-50" },
        { icon: < CiVideoOn size={24} />, label: "Video", accept: "video/*", color: "text-purple-500", bgColor: "bg-purple-50" },
        { icon: < MdOutlineAudiotrack size={24} />, label: "Audio", accept: "audio/*", color: "text-pink-500", bgColor: "bg-pink-50" },
        { icon: < IoDocumentTextOutline size={24} />, label: "File", accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt", color: "text-amber-500", bgColor: "bg-amber-50" },
    ]

    return (
        <div className="relative flex items-center">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all duration-200 ${isOpen
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

                        {attachmentIcons.map(({ icon, accept, bgColor, color, label }) => (
                            <AttachmentOption handleChange={handleChange} icon={icon} label={label} accept={accept} color={color} bgColor={bgColor} />
                        ))}

                        <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45"></div>
                    </div>
                </>
            )}
        </div>
    );
};

const AttachmentOption = ({ handleChange, icon, label, color, bgColor, accept }) => {

    const [showInput, setShowInput] = useState(false);

    return (
        <>
            <label htmlFor="file-upload" onClick={() => setShowInput(true)} className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${bgColor} ${color}`}>
                <div className="mb-1">{icon}</div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{label}</span>
            </label>
            {showInput && <input onChange={handleChange} accept={accept} multiple id="file-upload" type="file" hidden />}
        </>
    )
};

export default Attachment;