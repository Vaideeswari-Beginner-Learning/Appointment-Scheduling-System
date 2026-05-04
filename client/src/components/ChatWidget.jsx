import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Sparkles, Calendar, HelpCircle, PhoneCall } from 'lucide-react';

const ChatWidget = ({ role = 'user' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: role === 'client' 
                ? "Hello Admin! Welcome to your Smart Sched console. How can I help you optimize your business today?" 
                : "Hi there! Looking for an appointment? I can help you find the best professionals in your area.", 
            sender: 'bot', 
            time: new Date() 
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newUserMsg = { id: Date.now(), text: inputValue, sender: 'user', time: new Date() };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');

        // Mock Bot Response
        setTimeout(() => {
            let botResponse = "Thinking...";
            const lowInput = inputValue.toLowerCase();

            if (lowInput.includes('book') || lowInput.includes('appointment')) {
                botResponse = "To book an appointment, go to the 'Explore' tab, pick your sector, and select an organization. You'll see a 'Book Slot' button there!";
            } else if (lowInput.includes('profile')) {
                botResponse = "You can update your personal details in the 'Profile' tab of your dashboard.";
            } else if (lowInput.includes('staff') || lowInput.includes('employee')) {
                botResponse = "Clients can add staff members in the 'Staff Management' tab of the Client Dashboard.";
            } else {
                botResponse = "I'm still learning, but I can certainly help you navigate the scheduling platform. Try asking about 'booking' or 'profile'!";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot', time: new Date() }]);
        }, 1000);
    };

    const quickActions = role === 'client' 
        ? [
            { label: 'Add Staff', icon: User },
            { label: 'View Analytics', icon: Sparkles },
            { label: 'Support', icon: PhoneCall }
          ]
        : [
            { label: 'How to Book?', icon: Calendar },
            { label: 'Reset Password', icon: HelpCircle },
            { label: 'Contact Us', icon: PhoneCall }
          ];

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        style={{
                            width: '380px',
                            height: '550px',
                            background: 'white',
                            borderRadius: '30px',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            border: '1px solid #E2E8F0',
                            marginBottom: '20px'
                        }}
                    >
                        {/* Header */}
                        <div style={{ background: 'linear-gradient(135deg, #4F46E5, #818CF8)', padding: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 900, fontSize: '16px' }}>Sched Bot</div>
                                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Online & Ready</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'rgba(0,0,0,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#F8FAFC' }}>
                            {messages.map(msg => (
                                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{ 
                                        maxWidth: '80%', 
                                        padding: '12px 16px', 
                                        borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: msg.sender === 'user' ? '#4F46E5' : 'white',
                                        color: msg.sender === 'user' ? 'white' : '#1E293B',
                                        boxShadow: msg.sender === 'user' ? 'none' : '0 4px 6px rgba(0,0,0,0.05)',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        lineHeight: 1.5
                                    }}>
                                        {msg.text}
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
                                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        <div style={{ padding: '12px 20px', display: 'flex', gap: '8px', overflowX: 'auto', background: 'white', borderTop: '1px solid #F1F5F9' }}>
                            {quickActions.map(action => (
                                <button 
                                    key={action.label}
                                    onClick={() => {
                                        setInputValue(action.label);
                                    }}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px', 
                                        padding: '8px 14px', 
                                        borderRadius: '12px', 
                                        border: '1px solid #E2E8F0', 
                                        background: 'white', 
                                        fontSize: '12px', 
                                        fontWeight: 800, 
                                        color: '#475569', 
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <action.icon size={14} color="#4F46E5" /> {action.label}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '12px' }}>
                            <input 
                                style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 16px', outline: 'none', background: '#F8FAFC', fontWeight: 600 }}
                                placeholder="Write your message..."
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                            />
                            <button 
                                onClick={handleSend}
                                style={{ background: '#4F46E5', border: 'none', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bubble Trigger */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '22px',
                    background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
                    boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
