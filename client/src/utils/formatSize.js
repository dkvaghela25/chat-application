export const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    if (bytes < 0) return 'Invalid size';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const unitIndex = Math.min(i, sizes.length - 1);

    return `${(bytes / Math.pow(k, unitIndex)).toFixed(1)} ${sizes[unitIndex]}`;
};