import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";

const CodeEditor = ({ text, setInputValue, setIsCodeEditorMode }) => {
    const [selectedLanguage, setSelectedLanguage] = useState("javascript"); // Default to JS for better immediate syntax highlighting
    const [availableLanguage, setAvailableLanguage] = useState([]);

    function handleEditorDidMount(editor, monaco) {
        const allLanguages = monaco.languages.getLanguages();
        // setAvailableLanguage(allLanguages.map(lang => ({ value: lang.id, label: lang.aliases[0] })));
        setAvailableLanguage(allLanguages.map(lang => ({
            value: lang.id,
            label: lang.aliases ? lang.aliases[0] : lang.id
        })));
    }

    return (
        <div className="w-full my-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xl shadow-indigo-100/50 bg-white">

                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">

                        <select
                            className="bg-transparent text-xs w-30 font-bold text-slate-500 capitalize tracking-wider outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                            {availableLanguage.sort().map(lang => (
                                <option className="text-slate-500!" key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all"
                        type="button"
                        onClick={() => setIsCodeEditorMode(false)}
                    >
                        <IoMdClose size={18} />
                    </button>
                </div>

                <div className="pt-2 bg-white">
                    <Editor
                        height="35vh"
                        theme="vs"
                        language={selectedLanguage}
                        value={text}
                        onChange={(value) => setInputValue(prev => ({ ...prev, text: value }))}
                        onMount={handleEditorDidMount}
                        options={{
                            fontSize: 14,
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