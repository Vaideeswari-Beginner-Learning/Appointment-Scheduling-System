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
    Wrench,
    Building2,
    Bell,
    Crown,
    MoreHorizontal
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
        // GLOBAL / SHARED
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['user', 'admin', 'super-admin', 'hr', 'client'] },
        
        // USER SPECIFIC
        { name: 'Book Session', icon: <PlusCircle size={20} />, path: '/book', roles: ['user'] },
        
        // ADMIN SPECIFIC (Platform Control)
        { name: 'Organizations', icon: <Building2 size={20} />, path: '/dashboard?tab=clients', roles: ['admin', 'super-admin'] },
        { name: 'Industry Sectors', icon: <Briefcase size={20} />, path: '/dashboard?tab=sectors', roles: ['admin', 'super-admin'] },
        { name: 'Client Requests', icon: <Bell size={20} />, path: '/dashboard?tab=requests', roles: ['admin', 'super-admin'] },
        { name: 'Subscription Plans', icon: <Crown size={20} />, path: '/dashboard?tab=plans', roles: ['admin', 'super-admin'] },
        { name: 'Announcements', icon: <Mic size={20} />, path: '/dashboard?tab=announcements', roles: ['admin', 'super-admin'] },

        // HR / CLIENT SPECIFIC (Business Management)
        { name: 'Employees', icon: <Users size={20} />, path: '/dashboard?tab=employees', roles: ['hr', 'client'] },
        { name: 'Services', icon: <Wrench size={20} />, path: '/dashboard?tab=services', roles: ['client'] },
        { name: 'Availability', icon: <Clock size={20} />, path: '/dashboard?tab=availability', roles: ['hr', 'client'] },
        
        // SHARED OPERATIONAL
        { name: apptListName, icon: <ClipboardList size={20} />, path: '/my-appointments', roles: ['user', 'admin', 'super-admin', 'hr', 'client'] },
        { name: calendarName, icon: <Calendar size={20} />, path: '/calendar', roles: ['user', 'admin', 'super-admin', 'hr', 'client'] },
        { name: 'Account Settings', icon: <Settings size={20} />, path: '/settings', roles: ['user', 'admin', 'super-admin', 'hr', 'client'] },
    ];

    const serviceLinks = [
        { name: 'Hospital Module', icon: <Stethoscope size={20} />, path: '/dashboard?module=hospital', color: '#4A1C40' },
        { name: 'Services Module', icon: <Wrench size={20} />, path: '/dashboard?module=service', color: '#B76E79' },
        { name: 'Client Module', icon: <Briefcase size={20} />, path: '/dashboard?module=client', color: '#5A315D' },
        { name: 'Interview Module', icon: <Mic size={20} />, path: '/dashboard?module=interview', color: '#8B5CF6' },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="sidebar" style={{ 
            background: '#022C22', 
            border: 'none', 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
            width: '280px',
            zIndex: 1000
        }}>
            <div className="sidebar-header" style={{ padding: '30px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'white', padding: '6px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <img src="/logo.png" alt="Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                    <span style={{ color: 'white', fontWeight: 900, fontSize: '18px', letterSpacing: '-0.5px' }}>Forge India</span>
                    <span style={{ color: '#D97706', fontWeight: 800, fontSize: '10px', letterSpacing: '1px' }}>CONNECT</span>
                </div>
            </div>

            <nav className="sidebar-nav" style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
                <p style={{ padding: '20px 16px 10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>MAIN MENU</p>
                {filteredItems.map((item) => {
                    const isActive = location.pathname === item.path.split('?')[0] && 
                                   (item.path.includes('?') ? location.search.includes(item.path.split('?')[1]) : !location.search);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={onClose}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 18px',
                                borderRadius: '14px',
                                textDecoration: 'none',
                                fontWeight: 800,
                                fontSize: '14px',
                                transition: 'all 0.3s',
                                background: isActive ? 'rgba(0,0,0,0.2)' : 'transparent',
                                color: isActive ? '#B76E79' : 'rgba(255,255,255,0.6)',
                             }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <span style={{ color: isActive ? '#B76E79' : 'inherit' }}>{item.icon}</span>
                                <span>{item.name}</span>
                            </div>
                        </Link>
                    );
                })}

                <p style={{ padding: '30px 16px 10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>ADDITIONAL</p>
                <div style={{ padding: '0 16px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <MoreHorizontal size={20} />
                        <span>More Functions</span>
                    </div>
                    <ChevronRight size={16} />
                </div>
            </nav>

            <div className="sidebar-footer" style={{ padding: '32px 24px' }}>
                <button 
                    onClick={logout}
                    style={{ background: '#FEE2E2', border: 'none', width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderRadius: '18px', color: '#B91C1C', cursor: 'pointer', fontWeight: 900, transition: 'all 0.3s' }}
                >
                    <LogOut size={20} /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
