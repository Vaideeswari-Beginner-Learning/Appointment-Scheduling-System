import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard, Users, CreditCard, BarChart3, Bell, Settings, LogOut,
    Plus, X, TrendingUp, Activity, Building, ShieldAlert, Crown, Clock,
    CheckCircle, XCircle, Edit2, ChevronDown, Search, Megaphone, ArrowRight, Briefcase, Trash2,
    PieChart, Filter, Save, Globe, Mail, Zap, ShoppingBag, Heart, Scissors, Home, Wrench, GraduationCap, Gavel, Camera, MapPin, UserCheck, Shield, Key, Database, RefreshCw, Smartphone, Eye
} from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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

    const tabs = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' },
        { id: 'requests', label: 'Client Requests', icon: Bell, emoji: '📥', badge: saasRequests.filter(r => r.status === 'pending').length },
        { id: 'clients', label: 'Organizations', icon: Building, emoji: '🏢' },
        { id: 'sectors', label: 'Industry Sectors', icon: Briefcase, emoji: '💼' },
        { id: 'plans', label: 'Subscription Plans', icon: Crown, emoji: '💎' },
        { id: 'announcements', label: 'Announcements', icon: Megaphone, emoji: '📢' },
        { id: 'users', label: 'System Users', icon: Users, emoji: '👥' },
        { id: 'sys_requests', label: 'Help & Requests', icon: ShieldAlert, emoji: '💬' },
        { id: 'logs', label: 'Activity Logs', icon: Clock, emoji: '🔍' },
        { id: 'reports', label: 'Reports', icon: BarChart3, emoji: '📊' },
        { id: 'settings', label: 'Settings', icon: Settings, emoji: '⚙️' }
    ];

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 900 }}>👑 LOADING...</div>;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-brand"><div className="brand-logo">F</div><div className="brand-name">ForgeIndia</div></div>
                <nav className="admin-nav">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} className={`nav-item ${activeTab === t.id ? 'active' : ''}`}>
                            <t.icon size={18} /><span>{t.label}</span>
                            {t.badge > 0 && <span style={{ marginLeft: 'auto', background: '#EF4444', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>{t.badge}</span>}
                        </button>
                    ))}
                </nav>
                <div style={{ padding: '20px' }}><button onClick={() => { logout(); navigate('/login'); }} className="nav-item" style={{ background: '#fee2e2', color: '#dc2626' }}><LogOut size={18} /><span>Sign Out</span></button></div>
            </aside>

            <main className="admin-content">
                <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="header-title"><h1>{tabs.find(t => t.id === activeTab)?.emoji} {tabs.find(t => t.id === activeTab)?.label}</h1></div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}><Bell size={22} color="#64748b"/><span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 5px', borderRadius: '50%' }}>3</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ textAlign: 'right' }}><b style={{ fontSize: '14px' }}>{user.name}</b><br/><small style={{ color: '#64748b' }}>Super Admin</small></div>
                            <div style={{ width: '40px', height: '40px', background: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>{user.name[0]}</div>
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="fade-in">
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            <div className="stat-card" style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
                                <div className="stat-icon" style={{ background: 'white', color: '#ef4444' }}><Clock size={24}/></div>
                                <div className="stat-info"><div className="label" style={{ color: '#991b1b' }}>Expiring Soon</div><div className="value" style={{ color: '#991b1b' }}>5 Clients</div></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><Zap size={24}/></div>
                                <div className="stat-info"><div className="label">Server Status</div><div className="value" style={{ color: '#16a34a', fontSize: '18px' }}>ONLINE</div></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}><Activity size={24}/></div>
                                <div className="stat-info"><div className="label">API Latency</div><div className="value">42ms</div></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: '#f3f4f6', color: '#64748b' }}><ShoppingBag size={24}/></div>
                                <div className="stat-info"><div className="label">Total Bookings</div><div className="value">1,284</div></div>
                            </div>
                        </div>
                        <div className="table-header" style={{ marginTop: '30px' }}><h2>🚀 Platform Vital Signs</h2></div>
                        <div style={{ height: '300px' }} className="data-table-container">
                            <Line data={{ labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'], datasets: [{ label: 'Traffic', data: [10, 5, 45, 120, 85, 30], borderColor: '#6366f1', fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)' }] }} options={{ responsive: true, maintainAspectRatio: false }}/>
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="fade-in">
                        <div className="table-header"><h2>📢 Announcement Module</h2><button className="action-btn" style={{ background: '#6366f1', color: 'white' }}>+ Create New</button></div>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead><tr><th>Announcement Title</th><th>Target</th><th>Created</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    <tr><td><b>System Maintenance Alert</b></td><td>All Clients</td><td>Today</td><td><span className="status-badge status-paid">SENT</span></td><td><button className="action-btn">History</button></td></tr>
                                    <tr><td><b>New Premium Features</b></td><td>Free Users</td><td>2 Days ago</td><td><span className="status-badge" style={{ background: '#eee' }}>DRAFT</span></td><td><button className="action-btn">Edit</button></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="fade-in">
                        <div className="table-header"><h2>🔍 System Activity Logs</h2><div className="search-bar" style={{ width: '250px' }}><Search size={18}/><input placeholder="Filter logs..."/></div></div>
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
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="action-btn" onClick={() => alert("📤 Exporting clients to CSV...")}><ShoppingBag size={16} style={{ marginRight: '5px' }}/> Export CSV</button>
                                <div className="search-bar" style={{ width: '250px' }}><Search size={18}/><input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/></div>
                            </div>
                        </div>
                        <table className="data-table">
                            <thead><tr><th>Organization</th><th>Expiry</th><th>Plan</th><th>Action</th></tr></thead>
                            <tbody>
                                {allUsers.filter(u => u.role === 'client' && u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                                    <tr key={c._id}>
                                        <td><b>{c.name}</b></td>
                                        <td><span style={{ color: '#ef4444' }}>12 May 2026</span></td>
                                        <td><b>BASIC</b></td>
                                        <td><button className="action-btn" title="Send Reminder"><Bell size={16}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
                            <div className="data-table-container shadow-hover" style={{ padding: '30px', borderRadius: '24px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', color: '#1e293b' }}><Globe size={22} color="#6366f1"/> System Branding</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div><label>System Name</label><input className="form-input" defaultValue="ForgeIndia Pro" style={{ width: '100%' }}/></div>
                                    <div><label>System Logo</label><input className="form-input" placeholder="URL..." style={{ width: '100%' }}/></div>
                                    <button className="action-btn" style={{ background: '#6366f1', color: 'white' }}>Save Changes</button>
                                </div>
                            </div>
                            <div className="data-table-container shadow-hover" style={{ padding: '30px', borderRadius: '24px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', color: '#1e293b' }}><Shield size={22} color="#6366f1"/> Security</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div><label>Admin Password</label><input className="form-input" type="password" placeholder="New Password" style={{ width: '100%' }}/></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>2FA Auth</span><button className="status-badge status-free">OFF</button></div>
                                    <button className="action-btn">Update Security</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;




