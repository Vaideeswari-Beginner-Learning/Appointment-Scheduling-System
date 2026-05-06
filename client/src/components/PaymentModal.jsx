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
            setTimeout(() => { onSuccess?.(); onClose(); }, 2000);
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
                    <div style={{ color: 'white' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900 }}>Secure Payment</div>
                        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>Appointment #{appointment?._id?.slice(-6).toUpperCase()}</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '28px' }}>
                    {/* Amount */}
                    <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '20px', textAlign: 'center', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Amount to Pay</div>
                        <div style={{ fontSize: '42px', fontWeight: 900, color: '#0F172A' }}>Rs. {amount}</div>
                        <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>{appointment?.purpose || 'Appointment Service'}</div>
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
                                            <div style={{ fontWeight: 800, fontSize: '13px', color: method === m.id ? '#4F46E5' : '#0F172A' }}>{m.label}</div>
                                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{m.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {method === 'upi' && (
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <div style={{ background: '#FFFFFF', padding: '32px 24px', borderRadius: '32px', border: '1px solid #E2E8F0', textAlign: 'center', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#5E239D', color: 'white', padding: '10px 24px', borderRadius: '100px', width: '100%', justifyContent: 'center', fontWeight: 900, fontSize: '14px', marginBottom: '28px', boxShadow: '0 4px 12px rgba(94, 35, 157, 0.2)' }}>
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png" alt="PhonePe" style={{ height: '20px', filter: 'brightness(0) invert(1)' }} />
                                            <span>Secure PhonePe Checkout</span>
                                        </div>
                                        
                                        <div style={{ background: 'white', padding: '15px', borderRadius: '24px', display: 'inline-block', border: '1px solid #F1F5F9', position: 'relative', marginBottom: '20px' }}>
                                            <img 
                                                src="/qr-payment-new.png" 
                                                alt="PhonePe QR Code" 
                                                style={{ width: '200px', height: '200px', borderRadius: '8px', display: 'block', objectFit: 'contain' }} 
                                                onError={(e) => {
                                                    if (e.target.src.includes('qr-payment-new.png')) {
                                                        e.target.src = '/qr-payment.jpg';
                                                    } else if (e.target.src.includes('qr-payment.jpg')) {
                                                        e.target.src = '/images/phonepe_qr.png';
                                                    } else {
                                                        e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR`;
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 800, marginBottom: '4px', letterSpacing: '0.5px' }}>SCAN WITH ANY UPI APP</div>
                                            <div style={{ fontSize: '18px', fontWeight: 950, color: '#0F172A' }}>{UPI_ID}</div>
                                        </div>

                                        <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#16A34A', fontWeight: 800, marginTop: '20px', border: '1px solid #DCFCE7' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#16A34A', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                                            Awaiting Payment Confirmation
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
                                color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '16px',
                                cursor: 'pointer', boxShadow: '0 8px 20px rgba(79,70,229,0.3)'
                            }}>
                                Pay Rs. {amount} Securely
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ width: '60px', height: '60px', border: '4px solid #EEF2FF', borderTopColor: '#4F46E5', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Processing Payment...</div>
                            <div style={{ color: '#64748B', fontSize: '14px' }}>Please do not close this window</div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <CheckCircle2 size={64} color="#16A34A" style={{ margin: '0 auto 16px', display: 'block' }} />
                            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Payment Successful!</div>
                            <div style={{ color: '#64748B', fontSize: '14px' }}>Your appointment is confirmed.</div>
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
