import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Sparkles, User, Building2, ArrowRight, 
    CheckCircle, Mail, Lock, Briefcase, ChevronRight 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const RegisterModal = ({ isOpen, onClose }) => {
    const { register, updateUser } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [allSectors, setAllSectors] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        sectorName: '',
        organizationName: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchSectors();
            setStep(1);
            setError('');
        }
    }, [isOpen]);

    const fetchSectors = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/sectors`);
            setAllSectors(res.data);
        } catch (err) { console.error(err); }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password) {
                setError('Please fill in all fields');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (formData.role === 'client') {
                setStep(3);
            } else {
                handleSubmit();
            }
        } else if (step === 3) {
            if (!formData.sectorName || !formData.organizationName) {
                setError('Please provide industry details');
                return;
            }
            handleSubmit();
        }
        setError('');
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await register(formData.name, formData.email.trim().toLowerCase(), formData.password, formData.role);
            if (res && formData.role === 'client') {
                await updateUser({
                    sectorName: formData.sectorName,
                    organizationName: formData.organizationName
                });
            }
            setStep(4);
            setTimeout(() => {
                onClose();
                window.location.href = '/dashboard';
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay" style={{ 
                position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', 
                backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', 
                alignItems: 'center', justifyContent: 'center', padding: '20px' 
            }} onClick={onClose}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="modal-card"
                    style={{ 
                        background: 'white', width: '100%', maxWidth: '480px', 
                        borderRadius: '32px', padding: '40px', position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <button 
                        onClick={onClose}
                        style={{ position: 'absolute', top: '24px', right: '24px', background: '#F1F5F9', border: 'none', padding: '8px', borderRadius: '12px', cursor: 'pointer', color: '#64748B' }}
                    >
                        <X size={20} />
                    </button>

                    {step < 4 && (
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ background: '#6366F1', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D3748', margin: '0 auto 20px' }}>
                                <Sparkles size={24}/>
                            </div>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#2D3748', letterSpacing: '-1px' }}>Join ForgeIndia</h2>
                            <p style={{ color: '#64748B', fontSize: '15px', marginTop: '8px' }}>Create your account to continue</p>
                        </div>
                    )}

                    {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '13px', fontWeight: 700, border: '1px solid #FEE2E2' }}>{error}</div>}

                    <div style={{ minHeight: '260px' }}>
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>Full Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} placeholder="John Doe"/></div>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>Email Address</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} placeholder="john@example.com"/></div>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>Password</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={inputStyle} placeholder="••••••••"/></div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div onClick={() => setFormData({...formData, role: 'user'})} style={roleCardStyle(formData.role === 'user')}>
                                        <User size={20} color={formData.role === 'user' ? '#6366F1' : '#64748B'}/>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: 900, fontSize: '15px' }}>I'm a Customer</div>
                                            <div style={{ fontSize: '12px', color: '#64748B' }}>Book appointments and track history.</div>
                                        </div>
                                    </div>
                                    <div onClick={() => setFormData({...formData, role: 'client'})} style={roleCardStyle(formData.role === 'client')}>
                                        <Building2 size={20} color={formData.role === 'client' ? '#6366F1' : '#64748B'}/>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: 900, fontSize: '15px' }}>I'm a Provider</div>
                                            <div style={{ fontSize: '12px', color: '#64748B' }}>Manage your business and staff.</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>Industry</label>
                                        <select value={formData.sectorName} onChange={e => setFormData({...formData, sectorName: e.target.value})} style={inputStyle}>
                                            <option value="">Select Industry...</option>
                                            {allSectors.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>Organization Name</label><input type="text" value={formData.organizationName} onChange={e => setFormData({...formData, organizationName: e.target.value})} style={inputStyle} placeholder="e.g. Acme Services"/></div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ width: '64px', height: '64px', background: '#DCFCE7', color: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <CheckCircle size={32} />
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D3748', marginBottom: '8px' }}>Success!</h2>
                                <p style={{ color: '#64748B', fontSize: '14px' }}>Redirecting to your dashboard...</p>
                            </motion.div>
                        )}
                    </div>

                    {step < 4 && (
                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            {step > 1 && <button onClick={() => setStep(prev => prev - 1)} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: '#F1F5F9', color: '#475569', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Back</button>}
                            <button onClick={handleNext} disabled={isLoading} style={{ flex: 2, padding: '14px', borderRadius: '16px', background: '#6366F1', color: '#2D3748', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {isLoading ? 'Wait...' : (step === (formData.role === 'client' ? 3 : 2) ? 'Create Account' : 'Continue')} <ArrowRight size={18}/>
                            </button>
                        </div>
                    )}
                    
                    {step === 1 && (
                        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
                            Already have an account? <span onClick={() => window.location.href='/login'} style={{ color: '#6366F1', cursor: 'pointer', fontWeight: 800 }}>Sign In</span>
                        </p>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #F1F5F9', outline: 'none', fontSize: '14px', fontWeight: 600, transition: '0.2s' };

const roleCardStyle = (isActive) => ({
    padding: '16px 20px', borderRadius: '16px', border: isActive ? '2px solid #6366F1' : '2px solid #F1F5F9', 
    background: isActive ? '#EEF2FF' : 'white', cursor: 'pointer', transition: '0.2s',
    display: 'flex', alignItems: 'center', gap: '16px'
});

export default RegisterModal;
