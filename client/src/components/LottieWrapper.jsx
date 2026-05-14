import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Activity } from 'lucide-react';

const LottieWrapper = ({ url, style, fallbackIcon: FallbackIcon = Activity }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        const loadLottie = async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Received non-JSON response from Lottie URL");
                }
                const json = await response.json();
                if (isMounted) {
                    setData(json);
                    setError(false);
                }
            } catch (e) {
                console.warn('LottieWrapper: Failed to load animation from', url, e.message);
                if (isMounted) {
                    setError(true);
                }
            }
        };

        loadLottie();
        
        return () => {
            isMounted = false;
        };
    }, [url]);

    if (data && !error) {
        return <Lottie animationData={data} loop={true} autoplay={true} style={style} />;
    }

    return (
        <div style={{
            ...style, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(241, 245, 249, 0.5)',
            borderRadius: 'inherit'
        }}>
            <FallbackIcon size={40} color="#cbd5e1" />
        </div>
    );
};

export default LottieWrapper;
