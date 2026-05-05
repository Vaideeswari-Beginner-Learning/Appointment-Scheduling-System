const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5002';
        }
        // In production, assume backend is on the same domain or use a sub-domain
        // You can change this to your specific production backend URL
        return `https://${hostname.replace('vercel.app', 'onrender.com')}`; // Example pattern
    }
    return 'http://localhost:5002';
};

export const SERVER_URL = getBaseUrl();
export const API_BASE_URL = `${SERVER_URL}/api`;
