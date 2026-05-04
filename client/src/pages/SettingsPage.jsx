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
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const { user, login } = useAuth(); // Assuming login or updateUser exists in context
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
            const res = await axios.put('http://localhost:5002/api/users/profile', formData, {
                headers: { 'x-auth-token': token }
            });
            
            // Optionally update the local auth context if possible
            setStatus({ type: 'success', msg: 'Profile updated successfully!' });
            
            // If the login function update the context, we could call it or just reload
            // For now, simple success message
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
        <div className="settings-page" style={{ maxWidth: '1000px' }}>
            <header style={{ marginBottom: '48px', borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 900 }}>Account <span style={{ color: 'var(--primary)' }}>Settings</span></h1>
                <p style={{ color: 'var(--text-gray)', fontWeight: 600 }}>Personalize your experience and manage security preferences.</p>
            </header>

            <div className="grid-3">
                {/* Navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tabs.map((item, idx) => {
                        const isActive = activeTab === item.name;
                        return (
                        <button 
                            key={idx} 
                            onClick={() => setActiveTab(item.name)}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                            style={{ 
                                padding: '16px 24px', 
                                border: '1px solid var(--border-color)', 
                                background: isActive ? 'var(--primary)' : 'white',
                                color: isActive ? 'white' : 'var(--text-dark)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontWeight: 700
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
                        <div className="data-card" style={{ padding: '40px', animation: 'fadeIn 0.3s ease' }}>
                            <div className="items-center" style={{ gap: '24px', paddingBottom: '40px', borderBottom: '1px solid var(--bg-light)', marginBottom: '40px' }}>
                                <div style={{ 
                                    width: '96px', 
                                    height: '96px', 
                                    borderRadius: '32px', 
                                    background: '#EFF6FF', 
                                    border: '4px solid white', 
                                    boxShadow: 'var(--shadow)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    fontWeight: 900,
                                    color: 'var(--primary)'
                                }}>
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>{user?.name || 'User'}</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: 600, marginBottom: '12px' }}>
                                        {user?.role?.toUpperCase()} - {user?.userType || 'Interviewer'}
                                    </p>
                                    <div className="flex" style={{ gap: '8px' }}>
                                        <span className="badge badge-success">Verified Account</span>
                                    </div>
                                </div>
                            </div>                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 900, letterSpacing: '1px' }}>Full Legal Name</label>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            style={{ paddingLeft: '16px' }} 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 900, letterSpacing: '1px' }}>Email Address</label>
                                        <input 
                                            type="email" 
                                            className="input-field" 
                                            style={{ paddingLeft: '16px' }} 
                                            value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 900, letterSpacing: '1px' }}>Professional Bio / Specialty</label>
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        style={{ paddingLeft: '16px' }} 
                                        placeholder="e.g. Senior Product Designer"
                                        value={formData.specialty} 
                                        onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                    />
                                </div>

                                {status.msg && (
                                    <div style={{ 
                                        padding: '12px 16px', 
                                        background: status.type === 'success' ? '#ECFDF5' : '#FEF2F2', 
                                        color: status.type === 'success' ? '#059669' : '#DC2626',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        textAlign: 'center'
                                    }}>
                                        {status.msg}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <button 
                                        type="submit"
                                        className="btn btn-primary" 
                                        style={{ padding: '14px 40px', opacity: loading ? 0.7 : 1 }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : <><Check size={18} style={{ marginRight: '8px' }} /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {activeTab === 'Security & Password' && (
                        <div className="data-card" style={{ padding: '40px', animation: 'fadeIn 0.3s ease' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>Security Settings</h3>
                            <p style={{ color: 'var(--text-gray)', marginBottom: '32px' }}>Update your password and secure your account to keep your data safe.</p>
                            
                            <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 900, letterSpacing: '1px' }}>Current Password</label>
                                    <input type="password" className="input-field" style={{ paddingLeft: '16px' }} placeholder="••••••••" />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 900, letterSpacing: '1px' }}>New Password</label>
                                        <input type="password" className="input-field" style={{ paddingLeft: '16px' }} placeholder="••••••••" />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 900, letterSpacing: '1px' }}>Confirm New Password</label>
                                        <input type="password" className="input-field" style={{ paddingLeft: '16px' }} placeholder="••••••••" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <button className="btn btn-primary" style={{ padding: '14px 40px' }} onClick={(e) => e.preventDefault()}>
                                        <Shield size={18} style={{ marginRight: '8px' }} /> Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'Notifications' && (
                        <div className="data-card" style={{ padding: '40px', animation: 'fadeIn 0.3s ease' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>Notification Preferences</h3>
                            <p style={{ color: 'var(--text-gray)', marginBottom: '32px' }}>Choose what updates you want to receive and how you receive them.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {['Email alerts for new appointments', 'SMS reminders 1 hour before meeting', 'Weekly activity summary', 'Product updates and announcements'].map((text, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                                        <span style={{ fontWeight: 600 }}>{text}</span>
                                        <input type="checkbox" defaultChecked={i < 2} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {['Connected Apps', 'Privacy Policy'].includes(activeTab) && (
                        <div className="data-card" style={{ padding: '60px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                            <Monitor size={48} style={{ color: 'var(--border-color)', margin: '0 auto 20px' }} />
                            <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>Feature Coming Soon</h3>
                            <p style={{ color: 'var(--text-light)', fontWeight: 600, maxWidth: '400px', margin: '12px auto 0' }}>The {activeTab} section is currently under active development. Check back later!</p>
                        </div>
                    )}

                    <div style={{ 
                        background: '#FEF2F2', 
                        padding: '32px', 
                        borderRadius: '40px', 
                        border: '1px solid #FEE2E2',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div className="items-center" style={{ gap: '24px' }}>
                            <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <Shield size={22} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#991B1B' }}>Account Deactivation</h3>
                                <p style={{ fontSize: '12px', color: '#B91C1C', opacity: 0.6, fontWeight: 600 }}>This is a permanent action and cannot be undone.</p>
                            </div>
                        </div>
                        <button className="btn" style={{ background: '#DC2626', color: 'white' }}>Delete Account</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
