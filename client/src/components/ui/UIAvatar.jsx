const UIAvatar = ({ name, size = "md" }) => {

    function getAvatarColors() {
        const seed = String(name);

        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }

        const bgColor = (hash & 0x00ffffff)
            .toString(16)
            .toUpperCase()
            .padStart(6, "0");

        const r = parseInt(bgColor.substring(0, 2), 16);
        const g = parseInt(bgColor.substring(2, 4), 16);
        const b = parseInt(bgColor.substring(4, 6), 16);

        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        const textColor = luminance > 186 ? "000000" : "FFFFFF";

        return { bgColor, textColor };
    }

    const { bgColor, textColor } = getAvatarColors();

    const initials = name
        ?.split(" ")
        ?.map((n) => n[0])
        ?.join("")
        ?.toUpperCase();

    const generateSize = () => {
        switch (size) {
            case "sm": return "w-8 h-8 text-[10px]";
            case "md": return "w-10 h-10 text-[16px]";
            case "lg": return "w-12 h-12 text-[20px]";
            case "xl": return "w-16 h-16 text-[24px]";
            default: return "w-10 h-10 text-[16px]";
        }
    }

    if (!name) return <div>
        
    </div>;

    return (
        <div className={`${generateSize()} rounded-full shrink-0 flex items-center justify-center text-sm`}
            style={{ backgroundColor: `#${bgColor}`, color: `#${textColor}` }}
        >
            {initials}
        </div>
    );
};

export default UIAvatar;