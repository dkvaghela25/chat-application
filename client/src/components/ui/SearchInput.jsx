import { IoMdSearch } from "react-icons/io";

const SearchInput = ({ autoFocus = false, searchInput, setSearchInput, placeholder }) => {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoMdSearch className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
                autoFocus={autoFocus}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                type="text"
                placeholder={placeholder}
                className="bg-slate-100 border-none rounded-xl w-full py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 outline-none"
            />
        </div>
    );
};

export default SearchInput;