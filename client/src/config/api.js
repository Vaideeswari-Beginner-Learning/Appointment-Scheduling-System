const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Local development detection (localhost or local network IP)
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
            // For mobile testing, we use the hostname of the current page but port 5002 for API
            return `http://${hostname}:5002`;
        }
        
        // In production
        return 'https://appointmentscheduling-system.onrender.com';
    }
    return 'http://localhost:5002';
};

export const SERVER_URL = getBaseUrl();
export const API_BASE_URL = `${SERVER_URL}/api`;
export const UPI_ID = 'forgeindia@upi';
export const UPI_NAME = 'Forge India';
