import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, ArrowRight, Shield, Zap, CreditCard, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ClientRegister = () => {
    const navigate = useNavigate();
    const { register, login } = useAuth();
    const [step, setStep] = useState(1);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        sector: ''
    });
    const [allSectors, setAllSectors] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/sectors`);
                setAllSectors(res.data);
            } catch (err) { console.error('Failed to fetch sectors'); }
        };
        fetchSectors();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.sector) {
            setError('Please select an industry sector');
            return;
        }
        setError('');
        setLoading(true);
        try {
            // Register as Client via AuthContext (ensures token/user state is set)
            await register(
                formData.name,
                formData.email,
                formData.password,
                'client',
                'client',
                { sector: formData.sector }
            );
            
            // Move to Step 2 (Plan Selection)
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFree = () => {
        // Since we already logged in, just navigate to the dashboard
        // The backend automatically assumes default 'free' plan for newly created clients
        navigate('/dashboard');
    };

    const handleSelectPaid = () => {
        alert("Payment integration coming soon! You can continue using the Free tier for now.");
    };

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: "'Inter', sans-serif" }}>
            
            {step === 1 && (
                <div style={{ background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', width: '100%', maxWidth: '440px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Building2 size={32} color="#4F46E5" />
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', color: '#2D3748' }}>Register Your Business</h1>
                        <p style={{ color: '#64748B', fontSize: '15px' }}>Start managing appointments in minutes.</p>
                    </div>

                    {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>{error}</div>}

                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>Business Name</label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={18} color="#718096" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input style={{ width: '100%', padding: '14px 16px 14px 44px', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC' }} placeholder="e.g. Acme Health Clinic" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>Admin Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} color="#718096" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input style={{ width: '100%', padding: '14px 16px 14px 44px', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC' }} type="email" placeholder="admin@acme.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>Industry Sector</label>
                            <div style={{ position: 'relative' }}>
                                <Shield size={18} color="#718096" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <select 
                                    style={{ width: '100%', padding: '14px 16px 14px 44px', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', appearance: 'none' }} 
                                    value={formData.sector} 
                                    onChange={e => setFormData({...formData, sector: e.target.value})} 
                                    required
                                >
                                    <option value="">Select Industry...</option>
                                    {allSectors.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>Secure Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="#718096" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input style={{ width: '100%', padding: '14px 16px 14px 44px', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC' }} type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength={6} />
                            </div>
                        </div>


                        <button disabled={loading} type="submit" style={{ padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#2D3748', fontWeight: 800, fontSize: '16px', cursor: 'pointer', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Creating Account...' : 'Continue to Plans'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748B' }}>
                        Already have an account? <Link to="/login" style={{ color: '#4F46E5', fontWeight: 800, textDecoration: 'none' }}>Log in</Link>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div style={{ width: '100%', maxWidth: '1200px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#DCFCE7', color: '#16A34A', padding: '8px 16px', borderRadius: '100px', fontWeight: 800, fontSize: '14px', marginBottom: '16px' }}>
                            <CheckCircle2 size={16} /> Account Created Successfully
                        </div>
                        <h1 style={{ fontSize: '40px', fontWeight: 900, marginBottom: '16px', color: '#2D3748' }}>Choose Your Plan</h1>
                        <p style={{ color: '#64748B', fontSize: '18px' }}>Scale your business scheduling on your own terms.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                        {/* BASIC PLAN */}
                        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: '#2D3748', marginBottom: '8px' }}>Basic Plan</div>
                            <div style={{ fontSize: '48px', fontWeight: 900, color: '#4F46E5', marginBottom: '32px' }}>Rs. 0<span style={{ fontSize: '16px', color: '#718096' }}>/mo</span></div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#64748B', fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, marginBottom: '32px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ArrowRight size={18} color="#4F46E5" /> 50 Bookings / month</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ArrowRight size={18} color="#4F46E5" /> 2 HR & Employees</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ArrowRight size={18} color="#4F46E5" /> 2 Services</li>
                            </ul>
                            <button onClick={handleSelectFree} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '2px solid #E2E8F0', background: 'white', color: '#2D3748', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>Start Free Plan</button>
                            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#718096', marginTop: '16px', textTransform: 'uppercase' }}>Best to Try</div>
                        </div>

                        {/* PRO PLAN */}
                        <div style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', padding: '48px 40px', borderRadius: '24px', color: '#2D3748', position: 'relative', display: 'flex', flexDirection: 'column', transform: 'scale(1.05)', zIndex: 10, boxShadow: '0 25px 50px -12px rgba(79,70,229,0.3)' }}>
                            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#F59E0B', color: '#2D3748', fontSize: '12px', fontWeight: 900, padding: '6px 16px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Most Popular</div>
                            <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Pro Plan</div>
                            <div style={{ fontSize: '48px', fontWeight: 900, marginBottom: '32px' }}>Rs. 299<span style={{ fontSize: '16px', opacity: 0.8 }}>/mo</span></div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, marginBottom: '32px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ArrowRight size={18} color="#F59E0B" /> 500 Bookings / month</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ArrowRight size={18} color="#F59E0B" /> 5 HR & Employees</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ArrowRight size={18} color="#F59E0B" /> 10 Services</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Shield size={18} color="#F59E0B" /> Basic Analytics</li>
                            </ul>
                            <button onClick={handleSelectPaid} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'white', color: '#4F46E5', fontWeight: 900, fontSize: '16px', cursor: 'pointer' }}>Proceed to Payment</button>
                            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 800, opacity: 0.8, marginTop: '16px', textTransform: 'uppercase' }}>Best to Grow</div>
                        </div>

                        {/* PREMIUM PLAN */}
                        <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '24px', color: '#2D3748', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Premium Plan</div>
                            <div style={{ fontSize: '48px', fontWeight: 900, color: '#38BDF8', marginBottom: '32px' }}>Rs. 799<span style={{ fontSize: '16px', color: '#64748B' }}>/mo</span></div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, marginBottom: '32px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ArrowRight size={18} color="#38BDF8" /> Unlimited Bookings</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ArrowRight size={18} color="#38BDF8" /> Unlimited Staff</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ArrowRight size={18} color="#38BDF8" /> Unlimited Services</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Zap size={18} color="#38BDF8" /> Advanced Integrations</li>
                            </ul>
                            <button onClick={handleSelectPaid} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: '#1E293B', color: '#2D3748', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>Proceed to Payment</button>
                            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#64748B', marginTop: '16px', textTransform: 'uppercase' }}>Best to Scale</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientRegister;
