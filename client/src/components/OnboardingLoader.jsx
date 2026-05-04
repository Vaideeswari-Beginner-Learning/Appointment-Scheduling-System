import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Sparkles, Star, Heart, 
    Smile, Rocket, CheckCircle2, ShieldCheck 
} from 'lucide-react';

const emojis = ['[1]', '[2]', '[3]', '[4]', '[5]', '[6]', '[7]', '[8]'];
const illustrations = [Rocket, Zap, Sparkles, ShieldCheck, Heart, Star, Smile];

const OnboardingLoader = ({ onComplete }) => {
    const [currentEmoji, setCurrentEmoji] = useState(0);
    const [status, setStatus] = useState('Initializing Systems...');

    useEffect(() => {
        const emojiInterval = setInterval(() => {
            setCurrentEmoji(prev => (prev + 1) % emojis.length);
        }, 400);

        const statusInterval = setInterval(() => {
            const messages = [
                'Setting up your workspace...',
                'Fetching industry configurations...',
                'Applying premium branding...',
                'Optimizing your dashboard...',
                'Almost ready!'
            ];
            setStatus(prev => {
                const idx = messages.indexOf(prev);
                return messages[(idx + 1) % messages.length];
            });
        }, 800);

        const timeout = setTimeout(() => {
            onComplete();
        }, 4000);

        return () => {
            clearInterval(emojiInterval);
            clearInterval(statusInterval);
            clearTimeout(timeout);
        };
    }, [onComplete]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
                position: 'fixed', 
                inset: 0, 
                background: 'white', 
                zIndex: 9000, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontFamily: "'Inter', sans-serif"
            }}
        >
            <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Outer Ring */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    style={{ 
                        position: 'absolute', 
                        inset: 0, 
                        border: '2px dashed #E2E8F0', 
                        borderRadius: '50%' 
                    }}
                />
                
                {/* Floating Icons */}
                {illustrations.map((Icon, i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            y: [0, -10, 0],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            delay: i * 0.3 
                        }}
                        style={{ 
                            position: 'absolute',
                            top: `${50 + 40 * Math.sin(i * (2 * Math.PI / illustrations.length))}%`,
                            left: `${50 + 40 * Math.cos(i * (2 * Math.PI / illustrations.length))}%`,
                            color: '#4F46E5'
                        }}
                    >
                        <Icon size={20} />
                    </motion.div>
                ))}

                {/* Central Emoji */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentEmoji}
                        initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                        exit={{ scale: 1.5, opacity: 0, rotate: 20 }}
                        transition={{ type: 'spring', damping: 10 }}
                        style={{ fontSize: '64px' }}
                    >
                        {emojis[currentEmoji]}
                    </motion.div>
                </AnimatePresence>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '40px', textAlign: 'center' }}
            >
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
                    Welcome to the Future
                </h2>
                <p style={{ color: '#64748B', fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                   <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                   >
                        {status}
                   </motion.span>
                </p>
            </motion.div>

            {/* Progress Bar */}
            <div style={{ width: '200px', height: '6px', background: '#F1F5F9', borderRadius: '3px', marginTop: '32px', overflow: 'hidden' }}>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 4, ease: 'linear' }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #4F46E5, #7C3AED)' }}
                />
            </div>
        </motion.div>
    );
};

export default OnboardingLoader;
