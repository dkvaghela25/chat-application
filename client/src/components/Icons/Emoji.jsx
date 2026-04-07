import { useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const Emoji = ({ setInputValue }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleSelect = (emoji) => {
        setInputValue(prev => ({ ...prev, text: prev.text + emoji.native }))
        setShowPicker(false);
    };

    return (
        <div className="relative inline-block">
            <div
                className='p-2 rounded-full transition-all duration-200 hover:bg-slate-200'
                onClick={() => setShowPicker(!showPicker)}
            >
                <BsEmojiSmile size={20} />
            </div>

            {showPicker && (

                <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />

                    <div className="absolute bottom-full right-0 mb-2 z-50">
                        <Picker
                            data={data}
                            onEmojiSelect={handleSelect}
                            theme="light"
                            previewPosition="none" // Hides the bottom preview bar for a cleaner look
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Emoji;
