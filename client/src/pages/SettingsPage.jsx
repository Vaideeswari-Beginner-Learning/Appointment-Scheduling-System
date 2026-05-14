import React, { useState } from 'react';
import axios from 'axios';
import { 
    User, 
    Bell, 
    Shield, 
    Lock, 
    ChevronRight, 
    Monitor, 
    Smartphone, 
    Mail, 
    HelpCircle,
    Check
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const { user } = useAuth();
    
    if (!user) return null;
    const [activeTab, setActiveTab] = useState('General Information');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: '',
        specialty: user?.specialty || ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/users/profile`, formData, {
                headers: { 'x-auth-token': token }
            });
            setStatus({ type: 'success', msg: 'Profile updated successfully!' });
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { name: 'General Information', icon: <User size={18} /> },
        { name: 'Security & Password', icon: <Shield size={18} /> },
        { name: 'Notifications', icon: <Bell size={18} /> },
        { name: 'Connected Apps', icon: <Monitor size={18} /> },
        { name: 'Privacy Policy', icon: <Lock size={18} /> },
    ];

    return (
        <div className="settings-page" style={{ padding: '0 20px' }}>
            <header style={{ marginBottom: '48px', borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 900 }}>Account <span className="text-gold">Settings</span></h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Personalize your experience and manage security preferences.</p>
            </header>

            <div className="grid-3">
                {/* Navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tabs.map((item, idx) => {
                        const isActive = activeTab === item.name;
                        return (
                        <button 
                            key={idx} 
                            onClick={() => setActiveTab(item.name)}
                            style={{ 
                                padding: '18px 24px', 
                                border: '1px solid var(--border-color)', 
                                background: isActive ? 'var(--primary)' : 'white',
                                color: isActive ? 'white' : 'var(--text-main)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontWeight: 700,
                                boxShadow: isActive ? 'var(--shadow-md)' : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {item.icon}
                                <span>{item.name}</span>
                            </div>
                            <ChevronRight size={16} style={{ opacity: isActive ? 1 : 0.3 }} />
                        </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {activeTab === 'General Information' && (
                        <div className="card-premium" style={{ padding: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingBottom: '40px', borderBottom: '1px solid var(--border-color)', marginBottom: '40px' }}>
                                <div style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    borderRadius: '30px', 
                                    background: 'var(--primary)', 
                                    border: '6px solid white', 
                                    boxShadow: 'var(--shadow-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '28px',
                                    fontWeight: 900,
                                    color: 'white'
                                }}>
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '6px' }}>{user?.name || 'User'}</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '14px' }}>
                                        {user?.role?.toUpperCase()} • {user?.userType || 'Professional'}
                                    </p>
                                    <span className="badge badge-success">Verified Account</span>
                                </div>
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Full Legal Name</label>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Email Address</label>
                                        <input 
                                            type="email" 
                                            className="input-field" 
                                            value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Professional Bio / Specialty</label>
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        placeholder="e.g. Senior Enterprise Architect"
                                        value={formData.specialty} 
                                        onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                    />
                                </div>

                                {status.msg && (
                                    <div style={{ 
                                        padding: '16px', 
                                        background: status.type === 'success' ? '#ECFDF5' : '#FEF2F2', 
                                        color: status.type === 'success' ? '#065F46' : '#DC2626',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        textAlign: 'center',
                                        border: '1px solid ' + (status.type === 'success' ? '#D1FAE5' : '#FEE2E2')
                                    }}>
                                        {status.msg}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <button 
                                        type="submit"
                                        className="btn-primary" 
                                        style={{ padding: '16px 48px', opacity: loading ? 0.7 : 1 }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : <><Check size={20} /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {activeTab === 'Security & Password' && (
                        <div className="card-premium" style={{ padding: '40px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>Security Settings</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Update your password and secure your account to keep your data safe.</p>
                            
                            <form style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Current Password</label>
                                    <input type="password" className="input-field" placeholder="••••••••" />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>New Password</label>
                                        <input type="password" className="input-field" placeholder="••••••••" />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Confirm New Password</label>
                                        <input type="password" className="input-field" placeholder="••••••••" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <button className="btn-primary" style={{ padding: '16px 48px' }} onClick={(e) => e.preventDefault()}>
                                        <Shield size={20} /> Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'Notifications' && (
                        <div className="card-premium" style={{ padding: '40px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>Notification Preferences</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Choose what updates you want to receive and how you receive them.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {['Email alerts for new appointments', 'SMS reminders 1 hour before meeting', 'Weekly activity summary', 'Product updates and announcements'].map((text, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-main)' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{text}</span>
                                        <input type="checkbox" defaultChecked={i < 2} style={{ width: '22px', height: '22px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {['Connected Apps', 'Privacy Policy'].includes(activeTab) && (
                        <div className="card-premium" style={{ padding: '80px', textAlign: 'center' }}>
                            <Monitor size={56} style={{ color: 'var(--border-color)', margin: '0 auto 24px' }} />
                            <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary)' }}>Feature Coming Soon</h3>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 600, maxWidth: '400px', margin: '14px auto 0' }}>The {activeTab} section is currently under active development. Check back later!</p>
                        </div>
                    )}

                    <div style={{ 
                        background: 'rgba(220, 38, 38, 0.05)', 
                        padding: '32px', 
                        borderRadius: 'var(--radius-lg)', 
                        border: '1px solid rgba(220, 38, 38, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ width: '56px', height: '56px', background: 'white', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', boxShadow: 'var(--shadow-sm)' }}>
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#991B1B' }}>Account Deactivation</h3>
                                <p style={{ fontSize: '13px', color: '#B91C1C', opacity: 0.8, fontWeight: 600 }}>This is a permanent action and cannot be undone.</p>
                            </div>
                        </div>
                        <button className="btn" style={{ background: '#DC2626', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 800 }}>Delete Account</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
