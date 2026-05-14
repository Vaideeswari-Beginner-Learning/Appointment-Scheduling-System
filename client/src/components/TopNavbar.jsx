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
        <header className="fixed-header" style={{ justifyContent: 'space-between', padding: '0 40px', background: 'white', borderBottom: '1px solid #E2E8F0', height: '80px', position: 'sticky', top: 0, zIndex: 1000 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6366F1' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search for appointments, organizations, or sectors..." 
                        style={{ 
                            width: '100%', 
                            padding: '12px 20px 12px 48px', 
                            border: '1px solid #E2E8F0', 
                            borderRadius: '30px', 
                            fontSize: '14px', 
                            outline: 'none', 
                            background: '#F8FAFC', 
                            color: '#475569', 
                            fontWeight: 600,
                            transition: 'all 0.3s'
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <Bell size={20} color="#475569" />
                    </div>
                    <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '20px', height: '20px', background: '#EF4444', color: 'white', borderRadius: '50%', border: '2px solid white', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '6px 6px 6px 20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', gap: '15px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>SUPER ADMIN</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#8B5CF6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900 }}>
                        {user?.name?.charAt(0) || 'S'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
