import { useEffect, useState } from "react";
import Attachment from "../Icons/Attachment";
import Emoji from "../Icons/Emoji"
import { IoSend } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { getIcon } from "../../utils/getIcon";
import { FaCode } from "react-icons/fa6";
import CodeEditor from "./CodeEditor";
import { useRef } from "react";
import { useSocketContext } from "../../contexts/socketContext";
import { uploadFiles } from "../../api/message";
import { toast } from "react-toastify";

const Footer = () => {

    const { socket, roomId, username } = useSocketContext();

    const [isLoading, setIsLoading] = useState(false);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    const initialInputValues = {
        text: "",
        attachments: [],
        monaco_editor: {
            language: "plaintext",
            code: "",
        }
    }

    const [isCodeEditorMode, setIsCodeEditorMode] = useState(false)
    const [inputValue, setInputValue] = useState(initialInputValues);

    const handleTextChange = () => {

        setInputValue(prev => ({ ...prev, text: inputRef.current.innerHTML === "<br>" ? "" : inputRef.current.innerHTML }))
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;

        if (!isTypingRef.current) {
            socket.emit("isTyping", {
                sender: username,
                roomId,
                bool: true
            });
            isTypingRef.current = true;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("isTyping", {
                sender: username,
                roomId,
                bool: false
            });
            isTypingRef.current = false;
        }, 1500);

    }

    const handleSend = async (e) => {
        try {
            e?.preventDefault();

            setIsLoading(true);

            const { text, attachments, monaco_editor } = inputValue;
            if (!text?.trim() && !monaco_editor.code?.trim() && attachments.length === 0) return;

            let uploadedFiles = [];

            if (inputValue.attachments.length !== 0) {
                const res = await uploadFiles(inputValue.attachments);
                uploadedFiles = res.files;
            }

            socket.emit("sendMessage", {
                roomId,
                text: text.trim(),
                attachments: uploadedFiles,
                monaco_editor,
            });

            inputRef.current.innerHTML = ""

            setIsLoading(false);
            setInputValue(initialInputValues);
            setIsCodeEditorMode(false);
        } catch (error) {
            setIsLoading(false);
            toast.error(error);
        }
    };

    const handleKeyDown = (e) => {

        if (e.key === "`" && inputValue.text.slice(-2) === "``") {
            setIsCodeEditorMode(true)
        }

        if (e.key == "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend()
        };


    }

    const handleRemoveAttachment = (index) => {
        setInputValue(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }))
    }

    const inputRef = useRef(null);

    useEffect(() => {

        if (!inputRef.current) return;

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    handleTextChange()
                }
            }
        });

        observer.observe(inputRef.current, { characterData: true, childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    const handlePaste = (e) => {
        e.preventDefault();

        if (!inputRef.current) return;

        const pastedData = e.clipboardData.getData('text');

        // eslint-disable-next-line react-hooks/immutability
        inputRef.current.innerText += pastedData;

        const selection = window.getSelection();
        const range = document.createRange();

        range.selectNodeContents(inputRef.current);

        range.collapse(false);

        selection.removeAllRanges();
        selection.addRange(range);

        inputRef.current.focus();
    };

    return (
        <>
            <footer
                className="p-4 bg-white border-t border-slate-100"
            >
                <form
                    onSubmit={handleSend}
                    className="flex flex-col bg-slate-50 border border-slate-200 rounded-md px-4 py-2 focus-within:ring-2 ring-indigo-100 focus-within:border-indigo-400 transition-all"
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
                    <div className='flex flex-wrap items-end gap-2'>

                        <div className="flex-1 min-w-0 flex flex-col">

                            <div
                                onPaste={handlePaste}
                                ref={inputRef}
                                contentEditable="true"
                                onKeyDown={handleKeyDown}
                                className="bg-transparent empty:before:content-['Type_something...'] empty:before:text-gray-400 resize-none [&::-webkit-scrollbar]:w-1.5 max-h-50 outline-none text-sm text-slate-700 placeholder-slate-400 py-2 overflow-x-auto"
                            />

                            {isCodeEditorMode && <CodeEditor monaco_editor={inputValue.monaco_editor} setInputValue={setInputValue} setIsCodeEditorMode={setIsCodeEditorMode} />}

                        </div>

                        <div className='ml-auto flex shrink-0 items-center gap-1 text-slate-900 font-black'>
                            <button type="button" onClick={() => setIsCodeEditorMode(prev => !prev)} className='p-2 rounded-full transition-all duration-200 hover:bg-slate-200' >
                                <FaCode size={18} />
                            </button>
                            <Emoji inputRef={inputRef} />
                            <Attachment setInputValue={setInputValue} />
                            <button
                                type="submit"
                                className={`p-2 rounded-lg  border-l disabled:cursor-not-allowed disabled:text-slate-400 border-slate-200 pl-3 transition-colors text-slate-700 hover:text-indigo-700`}
                                disabled={ isLoading || (!inputValue?.text?.trim() && !inputValue?.monaco_editor?.code?.trim() && inputValue.attachments.length === 0)}
                            >
                                <IoSend size={18} />
                            </button>
                        </div>
                    </div>
                </form>
            </footer>
        </>
    );
};

export default Footer;
