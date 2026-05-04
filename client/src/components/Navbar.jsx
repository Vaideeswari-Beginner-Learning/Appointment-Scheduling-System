import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, LayoutDashboard, User, Zap, Sun, Moon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="navbar bg-base-100 shadow-lg px-4 lg:px-12 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
            <style>{`
                .navbar { display: flex; align-items: center; padding: 0.75rem 1rem; min-height: 4rem; width: 100%; transition: all 0.3s; }
                .btn-ghost:hover { background-color: rgba(0,0,0,0.05); }
                [data-theme='dark'] .btn-ghost:hover { background-color: rgba(255,255,255,0.05); }
            `}</style>
            <div className="flex-1">
                <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                    <Zap size={24} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} /> 
                    <span style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SmartSched</span>
                </Link>
            </div>
            <div className="flex-none gap-2" style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={toggleTheme} className="btn btn-ghost btn-circle" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>
                            <LayoutDashboard size={20} /> <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        {user.role === 'user' && (
                            <Link to="/book" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>
                                <Calendar size={20} /> <span className="hidden sm:inline">Book Appointment</span>
                            </Link>
                        )}
                        <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>
                            <User size={20} /> <span className="hidden sm:inline">Profile</span>
                        </Link>
                        <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontWeight: 800 }}>
                            <LogOut size={20} /> <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>
                            <LayoutDashboard size={20} /> <span>Track Booking</span>
                        </Link>
                        <Link to="/book" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>
                            <Calendar size={20} /> <span>Book Appointment</span>
                        </Link>
                        <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '8px 20px', borderRadius: '12px', textDecoration: 'none', height: 'auto', fontWeight: 900 }}>
                            Staff Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
