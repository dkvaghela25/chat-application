import { MdOutlineFileDownload } from "react-icons/md";
import { getIcon } from "../../utils/getIcon";

const Attachment = ({ attachment }) => {

    const getDownloadUrl = (url) => {
        return url.replace("/upload/", "/upload/fl_attachment/");
    };

    return (
        <>
            <div
                onClick={() => window.open(attachment.url, "_blank")}
                className="flex cursor-pointer w-70 items-center bg-white border border-slate-200 rounded-lg p-2 pr-1 group animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="bg-indigo-600/20 p-2 rounded-md shadow-sm text-indigo-700 mr-2">
                    {getIcon(attachment.type.split("/")[0])}
                </div>

                <div className="flex flex-col max-w-[60%]  mr-2">
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

                <a onClick={e => e.stopPropagation()} href={getDownloadUrl(attachment.url)} download={attachment.name} className="ml-auto p-2 cursor-pointer rounded-full text-slate-500 hover:bg-indigo-50! hover:text-indigo-500! hover:font-semibold! transition-colors">
                    <MdOutlineFileDownload size={20} />
                </a>
            </div>
        </>
    );
};

export default Attachment;