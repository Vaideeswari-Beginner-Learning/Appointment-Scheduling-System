import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard, Users, CreditCard, BarChart3, Bell, Settings, LogOut,
    Plus, X, TrendingUp, Activity, Building, ShieldAlert, Crown, Clock,
    CheckCircle, XCircle, Edit2, ChevronDown, Search, Megaphone, ArrowRight, Briefcase, Trash2,
    PieChart, Filter, Save, Globe, Mail, Zap, ShoppingBag, Heart, Scissors, Home, Wrench, GraduationCap, Gavel, Camera, MapPin, UserCheck, Shield, Key, Database, RefreshCw, Smartphone, Eye, MoreHorizontal, ChevronRight
} from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import './AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [allUsers, setAllUsers] = useState([]);
    const [saasRequests, setSaasRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    
    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        try {
            const [usersRes, saasRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/users`, { headers: { 'x-auth-token': token } }),
                axios.get(`${API_BASE_URL}/saas/requests`, { headers: { 'x-auth-token': token } }).catch(() => ({ data: [] }))
            ]);
            setAllUsers(usersRes.data);
            setSaasRequests(saasRes.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const mainTabs = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' },
        { id: 'requests', label: 'Client Requests', icon: Bell, emoji: '📥', badge: saasRequests.filter(r => r.status === 'pending').length },
        { id: 'clients', label: 'Organizations', icon: Building, emoji: '🏢' },
        { id: 'sectors', label: 'Industry Sectors', icon: Briefcase, emoji: '💼' },
        { id: 'plans', label: 'Subscription Plans', icon: Crown, emoji: '💎' },
    ];

    const moreTabs = [
        { id: 'announcements', label: 'Announcements', icon: Megaphone, emoji: '📢' },
        { id: 'users', label: 'System Users', icon: Users, emoji: '👥' },
        { id: 'sys_requests', label: 'Help & Requests', icon: ShieldAlert, emoji: '💬' },
        { id: 'logs', label: 'Activity Logs', icon: Clock, emoji: '🔍' },
        { id: 'reports', label: 'Reports', icon: BarChart3, emoji: '📊' },
        { id: 'settings', label: 'Settings', icon: Settings, emoji: '⚙️' }
    ];

    const allTabs = [...mainTabs, ...moreTabs];

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ color: '#6366F1', marginBottom: '20px' }}>
                <RefreshCw size={48} />
            </motion.div>
            <h2 style={{ fontWeight: 900, color: '#0F172A', letterSpacing: '2px' }}>FORGEINDIA ADMIN</h2>
        </div>
    );

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar" style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="sidebar-brand">
                    <motion.div whileHover={{ scale: 1.1 }} className="brand-logo">F</motion.div>
                    <div className="brand-name">ForgeIndia</div>
                </div>
                
                <nav className="admin-nav" style={{ overflowY: 'auto' }}>
                    <div style={{ marginBottom: '10px', padding: '0 10px' }}>
                        <small style={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px' }}>Main Menu</small>
                    </div>
                    {mainTabs.map(t => (
                        <motion.button 
                            key={t.id} 
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setActiveTab(t.id); setIsMoreOpen(false); }} 
                            className={`nav-item ${activeTab === t.id ? 'active' : ''}`}
                        >
                            <t.icon size={18} />
                            <span>{t.label}</span>
                            {t.badge > 0 && (
                                <motion.span 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    style={{ marginLeft: 'auto', background: '#EF4444', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 900 }}
                                >
                                    {t.badge}
                                </motion.span>
                            )}
                        </motion.button>
                    ))}

                    <div style={{ marginTop: '20px', padding: '0 10px' }}>
                        <small style={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px' }}>Additional</small>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <motion.button 
                            whileHover={{ x: 5 }}
                            onClick={() => setIsMoreOpen(!isMoreOpen)} 
                            className={`nav-item ${moreTabs.some(t => t.id === activeTab) ? 'active' : ''}`}
                            style={{ justifyContent: 'space-between' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <MoreHorizontal size={18} />
                                <span>More Functions</span>
                            </div>
                            <motion.div animate={{ rotate: isMoreOpen ? 90 : 0 }}>
                                <ChevronRight size={16} />
                            </motion.div>
                        </motion.button>

                        <AnimatePresence>
                            {isMoreOpen && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden', paddingLeft: '20px' }}
                                >
                                    {moreTabs.map(t => (
                                        <motion.button 
                                            key={t.id} 
                                            whileHover={{ x: 5 }}
                                            onClick={() => setActiveTab(t.id)} 
                                            className={`nav-item ${activeTab === t.id ? 'active' : ''}`}
                                            style={{ padding: '10px 18px', fontSize: '14px' }}
                                        >
                                            <t.icon size={16} />
                                            <span>{t.label}</span>
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { logout(); navigate('/login'); }} 
                        className="nav-item" 
                        style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </motion.button>
                </div>
            </aside>

            <main className="admin-content">
                <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="header-title">
                        <h1>{allTabs.find(t => t.id === activeTab)?.emoji} {allTabs.find(t => t.id === activeTab)?.label}</h1>
                        <p>Welcome back, Administrator. Here's what's happening today.</p>
                    </motion.div>
                    
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <motion.div whileHover={{ scale: 1.1 }} style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell size={22} color="#64748b"/>
                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '50%', fontWeight: 900 }}>3</span>
                        </motion.div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'white', padding: '8px 16px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{user.name}</div>
                                <div style={{ color: '#64748B', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Super Admin</div>
                            </div>
                            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #6366F1, #A855F7)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 950, fontSize: '18px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>{user.name[0]}</div>
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'overview' && (
                            <div className="fade-in">
                                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                    <div className="stat-card" style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}>
                                        <div className="stat-icon" style={{ background: 'white', color: '#EF4444' }}><Clock size={24}/></div>
                                        <div className="stat-info"><div className="label" style={{ color: '#991B1B' }}>Expiring Soon</div><div className="value" style={{ color: '#991B1B' }}>5 Clients</div></div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><Zap size={24}/></div>
                                        <div className="stat-info"><div className="label">Server Status</div><div className="value" style={{ color: '#16A34A', fontSize: '18px' }}>ONLINE</div></div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon" style={{ background: '#E0E7FF', color: '#6366F1' }}><Activity size={24}/></div>
                                        <div className="stat-info"><div className="label">API Latency</div><div className="value">42ms</div></div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon" style={{ background: '#F3F4F6', color: '#64748B' }}><ShoppingBag size={24}/></div>
                                        <div className="stat-info"><div className="label">Total Bookings</div><div className="value">1,284</div></div>
                                    </div>
                                </div>
                                <div className="table-header" style={{ marginTop: '30px' }}><h2>🚀 Platform Vital Signs</h2></div>
                                <div style={{ height: '350px' }} className="data-table-container">
                                    <Line 
                                        data={{ 
                                            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'], 
                                            datasets: [{ 
                                                label: 'Real-time Traffic', 
                                                data: [10, 5, 45, 120, 85, 30], 
                                                borderColor: '#6366F1', 
                                                borderWidth: 4,
                                                tension: 0.4,
                                                pointRadius: 6,
                                                pointBackgroundColor: 'white',
                                                fill: true, 
                                                backgroundColor: 'rgba(99, 102, 241, 0.1)' 
                                            }] 
                                        }} 
                                        options={{ 
                                            responsive: true, 
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'announcements' && (
                            <div className="fade-in">
                                <div className="table-header">
                                    <h2>📢 Announcement Module</h2>
                                    <button className="action-btn" style={{ background: '#6366F1', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Plus size={18} /> Create New
                                    </button>
                                </div>
                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead><tr><th>Announcement Title</th><th>Target</th><th>Created</th><th>Status</th><th>Action</th></tr></thead>
                                        <tbody>
                                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                <td><b>System Maintenance Alert</b></td>
                                                <td>All Clients</td>
                                                <td>Today</td>
                                                <td><span className="status-badge status-paid">SENT</span></td>
                                                <td><button className="action-btn">History</button></td>
                                            </motion.tr>
                                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                                                <td><b>New Premium Features</b></td>
                                                <td>Free Users</td>
                                                <td>2 Days ago</td>
                                                <td><span className="status-badge" style={{ background: '#eee' }}>DRAFT</span></td>
                                                <td><button className="action-btn">Edit</button></td>
                                            </motion.tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="fade-in">
                                <div className="table-header">
                                    <h2>🔍 System Activity Logs</h2>
                                    <div className="search-bar" style={{ width: '300px' }}>
                                        <Search size={18}/>
                                        <input placeholder="Search logs by user or action..."/>
                                    </div>
                                </div>
                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th></tr></thead>
                                        <tbody>
                                            <tr><td>{new Date().toLocaleTimeString()}</td><td><b>{user.name}</b></td><td>Approved Client</td><td>MaxHealth Hospital</td></tr>
                                            <tr><td>10:45 AM</td><td><b>Sanjay A.</b></td><td>Updated Plan</td><td>Glow Salon</td></tr>
                                            <tr><td>Yesterday</td><td><b>System</b></td><td>Auto-Deactivated</td><td>Expired Corp</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'clients' && (
                            <div className="data-table-container fade-in">
                                <div className="table-header">
                                    <h2>🏢 Organization Management</h2>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button className="action-btn" onClick={() => alert("📤 Exporting clients to CSV...")}>
                                            <ShoppingBag size={16} style={{ marginRight: '5px' }}/> Export CSV
                                        </button>
                                        <div className="search-bar" style={{ width: '300px' }}>
                                            <Search size={18}/>
                                            <input placeholder="Search organizations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
                                        </div>
                                    </div>
                                </div>
                                <table className="data-table">
                                    <thead><tr><th>Organization</th><th>Expiry</th><th>Plan</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {allUsers.filter(u => u.role === 'client' && u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((c, i) => (
                                            <motion.tr key={c._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                                <td><b>{c.name}</b></td>
                                                <td><span style={{ color: '#EF4444', fontWeight: 700 }}>12 May 2026</span></td>
                                                <td><span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>PREMIUM</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button className="action-btn" title="Edit"><Edit2 size={16}/></button>
                                                        <button className="action-btn" title="Send Reminder" style={{ color: '#6366F1' }}><Bell size={16}/></button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
                                    <div className="data-table-container shadow-hover" style={{ padding: '40px', borderRadius: '32px' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', color: '#1E293B', fontWeight: 900 }}>
                                            <Globe size={24} color="#6366F1"/> System Branding
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>System Name</label>
                                                <input className="form-input" defaultValue="ForgeIndia Pro" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #F1F5F9', fontWeight: 600 }}/>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Support Email</label>
                                                <input className="form-input" defaultValue="support@forgeindia.com" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #F1F5F9', fontWeight: 600 }}/>
                                            </div>
                                            <button className="action-btn" style={{ background: '#6366F1', color: 'white', marginTop: '10px' }}>Save Branding Changes</button>
                                        </div>
                                    </div>
                                    <div className="data-table-container shadow-hover" style={{ padding: '40px', borderRadius: '32px' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', color: '#1E293B', fontWeight: 900 }}>
                                            <Shield size={24} color="#F59E0B"/> Security Controls
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Master Password</label>
                                                <input className="form-input" type="password" placeholder="••••••••" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #F1F5F9' }}/>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '15px', borderRadius: '16px' }}>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '14px' }}>Two-Factor Authentication</div>
                                                    <div style={{ fontSize: '11px', color: '#64748B' }}>Extra layer of security</div>
                                                </div>
                                                <button className="status-badge status-free">DISABLED</button>
                                            </div>
                                            <button className="action-btn" style={{ background: '#0F172A', color: 'white' }}>Update Security Settings</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminDashboard;




