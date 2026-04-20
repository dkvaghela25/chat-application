import { NavLink } from "react-router-dom";
import { getIcon } from "../../utils/getIcon";
import { MdOutlineFileDownload } from "react-icons/md";

const CustomTable = ({ rows, columns }) => {
    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-175">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            {columns.map((col) => (
                                <th
                                    className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap"
                                    key={col.accessor}
                                >
                                    {col.Header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.length === 0 ? (
                            <tr className="text-center">
                                <td className="p-12 text-slate-400 italic text-sm" colSpan={columns.length}>
                                    No attachments found.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                    {columns.map(col => (
                                        <td
                                            key={col.accessor}
                                            className="py-3 px-6 text-sm text-slate-600 whitespace-nowrap"
                                        >
                                            {formattedValue(row[col.accessor], col.accessor)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const formattedValue = (value, accessor) => {
    if (value === "" || value === undefined || value === null) {
        return <span className="text-slate-300">--</span>;
    }

    switch (accessor) {
        case "type":
            return (
                <>
                    {getIcon(value.split("/")[0])}
                </>
            );

        case "name":
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-800 truncate max-w-62.5">
                        {value}
                    </span>
                </div>
            );

        case "sharedOn":
            // Formats ISO string to: Apr 17, 2026
            return new Date(value).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

        case "sentBy":
            return (
                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                    {value}
                </span>
            );

        case "url":
            return (
                <div className="flex justify-end ">
                    <a href={value.replace("/upload/", "/upload/fl_attachment/")} className="flex p-2 gap-1 cursor-pointer hover:bg-indigo-50 rounded-sm border border-slate-400 hover:border-indigo-500 hover:text-indigo-500 hover:font-semibold transition-colors">
                        <MdOutlineFileDownload size={18} />
                        <span>Download</span>
                    </a>
                </div>
            );

        default:
            return value;
    }
};

export default CustomTable;