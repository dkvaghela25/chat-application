import { useState } from "react";
import { socket } from "../../socket";
import Attachment from "../Icons/Attachment";
import Emoji from "../Icons/Emoji"
import { IoSend } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { getIcon } from "../../utils/getIcon";
import { FaCode } from "react-icons/fa6";
import CodeEditor from "./CodeEditor";

const Footer = () => {

    const [isCodeEditorMode, setIsCodeEditorMode] = useState(false)
    const [inputValue, setInputValue] = useState({
        text: "",
        attachments: []
    });

    const handleTextChange = (e) => {
        setInputValue(prev => ({ ...prev, text: e.target.value }))
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    }

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue?.text?.trim() && inputValue.attachments.length === 0) return;

        socket.emit("sendMessage", {
            text: inputValue.text,
            attachments: inputValue.attachments.map(({ type, name, size }) => ({ type, name, size }))
        });

        setInputValue({ text: "", attachments: [] });
    };

    const handleRemoveAttachment = (index) => {
        setInputValue(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }))
    }
    
    return (
        <>
            <footer className="p-4 bg-white border-t border-slate-100">
                <form
                    onSubmit={handleSend}
                    className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:ring-2 ring-indigo-100 focus-within:border-indigo-400 transition-all"
                >
                    {inputValue.attachments.length !== 0 && (
                        <div className="flex flex-wrap gap-2 my-2">
                            {inputValue.attachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className="flex w-70 items-center bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 pr-1 group animate-in fade-in zoom-in-95 duration-200"
                                >
                                    <div className="bg-white p-2 rounded-md shadow-sm text-indigo-600 mr-2">
                                        {getIcon(attachment.type.split("/")[0])}
                                    </div>

                                    <div className="flex flex-col max-w-[70%]  mr-2">
                                        <span className="text-sm font-semibold text-slate-700 truncate ">
                                            {attachment.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                            {attachment.size > 1024 * 1024
                                                ? `${(attachment.size / (1024 * 1024)).toFixed(2)} MB`
                                                : `${Math.ceil(attachment.size / 1024)} KB`
                                            }
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAttachment(index)}
                                        className="ml-auto p-1 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors text-slate-400"
                                    >
                                        <IoMdClose size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className='flex items-end'>
                        {isCodeEditorMode
                            ? <CodeEditor text={inputValue.text} setInputValue={setInputValue} setIsCodeEditorMode={setIsCodeEditorMode} />
                            : <textarea
                                type="text"
                                value={inputValue.text}
                                onChange={handleTextChange}
                                placeholder="Message #workspace..."
                                className="flex-1 bg-transparent border-none resize-none [&::-webkit-scrollbar]:w-1.5 h-9 max-h-50 outline-none text-sm text-slate-700 placeholder-slate-400 py-2"
                            ></textarea>
                        }
                        <div className='flex items-center gap-1 text-slate-900 font-black'>
                            <button onClick={() => setIsCodeEditorMode(prev => !prev)} className='p-2 rounded-full transition-all duration-200 hover:bg-slate-200' >
                                <FaCode size={18} />
                            </button>
                            <Emoji setInputValue={setInputValue} />
                            <Attachment setInputValue={setInputValue} />
                            <button
                                type="submit"
                                className={`p-2 rounded-lg  border-l disabled:cursor-not-allowed disabled:text-slate-400 border-slate-200 pl-3 transition-colors text-slate-700 hover:text-indigo-700`}
                                disabled={!inputValue?.text?.trim() && inputValue.attachments.length === 0}
                            >
                                <IoSend size={18} />
                            </button>
                        </div>
                    </div>
                </form>
            </footer >
        </>
    );
};

export default Footer;
