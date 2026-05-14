import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, MessageCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

const AppointmentChatModal = ({ appointment, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/chat/${appointment._id}`, {
                headers: { 'x-auth-token': token }
            });
            setMessages(res.data);
        } catch (err) {
            console.error('Chat fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [appointment._id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMsg.trim()) return;
        setSending(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/chat/${appointment._id}`,
                { message: newMsg },
                { headers: { 'x-auth-token': token } }
            );
            setNewMsg('');
            fetchMessages();
        } catch (err) {
            console.error('Send error:', err);
        } finally {
            setSending(false);
        }
    };

    const isMe = (msg) => msg.senderId === user?._id || msg.senderId === user?.id;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '20px', width: '480px', maxWidth: '95vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2D3748' }}>
                        <MessageCircle size={20} />
                        <div>
                            <div style={{ fontWeight: 900, fontSize: '16px' }}>Chat Support</div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                {appointment.patientName || appointment.purpose || 'Appointment'}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(90, 49, 93, 0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#2D3748', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC' }}>
                    {loading && <div style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>Loading messages...</div>}
                    {!loading && messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#718096', padding: '40px 20px' }}>
                            <MessageCircle size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                            <p style={{ fontSize: '14px' }}>No messages yet. Start the conversation!</p>
                        </div>
                    )}
                    {messages.map(msg => (
                        <div key={msg._id} style={{ display: 'flex', justifyContent: isMe(msg) ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                                maxWidth: '70%', padding: '10px 14px', borderRadius: isMe(msg) ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                background: isMe(msg) ? '#4F46E5' : 'white',
                                color: isMe(msg) ? 'white' : '#FFFFFF',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                border: isMe(msg) ? 'none' : '1px solid #E2E8F0'
                            }}>
                                {!isMe(msg) && <div style={{ fontSize: '11px', fontWeight: 800, color: '#4F46E5', marginBottom: '4px' }}>{msg.senderName || 'Staff'}</div>}
                                <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{msg.message}</div>
                                <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} style={{ padding: '16px', background: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '10px' }}>
                    <input
                        value={newMsg}
                        onChange={e => setNewMsg(e.target.value)}
                        placeholder="Type a message..."
                        style={{ flex: 1, padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: '12px', outline: 'none', fontSize: '14px', fontFamily: 'inherit' }}
                    />
                    <button type="submit" disabled={sending || !newMsg.trim()} style={{
                        background: newMsg.trim() ? '#4F46E5' : '#E2E8F0', border: 'none', borderRadius: '12px',
                        padding: '12px 16px', cursor: newMsg.trim() ? 'pointer' : 'not-allowed', color: newMsg.trim() ? 'white' : '#718096',
                        display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                    }}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AppointmentChatModal;
