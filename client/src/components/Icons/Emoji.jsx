import { BsEmojiSmile } from "react-icons/bs";

const Emoji = () => {
    return (
        <div className='p-2 rounded-full transition-all duration-200 hover:bg-slate-200'>
            <BsEmojiSmile size={20} />
        </div>
    );
};

export default Emoji;