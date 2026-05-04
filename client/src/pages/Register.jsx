import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Lock, ArrowRight, Building2, 
    ChevronRight, ArrowLeft, Check, Sparkles, 
    Globe, Image as ImageIcon, FileText 
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Register = () => {
    // Auth & Navigation
    const { register, updateUser, user: authUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const clientIdParam = params.get('clientId');

    // Step Logic
    const [step, setStep] = useState(1); // 1: Account, 2: Role, 3: Success logic
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user', // Default to customer
        sectorCategory: '',
        sectorName: '',
        organizationName: '',
        organizationLogo: '',
        organizationWebsite: '',
        organizationDescription: ''
    });

    // Dynamic Data
    const [allSectors, setAllSectors] = useState([]);
    const [categories, setCategories] = useState([]);

    // Fetch Sectors and check auth
    useEffect(() => {
        if (authUser) {
            navigate('/dashboard');
        }

        const fetchSectors = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/sectors`);
                setAllSectors(res.data);
                
                // Extract unique categories, prioritize known icons from data
                const cats = [...new Set(res.data.map(s => s.category))];
                setCategories(cats);
            } catch (err) {
                console.error('Failed to fetch sectors:', err);
            }
        };
        fetchSectors();
    }, [authUser, navigate]);

    // Handlers
    const handleNext = () => {
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password) {
                setError('Please fill in all fields');
                return;
            }
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters');
                return;
            }
        }
        setError('');
        const nextStep = step + 1;
        setStep(nextStep);
        if (nextStep === 3) {
            handleSubmit();
        }
    };

    const handleBack = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 1. Initial Registration
            const res = await register(
                formData.name, 
                formData.email.trim().toLowerCase(), 
                formData.password, 
                formData.role, // Dynamic role selection
                formData.role, // userType matches role
                clientIdParam
            );

            const userId = res.user.id || res.user._id;
            const token = res.token || localStorage.getItem('token');

            await axios.patch(`${API_BASE_URL}/users/${userId}`, {
                sector: formData.sectorCategory,
                subCategory: formData.sectorName,
                organizationName: formData.organizationName,
                organizationLogo: formData.organizationLogo,
                organizationImages: formData.organizationImages, // Added Gallery
                organizationDescription: formData.organizationDescription
            }, {
                headers: { 'x-auth-token': token }
            });

            // 3. Update local user context
            updateUser({
                sector: formData.sectorCategory,
                subCategory: formData.sectorName,
                organizationName: formData.organizationName || formData.sectorName,
                organizationLogo: formData.organizationLogo,
                organizationImages: formData.organizationImages,
                organizationDescription: formData.organizationDescription
            });

            setIsCompleting(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '2px solid #E2E8F0',
        fontSize: '15px',
        fontWeight: 600,
        outline: 'none',
        transition: 'all 0.2s',
        display: 'block',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '13px',
        fontWeight: 900,
        color: '#64748B',
        marginBottom: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    return (
        <div style={{ 
            background: '#F8FAFC', 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '24px',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div className="auth-card" style={{ 
                width: '100%', 
                maxWidth: '500px', 
                background: 'white',
                padding: '48px',
                borderRadius: '32px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
                border: '1px solid #E2E8F0',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '60px', width: 'auto' }} />
                    </div>
                    {step === 1 && <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Create Account</h2>}
                    {step === 2 && <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Choose Your Role</h2>}
                    {step === 3 && <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#4F46E5', marginBottom: '8px' }}>Finalizing Setup</h2>}
                    
                    <p style={{ color: '#64748B', fontWeight: 600, fontSize: '15px' }}>
                        {step === 1 && "Join thousands of businesses managing appointments."}
                        {step === 2 && "How do you plan to use the platform?"}
                        {step === 3 && "We are preparing your personalized workspace..."}
                    </p>
                </div>

                {error && <div style={{ 
                    background: '#FEF2F2', 
                    color: '#DC2626', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    marginBottom: '24px', 
                    fontSize: '14px', 
                    fontWeight: 700,
                    textAlign: 'center',
                    border: '1px solid #FCA5A5'
                }}>{error}</div>}

                <AnimatePresence mode="wait">
                    {/* STEP 1: ACCOUNT DETAILS */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', left: '16px', top: '18px', color: '#94A3B8' }} />
                                        <input 
                                            style={{ ...inputStyle, paddingLeft: '48px' }} 
                                            placeholder="John Doe" 
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '18px', color: '#94A3B8' }} />
                                        <input 
                                            type="email"
                                            style={{ ...inputStyle, paddingLeft: '48px' }} 
                                            placeholder="john@example.com" 
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '18px', color: '#94A3B8' }} />
                                        <input 
                                            type="password"
                                            style={{ ...inputStyle, paddingLeft: '48px' }} 
                                            placeholder="Min. 8 characters" 
                                            value={formData.password}
                                            onChange={e => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={handleNext}
                                    style={{ 
                                        marginTop: '12px',
                                        width: '100%', 
                                        padding: '18px', 
                                        borderRadius: '16px', 
                                        background: '#4F46E5', 
                                        color: 'white', 
                                        border: 'none', 
                                        fontWeight: 800, 
                                        fontSize: '16px', 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                                    }}
                                >
                                    Continue <ArrowRight size={18} />
                                </button>
                                
                                <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
                                    <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
                                        Already have an account? <Link to="/login" style={{ color: '#4F46E5', fontWeight: 800, textDecoration: 'none' }}>Log in</Link>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: ROLE SELECTION */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div 
                                        onClick={() => setFormData({...formData, role: 'user'})}
                                        style={{ 
                                            padding: '40px 24px', borderRadius: '24px', border: `2px solid ${formData.role === 'user' ? '#4F46E5' : '#E2E8F0'}`,
                                            background: formData.role === 'user' ? '#EEF2FF' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                            boxShadow: formData.role === 'user' ? '0 20px 25px -5px rgba(79, 70, 229, 0.1)' : 'none'
                                        }}
                                    >
                                        <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px', color: '#4F46E5' }}>[User]</div>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: formData.role === 'user' ? '#4F46E5' : '#0F172A' }}>Customer</div>
                                        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px', lineHeight: 1.5 }}>Find providers and book appointments for yourself.</p>
                                    </div>
                                    <div 
                                        onClick={() => setFormData({...formData, role: 'client'})}
                                        style={{ 
                                            padding: '40px 24px', borderRadius: '24px', border: `2px solid ${formData.role === 'client' ? '#4F46E5' : '#E2E8F0'}`,
                                            background: formData.role === 'client' ? '#EEF2FF' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                            boxShadow: formData.role === 'client' ? '0 20px 25px -5px rgba(79, 70, 229, 0.1)' : 'none'
                                        }}
                                    >
                                        <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px', color: '#4F46E5' }}>[Provider]</div>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: formData.role === 'client' ? '#4F46E5' : '#0F172A' }}>Provider</div>
                                        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px', lineHeight: 1.5 }}>Set up your organization and manage your services.</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                                    <button onClick={handleBack} style={{ flex: 1, padding: '18px', borderRadius: '16px', background: 'none', border: 'none', color: '#64748B', fontWeight: 800, cursor: 'pointer' }}>Back</button>
                                    <button 
                                        onClick={handleNext}
                                        style={{ 
                                            flex: 2, 
                                            padding: '18px', 
                                            borderRadius: '16px', 
                                            background: '#4F46E5', 
                                            color: 'white', 
                                            border: 'none', 
                                            fontWeight: 800, 
                                            fontSize: '16px', 
                                            cursor: 'pointer',
                                            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                                        }}
                                    >
                                        {formData.role === 'user' ? 'Finish Registration' : 'Continue to Industry'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: SUCCESS & SETUP */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                {/* Jira-style Loading Animation */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                height: [20, 40, 20],
                                                background: ['#4F46E5', '#818CF8', '#4F46E5']
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                            style={{ width: '8px', borderRadius: '4px' }}
                                        />
                                    ))}
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#4F46E5' }}>Preparing your dashboard...</h3>
                                <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '8px' }}>Finalizing account configurations</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Register;
