import { CiImageOn, CiVideoOn } from "react-icons/ci";
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineAudiotrack } from "react-icons/md";

export const getIcon = (type) => {
    switch (type) {
        case "image": return < CiImageOn size={24} />;
        case "video": return < CiVideoOn size={24} />;
        case "audio": return < MdOutlineAudiotrack size={24} />;
        default: return < IoDocumentTextOutline size={24} />;
    }
};