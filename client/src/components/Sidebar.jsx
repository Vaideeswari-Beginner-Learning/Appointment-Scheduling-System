import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Calendar, 
    Clock, 
    Settings, 
    User as UserIcon,
    ChevronRight,
    LogOut,
    PlusCircle,
    Users,
    ClipboardList,
    Stethoscope,
    Activity,
    Briefcase,
    Mic,
    Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    let apptListName = 'Appointments';
    let calendarName = 'Schedule';

    if (user?.role === 'hr') {
        const dept = user?.department;
        if (dept === 'hospital') {
            apptListName = 'Patients';
            calendarName = 'Appointments';
        } else if (dept === 'interview') {
            apptListName = 'Candidates';
            calendarName = 'Interviews';
        } else if (dept === 'service') {
            apptListName = 'Requests';
            calendarName = 'Services';
        } else if (dept === 'client') {
            apptListName = 'Clients';
            calendarName = 'Meetings';
        }
    }

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['user', 'admin', 'hr'] },
        { name: 'Book Session', icon: <PlusCircle size={20} />, path: '/book', roles: ['user'] },
        { name: apptListName, icon: <ClipboardList size={20} />, path: '/my-appointments', roles: ['user', 'admin', 'hr'] },
        { name: calendarName, icon: <Calendar size={20} />, path: '/calendar', roles: ['user', 'admin', 'hr'] },
        { name: 'System Settings', icon: <Settings size={20} />, path: '/settings', roles: ['user', 'admin', 'hr'] },
    ];

    const serviceLinks = [
        { name: 'Hospital Module', icon: <Stethoscope size={20} />, path: '/dashboard?module=hospital', color: '#059669' },
        { name: 'Services Module', icon: <Wrench size={20} />, path: '/dashboard?module=service', color: '#D97706' },
        { name: 'Client Module', icon: <Briefcase size={20} />, path: '/dashboard?module=client', color: '#3B82F6' },
        { name: 'Interview Module', icon: <Mic size={20} />, path: '/dashboard?module=interview', color: '#8B5CF6' },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="sidebar" style={{ backgroundColor: 'white', borderRight: '1px solid var(--border-color)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="sidebar-header" style={{ padding: '32px' }}>
                <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', justifyContent: 'center' }}>
                    <img src="/logo.png" alt="Forge India Logo" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} onError={(e) => e.target.style.display='none'} />
                </Link>
            </div>

            <nav className="sidebar-nav" style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ padding: '0 16px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '16px', letterSpacing: '1px' }}>Main Menu</p>
                {filteredItems.map((item) => {
                    const isActive = location.pathname === item.path && !location.search;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={onClose}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                borderRadius: '16px',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '14px',
                                transition: 'all 0.2s',
                                background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%)' : 'transparent',
                                color: isActive ? 'white' : 'var(--text-gray)',
                                boxShadow: isActive ? '0 10px 15px -3px rgba(37, 99, 235, 0.4)' : 'none'
                             }}
                             onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
                             onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                                <span>{item.name}</span>
                            </div>
                            {isActive && <ChevronRight size={14} />}
                        </Link>
                    );
                })}

                {/* Footer or Logout could go here */}
            </nav>

            <div className="sidebar-footer" style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ background: 'var(--bg-light)', padding: '16px', borderRadius: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        background: 'var(--primary)', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white', 
                        fontWeight: 900,
                        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
                    }}>
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{user?.name}</p>
                        <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', margin: 0 }}>{user?.role}</p>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    style={{ background: 'none', border: 'none', width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#9CA3AF', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9CA3AF'; }}
                >
                    <LogOut size={18} /> Logout Account
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
