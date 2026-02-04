export const getMedicineBadge = (title) => {
    if (!title) return "??";

    // Clean up title (remove common prefix/suffix words)
    const cleanTitle = title.replace(/Vitamin|Organic|Pure|Concentrated|Supplements|5000mcg|400mg|1500mg/gi, '').trim();

    // Split and take the last part if it looks like a short code (e.g., "D3")
    // Otherwise take the first important word
    const parts = cleanTitle.split(' ').filter(p => p.length > 0);

    if (parts.length === 0) return title.substring(0, 2).toUpperCase();

    // If the last word is short (like D3, B12, K2), use it
    if (parts[parts.length - 1].length <= 3) {
        return parts[parts.length - 1].toUpperCase();
    }

    return parts[0].toUpperCase();
};

export const getVibrantColor = (input) => {
    const colors = [
        '#E0F2FE', // Light Blue
        '#F3E8FF', // Light Purple
        '#FCE7F3', // Light Pink
        '#FEE2E2', // Light Red
        '#FFEDD5', // Light Orange
        '#DCFCE7', // Light Green
        '#ECFEFF', // Light Cyan
        '#E0E7FF', // Light Indigo
        '#F0FDF4', // Light Emerald
        '#FEF9C3'  // Light Yellow
    ];

    let hash = 0;
    const str = String(input);
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
};
