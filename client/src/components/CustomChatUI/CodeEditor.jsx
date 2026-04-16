import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import { FaCode } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { MdOutlineContentCopy } from "react-icons/md";
import { useSocketContext } from "../../contexts/socketContext";
import { useRef } from "react";

const CodeEditor = ({ monaco_editor, previewMode = false, setInputValue, setIsCodeEditorMode }) => {

    const { socket, roomId, username } = useSocketContext();
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);


    const [availableLanguage, setAvailableLanguage] = useState([]);
    const lineHeight = 20;
    const maxVisibleLines = 15;
    const codeLineCount = Math.max(1, (monaco_editor.code || "").split("\n").length);
    const visibleLineCount = Math.min(codeLineCount, maxVisibleLines);
    const editorHeight = visibleLineCount * lineHeight + 20;

    function handleEditorDidMount(editor, monaco) {
        const allLanguages = monaco.languages.getLanguages();
        setAvailableLanguage(allLanguages.map(lang => ({
            value: lang.id,
            label: lang.aliases ? lang.aliases[0] : lang.id
        })));
    }

    const handleClose = () => {
        handleCodeChange("");
        setIsCodeEditorMode(false)
    }

    const handleLanguageChange = (e) => {
        setInputValue(prev => (
            {
                ...prev,
                monaco_editor: {
                    ...monaco_editor,
                    language: e.target.value
                }
            }
        ))
    }

    const handleCodeChange = (value) => {
        setInputValue(prev => (
            {
                ...prev,
                monaco_editor: {
                    ...monaco_editor,
                    code: value
                }
            }
        ))

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

    return (
        <div className="w-full my-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-indigo-100/50 bg-white">

                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
                        <FaCode />
                        <select
                            className={` ${previewMode ? "appearance-none" : ""} bg-transparent text-xs w-30 font-bold capitalize tracking-wider outline-none cursor-pointer`}
                            value={monaco_editor.language}
                            onChange={handleLanguageChange}
                            disabled={previewMode}
                        >
                            {availableLanguage.sort().map(lang => (
                                <option className="text-slate-500!" key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        {previewMode
                            ? <button
                                className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-800 text-slate-400 transition-all"
                                type="button"
                                onClick={() => navigator.clipboard.writeText(monaco_editor.code)}
                            >
                                <MdOutlineContentCopy size={18} />
                            </button>
                            : <button
                                className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all"
                                type="button"
                                onClick={handleClose}
                            >
                                <IoMdClose size={18} />
                            </button>
                        }

                    </div>
                </div>

                <div className={`pt-2 bg-white ${previewMode ? "w-[50vw]" : "w-full"}`}>
                    <Editor
                        width="100%"
                        height={`${editorHeight}px`}
                        theme="vs"
                        language={monaco_editor.language}
                        value={monaco_editor.code}
                        onChange={handleCodeChange}
                        onMount={handleEditorDidMount}
                        options={{
                            readOnly: previewMode,
                            fontSize: 14,
                            lineHeight,
                            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                            lineNumbers: "on",
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 10, bottom: 10 },
                            renderLineHighlight: "none",
                            overviewRulerBorder: false,
                            hideCursorInOverviewRuler: true,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;