import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Lock, ArrowRight, Building2, 
    ChevronRight, ArrowLeft, Check, Sparkles, 
    Globe, Image as ImageIcon, FileText, Briefcase, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { LottieWrapper } from '../components';

const Register = () => {
    const { register, updateUser, user: authUser } = useAuth();
    const { theme, isDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const initialRole = params.get('role') || 'user';

    const [step, setStep] = useState(1); // 1: Info, 2: Role, 3: Industry (Providers), 4: Success
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: initialRole,
        sectorCategory: '',
        sectorName: '',
        organizationName: '',
        organizationLogo: '',
        organizationWebsite: '',
        organizationDescription: ''
    });

    const [allSectors, setAllSectors] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (authUser) navigate('/dashboard');
        const fetchSectors = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/sectors`);
                if (Array.isArray(res.data)) {
                    setAllSectors(res.data);
                    const cats = [...new Set(res.data.map(s => s.category))];
                    setCategories(cats);
                }
            } catch (err) { console.error('Failed to fetch sectors:', err); }
        };
        fetchSectors();
    }, [authUser, navigate]);

    const handleNext = () => {
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password) {
                setError('Please fill in all fields');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            if (!formData.sectorName || (formData.role === 'client' && !formData.organizationName)) {
                setError(formData.role === 'client' ? 'Please provide industry and organization details' : 'Please select an industry sector');
                return;
            }
            handleSubmit();
        }
        setError('');
    };

    const handleBack = () => {
        setError('');
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await register(
                formData.name, 
                formData.email.trim().toLowerCase(), 
                formData.password, 
                formData.role,
                formData.role === 'client' ? 'client' : 'user',
                {
                    sector: formData.sectorName,
                    organizationName: formData.organizationName,
                    organizationLogo: formData.organizationLogo,
                    organizationWebsite: formData.organizationWebsite,
                    organizationDescription: formData.organizationDescription
                }
            );
            if (res && formData.role === 'client') {
                setIsCompleting(true);
            }
            // Move to success step briefly before navigate
            setStep(4);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.msg || 'Registration failed. Please check your network.');
            // Don't change step, stay on the form
        } finally {
            setIsLoading(false);
            setIsCompleting(false);
        }
    };

    return (
        <div className="register-page" style={{ minHeight: '100vh', display: 'flex', background: theme.bgSecondary, fontFamily: "'Outfit', sans-serif", color: theme.text }}>
            <style>{`
                @media (max-width: 968px) {
                    .register-page { flex-direction: column !important; }
                    .register-info-panel { display: none !important; }
                    .register-form-container { padding: 24px !important; width: 100% !important; }
                    .register-card { padding: 32px !important; border-radius: 24px !important; }
                    .register-title { fontSize: 26px !important; }
                }
            `}</style>
            <div className="register-form-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <motion.form 
                    onSubmit={(e) => { e.preventDefault(); handleNext(); }}
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="register-card"
                    style={{ width: '100%', maxWidth: '480px', background: theme.card, padding: '48px', borderRadius: '32px', boxShadow: `0 20px 50px ${theme.cardGlow}`, border: `1px solid ${theme.cardBorder}` }}
                >
                    
                    {step < 4 && (
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{ background: theme.primary, width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', margin: '0 auto 20px', boxShadow: `0 10px 20px ${theme.cardGlow}` }}><Sparkles size={24}/></div>
                            <h2 style={{ fontSize: '32px', fontWeight: 900, color: theme.text, letterSpacing: '-1px' }}>Create Account</h2>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{ width: '30px', height: '4px', borderRadius: '2px', background: step >= i ? theme.secondary : theme.cardBorder, transition: '0.3s' }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 700, border: '1px solid #FEE2E2' }}>{error}</div>}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div><label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>Full Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `2px solid ${theme.cardBorder}`, background: theme.bgSecondary, color: theme.text, outline: 'none' }} placeholder="John Doe"/></div>
                                    <div><label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>Email Address</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `2px solid ${theme.cardBorder}`, background: theme.bgSecondary, color: theme.text, outline: 'none' }} placeholder="john@example.com"/></div>
                                    <div><label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: theme.text, marginBottom: '8px' }}>Password</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `2px solid ${theme.cardBorder}`, background: theme.bgSecondary, color: theme.text, outline: 'none' }} placeholder="••••••••"/></div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div onClick={() => { setFormData({...formData, role: 'user'}); }} style={{ padding: '24px', borderRadius: '20px', border: formData.role === 'user' ? `2px solid ${theme.secondary}` : `2px solid ${theme.cardBorder}`, background: formData.role === 'user' ? theme.cardHover : theme.card, cursor: 'pointer', transition: '0.2s' }}>
                                        <div style={{ fontWeight: 900, color: theme.text, display: 'flex', alignItems: 'center', gap: '10px' }}><User size={20} color={formData.role === 'user' ? theme.secondary : theme.textMuted}/> I'm a Customer</div>
                                        <p style={{ fontSize: '13px', color: theme.textMuted, margin: '8px 0 0', lineHeight: 1.6 }}>Browse services, book appointments, and track your history.</p>
                                    </div>
                                    <div onClick={() => { setFormData({...formData, role: 'client'}); }} style={{ padding: '24px', borderRadius: '20px', border: formData.role === 'client' ? `2px solid ${theme.secondary}` : `2px solid ${theme.cardBorder}`, background: formData.role === 'client' ? theme.cardHover : theme.card, cursor: 'pointer', transition: '0.2s', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '-10px', right: '16px', background: theme.primary, color: '#FFFFFF', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 900 }}>🎁 1 DAY FREE TRIAL</div>
                                        <div style={{ fontWeight: 900, color: theme.text, display: 'flex', alignItems: 'center', gap: '10px' }}><Building2 size={20} color={formData.role === 'client' ? theme.secondary : theme.textMuted}/> I'm a Business Owner</div>
                                        <p style={{ fontSize: '13px', color: theme.textMuted, margin: '8px 0 0', lineHeight: 1.6 }}>Register your business, manage staff & bookings. <strong>Pay after 1 day trial.</strong></p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
                                            {formData.role === 'client' ? 'Industry Sector' : 'Primary Interest (Sector)'}
                                        </label>
                                        <select value={formData.sectorName} onChange={e => setFormData({...formData, sectorName: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #F1F5F9', outline: 'none', fontWeight: 700 }}>
                                            <option value="">Select Industry...</option>
                                            {allSectors.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    {formData.role === 'client' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>Organization Name</label>
                                            <input type="text" value={formData.organizationName} onChange={e => setFormData({...formData, organizationName: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #F1F5F9', outline: 'none' }} placeholder="e.g. Acme Services"/>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ height: '180px', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                                    <LottieWrapper url="https://assets8.lottiefiles.com/packages/lf20_jcikwtux.json" style={{ width: '180px', height: '180px' }} fallbackIcon={CheckCircle} />
                                </div>
                                <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#2D3748', marginBottom: '12px' }}>Welcome Aboard! 🎉</h2>
                                <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '16px' }}>Account created successfully. Redirecting to your dashboard...</p>
                                {formData.role === 'client' && (
                                    <div style={{ background: '#EEF2FF', padding: '16px', borderRadius: '16px', border: '1px solid #C7D2FE' }}>
                                        <p style={{ fontSize: '14px', fontWeight: 800, color: '#4F46E5' }}>🎁 Your 1-Day Free Trial is now active!</p>
                                        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Upgrade after trial to continue all features.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step < 4 && (
                        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                            {step > 1 && <button type="button" onClick={handleBack} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: theme.bgSecondary, color: theme.text, fontWeight: 900, border: `1px solid ${theme.cardBorder}`, cursor: 'pointer' }}>Back</button>}
                            <button type="button" onClick={handleNext} disabled={isLoading} style={{ flex: 2, padding: '16px', borderRadius: '16px', background: theme.primary, color: '#FFFFFF', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: `0 10px 20px rgba(0,0,0,0.2)` }}>
                                {isLoading ? 'Processing...' : (step === 3 ? 'Create Account' : 'Continue')} <ArrowRight size={18}/>
                            </button>
                        </div>
                    )}
                </motion.form>
            </div>
            <div className="register-info-panel" style={{ flex: 1, background: theme.card, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text, padding: '80px', position: 'relative', overflow: 'hidden', borderLeft: `1px solid ${theme.cardBorder}` }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', opacity: 0.2 }} />
                <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', opacity: 0.1 }} />
                
                <div style={{ maxWidth: '400px', position: 'relative', zIndex: 1 }}>
                    <div style={{ height: '250px', marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(90, 49, 93, 0.05)', borderRadius: '40px' }}>
                            <CheckCircle size={120} color={theme.primary} opacity={0.3} />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '48px', fontWeight: 950, marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-1px', color: theme.text }}>Join the Future of Scheduling.</h1>
                    <p style={{ fontSize: '18px', color: theme.textMuted, lineHeight: 1.6, marginBottom: '24px' }}>The world's most advanced platform for appointment management and business growth.</p>
                    <div style={{ background: theme.cardHover, padding: '16px 20px', borderRadius: '16px', marginBottom: '24px', border: `1px solid ${theme.cardBorder}` }}>
                        <p style={{ fontWeight: 900, fontSize: '15px', color: theme.secondary }}>🎁 Business Owners: 1 Day Free Trial</p>
                        <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '4px' }}>Register → Select Sector → Get your dashboard instantly. Pay only after 1 day.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                        <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 900, color: theme.text }}>5K+</div><div style={{ fontSize: '12px', color: theme.textMuted }}>Businesses</div></div>
                        <div style={{ width: '1px', background: theme.cardBorder }} />
                        <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 900, color: theme.text }}>1M+</div><div style={{ fontSize: '12px', color: theme.textMuted }}>Bookings</div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
