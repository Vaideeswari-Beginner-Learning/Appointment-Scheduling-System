import React from 'react';
import { Bell, Search, User as UserIcon, Menu, Grid, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopNavbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="top-navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                <button onClick={onMenuClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'lg:none' }}>
                    <Menu size={22} />
                </button>
                <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                    <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Quick search..." 
                        style={{ width: '100%', padding: '10px 16px 10px 42px', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '14px', outline: 'none', background: 'var(--bg-light)', color: 'var(--text-dark)' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', padding: '10px', background: 'var(--bg-light)', borderRadius: '12px', cursor: 'pointer' }}>
                    <Bell size={20} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px', width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid white' }}></div>
                </div>
                
                <div style={{ width: '1px', height: '32px', background: 'var(--border-color)', margin: '0 8px' }}></div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)' }}>{user?.name || 'Administrator'}</p>
                        <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-light)', textTransform: 'uppercase' }}>{user?.role || 'Active Now'}</p>
                    </div>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-light)', color: 'var(--primary)', flexShrink: 0 }}>
                        <UserIcon size={20} />
                    </div>
                </div>

                <div style={{ width: '1px', height: '32px', background: 'var(--border-color)', margin: '0 4px' }}></div>

                <button onClick={handleLogout} title="Logout" style={{ width: '44px', height: '44px', borderRadius: '12px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }} className="action-btn">
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
};

export default TopNavbar;
