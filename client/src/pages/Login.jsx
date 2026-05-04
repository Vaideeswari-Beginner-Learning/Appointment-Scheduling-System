import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Calendar } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const normalizedEmail = email.trim().toLowerCase();
            await login(normalizedEmail, password);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid email or password';
            if (msg.includes('expired') || msg.includes('Training Period')) {
                setError('Oops... Something went wrong! [!] Your 1-Day Training Period has finished. Please login to upgrade your account.');
            } else {
                setError(msg);
            }
        }
    };

    // Auto-redirect if user is already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                        <img src="/logo.png" alt="Forge India Logo" style={{ height: '110px', width: 'auto', objectFit: 'contain' }} onError={(e) => e.target.style.display='none'} />
                    </div>
                </div>
                
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Staff Portal</h2>
                <p style={{ color: '#64748B', fontWeight: 600, fontSize: '15px', marginBottom: '32px' }}>
                    Login to manage your tenant, services, and incoming bookings. 
                </p>

                {error && (
                    <div className="error-message" style={{ 
                        background: error.includes('pending') ? '#FFFBEB' : (error.includes('Customers') ? '#EFF6FF' : '#FEF2F2'),
                        color: error.includes('pending') ? '#92400E' : (error.includes('Customers') ? '#1D4ED8' : '#991B1B'),
                        border: `1px solid ${error.includes('pending') ? '#FCD34D' : (error.includes('Customers') ? '#93C5FD' : '#FCA5A5')}`,
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 700,
                        lineHeight: '1.5',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span style={{ fontSize: '18px', fontWeight: 900 }}>{error.includes('pending') ? '[Wait]' : (error.includes('Customers') ? '[Info]' : '[Error]')}</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} />
                            <input 
                                type="email" 
                                className="input-field"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} />
                            <input 
                                type="password" 
                                className="input-field"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '54px', fontSize: '16px', marginTop: '12px' }}>
                        <LogIn size={18} style={{ marginRight: '8px' }} /> Login to Dashboard
                    </button>
                </form>

                <div className="auth-footer" style={{ marginTop: '32px', borderTop: '1px solid #F1F5F9', paddingTop: '24px', textAlign: 'center' }}>
                    <p style={{ marginBottom: '12px', fontSize: '13px' }}>New to Forge India?</p>
                    <Link to="/register" style={{ 
                        color: 'var(--primary)', 
                        fontWeight: 900, 
                        textDecoration: 'none',
                        fontSize: '15px',
                        padding: '10px 24px',
                        borderRadius: '12px',
                        background: '#EFF6FF',
                        display: 'inline-block',
                        transition: 'all 0.2s'
                    }}>Register Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
