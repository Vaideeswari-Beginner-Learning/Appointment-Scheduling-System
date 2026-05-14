import React, { useState } from 'react';
import axios from 'axios';
import { Star, X } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const RatingModal = ({ appointment, onClose, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!rating) { setError('Please select a star rating'); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/appointments/${appointment._id}/rate`,
                { rating, feedback },
                { headers: { 'x-auth-token': token } }
            );
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '420px', maxWidth: '90vw', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#2D3748' }}>Rate Your Experience</h2>
                        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '13px' }}>
                            {appointment.patientName || 'Your appointment'} - {appointment.manualDate}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
                        <X size={18} color="#64748B" />
                    </button>
                </div>

                {/* Stars */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transform: (hover || rating) >= star ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.15s' }}
                        >
                            <Star size={40}
                                fill={(hover || rating) >= star ? '#F59E0B' : 'none'}
                                color={(hover || rating) >= star ? '#F59E0B' : '#D1D5DB'}
                            />
                        </button>
                    ))}
                </div>

                {rating > 0 && (
                    <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '14px', fontWeight: 800, color: ['', '#DC2626', '#F59E0B', '#F59E0B', '#16A34A', '#16A34A'][rating] }}>
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating]}
                    </div>
                )}

                <textarea
                    placeholder="Share your experience (optional)..."
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    style={{ width: '100%', padding: '14px', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', resize: 'vertical', minHeight: '80px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '16px' }}
                />

                {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', color: '#64748B' }}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px', background: rating ? '#4F46E5' : '#E2E8F0', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: rating ? 'pointer' : 'not-allowed', color: rating ? 'white' : '#718096', transition: 'all 0.2s' }}>
                        {loading ? 'Submitting...' : 'Submit Rating'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
