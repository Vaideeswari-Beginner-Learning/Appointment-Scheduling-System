const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Local development detection
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `http://${hostname}:5002`;
        }
        
        // diagnostic alert
        const url = 'https://appointment-scheduling-system-tnzt.onrender.com';
        console.log('🔗 CURRENT API URL:', url);
        
        // In production: Use the new Render URL exclusively
        return url;
    }
    return 'http://localhost:5002';
};

export const SERVER_URL = getBaseUrl();
export const API_BASE_URL = `${SERVER_URL}/api`;
export const UPI_ID = 'forgeindia@upi';
export const UPI_NAME = 'Forge India';
