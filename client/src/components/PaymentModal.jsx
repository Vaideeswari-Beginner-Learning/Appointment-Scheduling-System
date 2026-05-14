import React, { useState } from 'react';
import axios from 'axios';
import { X, CreditCard, Smartphone, CheckCircle2, Building, Banknote, Landmark, QrCode } from 'lucide-react';
import { API_BASE_URL, UPI_ID, UPI_NAME } from '../config/api';

const PaymentModal = ({ appointment, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1=choose method, 2=processing, 3=success
    const [method, setMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const amount = appointment?.payment?.amount || 299;

    const handlePay = async () => {
        if (method === 'upi' && !upiId.trim()) { setError('Please enter your UPI ID'); return; }
        setLoading(true);
        setStep(2);
        try {
            const token = localStorage.getItem('token');
            // Step 1: Create order
            const orderRes = await axios.post(`${API_BASE_URL}/payments/create-order`,
                { appointmentId: appointment._id, amount, method },
                { headers: { 'x-auth-token': token } }
            );
            // Simulate 2 second processing
            await new Promise(r => setTimeout(r, 2000));
            // Step 2: Verify
            await axios.post(`${API_BASE_URL}/payments/verify`,
                { appointmentId: appointment._id, orderId: orderRes.data.orderId, amount, method },
                { headers: { 'x-auth-token': token } }
            );
            setStep(3);
            setTimeout(() => { onSuccess?.(); onClose(); }, 800);
        } catch (err) {
            setError(err.response?.data?.message || 'Payment failed. Please try again.');
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '24px', width: '440px', maxWidth: '95vw', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#2D3748' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900 }}>Secure Payment</div>
                        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>Appointment #{appointment?._id?.slice(-6).toUpperCase()}</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(90, 49, 93, 0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#2D3748', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '28px' }}>
                    {/* Amount */}
                    <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '20px', textAlign: 'center', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Amount to Pay</div>
                        <div style={{ fontSize: '42px', fontWeight: 900, color: '#2D3748' }}>Rs. {amount}</div>
                        <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>{appointment?.purpose || 'Appointment Service'}</div>
                    </div>

                    {step === 1 && (
                        <>
                            {/* Payment Method Selection */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>Choose Payment Method</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {[
                                        { id: 'upi', label: 'UPI', icon: <Smartphone size={22} />, desc: 'Pay via UPI ID' },
                                        { id: 'card', label: 'Card', icon: <CreditCard size={22} />, desc: 'Credit / Debit' },
                                        { id: 'netbanking', label: 'Net Banking', icon: <Landmark size={22} />, desc: 'All major banks' },
                                        { id: 'cash', label: 'Pay at Venue', icon: <Banknote size={22} />, desc: 'Cash on arrival' },
                                    ].map(m => (
                                        <button key={m.id} onClick={() => setMethod(m.id)} style={{
                                            padding: '14px', border: `2px solid ${method === m.id ? '#4F46E5' : '#E2E8F0'}`,
                                            borderRadius: '12px', background: method === m.id ? '#EEF2FF' : 'white',
                                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                                        }}>
                                            <div style={{ marginBottom: '4px', color: method === m.id ? '#4F46E5' : '#64748B' }}>{m.icon}</div>
                                            <div style={{ fontWeight: 800, fontSize: '13px', color: method === m.id ? '#4F46E5' : '#FFFFFF' }}>{m.label}</div>
                                            <div style={{ fontSize: '11px', color: '#718096' }}>{m.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {method === 'upi' && (
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <div style={{ background: '#1A1A2E', padding: '32px 24px', borderRadius: '32px', border: '1px solid rgba(90, 49, 93, 0.1)', textAlign: 'center', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#5E239D', color: '#2D3748', padding: '10px 20px', borderRadius: '100px', width: 'fit-content', margin: '0 auto 28px', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            <Smartphone size={16} /> Secure PhonePe Payment
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Amount to Pay</div>
                                            <div style={{ fontSize: '42px', fontWeight: 950, color: '#5A315D' }}>Rs. {amount}</div>
                                        </div>
                                        
                                        <div style={{ background: '#1A1A2E', padding: '20px', borderRadius: '28px', display: 'inline-block', border: '1px solid rgba(90, 49, 93, 0.1)', position: 'relative', marginBottom: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                                            <img 
                                                src="/phonepe-qr.jpeg" 
                                                alt="PhonePe QR Code" 
                                                style={{ width: '200px', height: '200px', borderRadius: '12px', display: 'block', objectFit: 'contain' }} 
                                                onError={(e) => {
                                                    if (e.target.src.includes('phonepe-qr.jpeg')) {
                                                        e.target.src = '/qr-payment-v2.png';
                                                    } else if (e.target.src.includes('qr-payment-v2.png')) {
                                                        e.target.src = '/qr-payment-new.png';
                                                    } else if (e.target.src.includes('qr-payment-new.png')) {
                                                        e.target.src = '/qr-payment.jpg';
                                                    } else {
                                                        e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR`;
                                                    }
                                                }}
                                            />
                                            {/* Decorative Corner Accents */}
                                            <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderTop: '2px solid rgba(90, 49, 93, 0.2)', borderLeft: '2px solid rgba(90, 49, 93, 0.2)', borderRadius: '4px 0 0 0' }}></div>
                                            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderBottom: '2px solid rgba(90, 49, 93, 0.2)', borderRight: '2px solid rgba(90, 49, 93, 0.2)', borderRadius: '0 0 4px 0' }}></div>
                                        </div>

                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>Scan with any UPI App</div>
                                        <div style={{ color: '#2D3748', fontSize: '18px', fontWeight: 950, letterSpacing: '0.5px' }}>{UPI_ID}</div>

                                        <div style={{ background: 'rgba(90, 49, 93, 0.1)', padding: '10px 16px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#5A315D', fontWeight: 800, marginTop: '24px', border: '1px solid rgba(90, 49, 93, 0.2)' }}>
                                            <div style={{ width: '6px', height: '6px', background: '#5A315D', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                                            Secure System Verification Active
                                        </div>
                                    </div>
                                    <input
                                        value={upiId} onChange={e => setUpiId(e.target.value)}
                                        placeholder="Or enter UPI ID (e.g. name@upi)"
                                        style={{ width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                    />
                                </div>
                            )}

                            {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

                            <button onClick={handlePay} style={{
                                width: '100%', padding: '16px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                                color: '#2D3748', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '16px',
                                cursor: 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.3)'
                            }}>
                                Pay Rs. {amount} Securely
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ width: '60px', height: '60px', border: '4px solid #EEF2FF', borderTopColor: '#4F46E5', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#2D3748', marginBottom: '8px' }}>Processing Payment...</div>
                            <div style={{ color: '#64748B', fontSize: '14px' }}>Please do not close this window</div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                                style={{ width: '80px', height: '80px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', margin: '0 auto 24px' }}
                            >
                                <CheckCircle2 size={48} />
                            </motion.div>
                            <div style={{ fontSize: '28px', fontWeight: 950, color: '#2D3748', marginBottom: '12px' }}>Thank You!</div>
                            <div style={{ color: '#64748B', fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Your payment was processed successfully.</div>
                            
                            <div style={{ background: '#F8FAFC', padding: '12px 20px', borderRadius: '14px', color: '#4F46E5', fontSize: '13px', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #EEF2FF' }}>
                                <div style={{ width: '8px', height: '8px', background: '#4F46E5', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
                                Syncing with Dashboard...
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PaymentModal;
