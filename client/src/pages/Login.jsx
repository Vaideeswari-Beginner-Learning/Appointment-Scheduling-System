import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, LogIn, User, Building2, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const { login, user } = useAuth();
    const showToast = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email.trim().toLowerCase(), password);
            showToast('Welcome back! Logging you in...', 'success');
            navigate('/dashboard');
        } catch (err) {
            console.error('Login Error details:', err);
            const msg = err.response?.data?.message || err.response?.data?.msg || `Connection failed (${err.response?.status || err.message}). The backend server is unreachable or returning an error.`;
            showToast(msg, 'error');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Outfit', sans-serif" }}>
            <style>{`
                @media (max-width: 968px) {
                    .login-side-panel { display: none !important; }
                    .login-form-side { width: 100% !important; padding: 24px !important; }
                }
            `}</style>

            {/* LEFT - FORM */}
            <div className="login-form-side" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#F8FAFC' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '440px', background: 'white', padding: '48px', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.06)' }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ background: '#6366F1', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(99,102,241,0.3)' }}>
                            <LogIn size={24} />
                        </div>
                        <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Welcome Back</h2>
                        <p style={{ color: '#64748B', fontWeight: 600, fontSize: '15px' }}>Login to your account</p>
                    </div>

                    {error && (
                        <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '16px', borderRadius: '14px', marginBottom: '24px', fontSize: '14px', fontWeight: 700, border: '1px solid #FEE2E2' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                    placeholder="name@company.com"
                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '14px', border: '2px solid #F1F5F9', outline: 'none', fontSize: '15px', fontWeight: 600, transition: '0.2s' }}
                                    onFocus={e => e.target.style.borderColor = '#6366F1'}
                                    onBlur={e => e.target.style.borderColor = '#F1F5F9'}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '28px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '14px', border: '2px solid #F1F5F9', outline: 'none', fontSize: '15px', fontWeight: 600, transition: '0.2s' }}
                                    onFocus={e => e.target.style.borderColor = '#6366F1'}
                                    onBlur={e => e.target.style.borderColor = '#F1F5F9'}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{ 
                            width: '100%', height: '56px', borderRadius: '16px', background: '#6366F1', color: 'white', 
                            fontWeight: 900, fontSize: '16px', border: 'none', cursor: 'pointer', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', gap: '10px',
                            boxShadow: '0 10px 25px rgba(99,102,241,0.3)', opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? 'Logging in...' : 'Login'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
                        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>Don't have an account?</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link to="/register?role=user" style={{ 
                                flex: 1, padding: '14px', borderRadius: '14px', background: '#F1F5F9', 
                                color: '#0F172A', fontWeight: 800, fontSize: '14px', textDecoration: 'none', 
                                textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: '0.2s', border: '2px solid transparent'
                            }}>
                                <User size={16} /> Customer
                            </Link>
                            <Link to="/register?role=client" style={{ 
                                flex: 1, padding: '14px', borderRadius: '14px', background: '#EEF2FF', 
                                color: '#6366F1', fontWeight: 800, fontSize: '14px', textDecoration: 'none', 
                                textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: '0.2s', border: '2px solid #C7D2FE'
                            }}>
                                <Building2 size={16} /> Business Owner
                            </Link>
                        </div>
                        <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '12px' }}>🎁 Business owners get <strong style={{ color: '#6366F1' }}>1 Day Free Trial</strong></p>
                    </div>
                </motion.div>
            </div>

            {/* RIGHT - INFO PANEL */}
            <div className="login-side-panel" style={{ flex: 1, background: 'linear-gradient(135deg, #6366F1, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '80px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                
                <div style={{ maxWidth: '420px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 20px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '13px', fontWeight: 800 }}>
                        <Sparkles size={14} /> Smart Appointment System
                    </div>
                    <h1 style={{ fontSize: '48px', fontWeight: 950, marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-2px' }}>
                        Two Ways to Use ForgeIndia
                    </h1>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <User size={20} />
                                <span style={{ fontWeight: 900, fontSize: '18px' }}>As a Customer</span>
                            </div>
                            <p style={{ opacity: 0.8, fontSize: '14px', lineHeight: 1.6 }}>Browse services, book appointments with professionals, track your visits.</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <Building2 size={20} />
                                <span style={{ fontWeight: 900, fontSize: '18px' }}>As a Business Owner</span>
                            </div>
                            <p style={{ opacity: 0.8, fontSize: '14px', lineHeight: 1.6 }}>Register your organization, manage staff, accept bookings. <strong>1 Day Free Trial!</strong></p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '32px', marginTop: '48px' }}>
                        <div><div style={{ fontSize: '28px', fontWeight: 900 }}>5K+</div><div style={{ fontSize: '12px', opacity: 0.7 }}>Businesses</div></div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                        <div><div style={{ fontSize: '28px', fontWeight: 900 }}>1M+</div><div style={{ fontSize: '12px', opacity: 0.7 }}>Bookings</div></div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                        <div><div style={{ fontSize: '28px', fontWeight: 900 }}>4.9</div><div style={{ fontSize: '12px', opacity: 0.7 }}>Rating</div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
