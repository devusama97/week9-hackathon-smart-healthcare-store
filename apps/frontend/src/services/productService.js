const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const fetchProducts = async (search = '') => {
    const url = search
        ? `${API_URL}/products?search=${encodeURIComponent(search)}`
        : `${API_URL}/products`;
    const response = await fetch(url);
    return response.json();
};

export const aiSearch = async (query) => {
    const response = await fetch(`${API_URL}/ai/search?q=${encodeURIComponent(query)}`);
    return response.json();
};

export const chatWithAi = async (message) => {
    const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    });
    return response.json();
};
