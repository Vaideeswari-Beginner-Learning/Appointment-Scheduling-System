const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Local development detection
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `http://${hostname}:5002`;
        }
        
        // Final Build Trigger v14 - Env Var Fixed 2026-05-09T12:35
        const prodUrl = 'https://appointment-scheduling-system-il7s.onrender.com';
        console.log('🔗 PROD API URL:', prodUrl);
        return prodUrl;
    }
    return 'http://localhost:5002';
};

export const SERVER_URL = getBaseUrl();
export const API_BASE_URL = `${SERVER_URL}/api`;
export const UPI_ID = 'forgeindia@upi';
export const UPI_NAME = 'Forge India';
