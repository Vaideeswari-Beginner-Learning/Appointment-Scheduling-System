import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard, Users, CreditCard, BarChart3, Bell, Settings, LogOut,
    Plus, X, TrendingUp, Activity, Building, ShieldAlert, Crown, Clock,
    CheckCircle, XCircle, Edit2, ChevronDown, Search, Megaphone, ArrowRight, Briefcase, Trash2,
    PieChart, Filter, Save, Globe, Mail, Zap, ShoppingBag, Heart, Scissors, Home, Wrench, GraduationCap, Gavel, Camera, MapPin, UserCheck, Shield, Key, Database, RefreshCw, Smartphone, Eye, MoreHorizontal, ChevronRight,
    Car, Sparkles, Dumbbell, Music, Building2, Laptop, Cpu, Scale, Calendar
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
import { getSectorConfig } from '../config/sectorConfig';
import './AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [allUsers, setAllUsers] = useState([]);
    const [saasRequests, setSaasRequests] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    
    // Edit Organization State
    const [editingOrg, setEditingOrg] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        organizationName: '',
        email: '',
        sector: '',
        expiryDate: ''
    });

    // Announcements State
    const [announcements, setAnnouncements] = useState([]);
    const [showAnnounceModal, setShowAnnounceModal] = useState(false);
    const [announceForm, setAnnounceForm] = useState({
        title: '',
        message: '',
        priority: 'normal',
        targetRole: 'all',
        targetDepartment: ''
    });

    // Edit User Role State
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUserForRole, setSelectedUserForRole] = useState(null);
    const [roleForm, setRoleForm] = useState({
        role: '',
        department: ''
    });
    
    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        try {
            const [usersRes, saasRes, sectorsRes, announcementsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/users`, { headers: { 'x-auth-token': token } }),
                axios.get(`${API_BASE_URL}/saas/requests`, { headers: { 'x-auth-token': token } }).catch(() => ({ data: [] })),
                axios.get(`${API_BASE_URL}/sectors`, { headers: { 'x-auth-token': token } }).catch(() => ({ data: [] })),
                axios.get(`${API_BASE_URL}/announcements`, { headers: { 'x-auth-token': token } }).catch(() => ({ data: [] }))
            ]);
            setAllUsers(usersRes.data);
            setSaasRequests(saasRes.data);
            setSectors(sectorsRes.data);
            setAnnouncements(announcementsRes.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleAddRole = async (sectorId, currentSubCategories = []) => {
        const roleName = prompt("Enter new role name for this sector (e.g. Doctor, Teacher):");
        if (!roleName) return;
        try {
            const updated = [...currentSubCategories, roleName];
            await axios.patch(`${API_BASE_URL}/sectors/${sectorId}`, { subCategories: updated }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
            fetchAll();
        } catch (err) {
            alert('Failed to add role');
        }
    };

    const handleApproveRequest = async (requestId) => {
        if (!window.confirm('Approve this request and update client plan?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/saas/requests/${requestId}`, { status: 'approved' }, { headers: { 'x-auth-token': token } });
            alert('Request approved and client account updated!');
            fetchAll();
        } catch (err) {
            alert('Approval failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleRejectRequest = async (requestId) => {
        if (!window.confirm('Reject this request?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/saas/requests/${requestId}`, { status: 'rejected' }, { headers: { 'x-auth-token': token } });
            alert('Request rejected.');
            fetchAll();
        } catch (err) {
            alert('Rejection failed');
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/users/${userId}/block`, {}, { headers: { 'x-auth-token': token } });
            fetchAll();
        } catch (err) {
            console.error(err);
            alert('Failed to toggle status');
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/announcements`, announceForm, {
                headers: { 'x-auth-token': token }
            });
            setShowAnnounceModal(false);
            setAnnounceForm({
                title: '',
                message: '',
                priority: 'normal',
                targetRole: 'all',
                targetDepartment: ''
            });
            fetchAll();
            alert('Announcement published successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to publish announcement: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/announcements/${id}`, {
                headers: { 'x-auth-token': token }
            });
            fetchAll();
        } catch (err) {
            console.error(err);
            alert('Failed to delete announcement');
        }
    };

    const handleToggleAnnouncement = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/announcements/${id}/toggle`, {}, {
                headers: { 'x-auth-token': token }
            });
            fetchAll();
        } catch (err) {
            console.error(err);
            alert('Failed to toggle status');
        }
    };

    const handleEditRolePermission = (u) => {
        setSelectedUserForRole(u);
        setRoleForm({
            role: u.role || 'user',
            department: u.department || ''
        });
        setShowRoleModal(true);
    };

    const handleUpdateUserRole = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/users/${selectedUserForRole._id}/role`, roleForm, {
                headers: { 'x-auth-token': token }
            });
            setShowRoleModal(false);
            setSelectedUserForRole(null);
            fetchAll();
            alert('User role updated successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to update user role');
        }
    };

    const handleEditClick = (org) => {
        setEditingOrg(org);
        setEditFormData({
            name: org.name || '',
            organizationName: org.organizationName || '',
            email: org.email || '',
            sector: org.sector || '',
            expiryDate: org.plan?.expiryDate ? new Date(org.plan.expiryDate).toISOString().split('T')[0] : ''
        });
    };

    const handleUpdateOrg = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/users/${editingOrg._id}`, {
                name: editFormData.name,
                organizationName: editFormData.organizationName,
                email: editFormData.email,
                sector: editFormData.sector
            }, { headers: { 'x-auth-token': token } });

            if (editFormData.expiryDate) {
                await axios.patch(`${API_BASE_URL}/users/${editingOrg._id}/plan`, {
                    plan: { expiryDate: editFormData.expiryDate }
                }, { headers: { 'x-auth-token': token } });
            }

            setEditingOrg(null);
            fetchAll();
            alert('Organization updated successfully');
        } catch (err) {
            console.error(err);
            alert('Update failed');
        }
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
                <div style={{ padding: '24px 25px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.03)', marginBottom: '10px' }}>
                    <div style={{ background: 'white', padding: '6px 12px', borderRadius: '12px', display: 'inline-flex', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.15)', width: '100%', boxSizing: 'border-box', justifyContent: 'center' }}>
                        <img src="/logo.png" alt="Forge India Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Forge India Connect</div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'center', marginTop: '-4px' }}>Admin Portal</div>
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

                        {activeTab === 'requests' && (
                            <div className="fade-in">
                                <div className="table-header">
                                    <h2>📥 Client SaaS Requests</h2>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input" style={{ width: '180px', padding: '8px' }}>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead><tr><th>Client</th><th>Request Type</th><th>Reason</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                                        <tbody>
                                            {saasRequests.filter(r => r.status === statusFilter).map((req, i) => (
                                                <motion.tr key={req._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                                                    <td>
                                                        <div style={{ fontWeight: 900 }}>{req.clientName || req.clientId?.name}</div>
                                                        <div style={{ fontSize: '11px', color: '#64748B' }}>{req.clientId?.email}</div>
                                                    </td>
                                                    <td><span style={{ fontWeight: 800, color: '#6366F1' }}>{req.type?.replace('_', ' ').toUpperCase()}</span></td>
                                                    <td style={{ fontSize: '13px', color: '#475569', maxWidth: '200px' }}>{req.message}</td>
                                                    <td style={{ fontSize: '12px' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`status-badge ${req.status === 'approved' ? 'status-paid' : req.status === 'pending' ? 'status-pending' : 'status-failed'}`}>
                                                            {req.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {req.status === 'pending' && (
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={() => handleApproveRequest(req._id)} className="action-btn" title="Approve" style={{ color: '#10B981' }}><CheckCircle size={16}/></button>
                                                                <button onClick={() => handleRejectRequest(req._id)} className="action-btn" title="Reject" style={{ color: '#EF4444' }}><XCircle size={16}/></button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                            {saasRequests.filter(r => r.status === statusFilter).length === 0 && (
                                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No {statusFilter} requests found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'plans' && (
                            <div className="fade-in">
                                <div className="table-header">
                                    <h2>💎 Subscription Architecture</h2>
                                    <button className="action-btn" style={{ background: '#0F172A', color: 'white' }}>+ Define New Tier</button>
                                </div>
                                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                                    {[
                                        { name: 'Starter', price: '$0', color: '#94A3B8', features: ['50 Appointments', '1 Service', 'Basic Analytics'] },
                                        { name: 'Pro Business', price: '$49', color: '#6366F1', features: ['Unlimited Bookings', '10 Staff Members', 'AI Scheduling', 'Advanced Reports'], active: true },
                                        { name: 'Enterprise', price: 'Custom', color: '#0F172A', features: ['Global Presence', 'Dedicated Support', 'White-labeling', 'API Access'] }
                                    ].map((plan, i) => (
                                        <div key={i} className="data-table-container shadow-hover" style={{ padding: '35px', borderRadius: '32px', border: plan.active ? '2px solid #6366F1' : '1px solid #F1F5F9', position: 'relative' }}>
                                            {plan.active && <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#6366F1', color: 'white', fontSize: '10px', padding: '4px 12px', borderRadius: '20px', fontWeight: 900 }}>MOST POPULAR</div>}
                                            <div style={{ fontSize: '12px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Tier Level {i+1}</div>
                                            <h3 style={{ fontSize: '24px', fontWeight: 950, color: '#0F172A', marginBottom: '8px' }}>{plan.name}</h3>
                                            <div style={{ fontSize: '32px', fontWeight: 950, color: plan.color, marginBottom: '24px' }}>{plan.price}<small style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>/month</small></div>
                                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                                                {plan.features.map((f, j) => (
                                                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569' }}>
                                                        <CheckCircle size={14} color="#10B981"/> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button className="action-btn" style={{ width: '100%', padding: '12px', borderRadius: '12px', background: plan.active ? '#6366F1' : '#F1F5F9', color: plan.active ? 'white' : '#475569', fontWeight: 900 }}>Configure Tier</button>
                                        </div>
                                    ))}
                                </div>

                                <div className="table-header" style={{ marginTop: '50px' }}>
                                    <h2>💳 Client Subscription Overview</h2>
                                    <div className="search-bar" style={{ width: '350px' }}>
                                        <Search size={18}/>
                                        <input 
                                            placeholder="Search by organization or email..." 
                                            value={searchQuery} 
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                                    <div className="stat-card" style={{ background: '#EEF2FF', border: '1px solid #E0E7FF' }}>
                                        <div className="stat-icon" style={{ background: '#6366F1', color: 'white' }}><Crown size={20}/></div>
                                        <div className="stat-info">
                                            <div className="label" style={{ color: '#4338CA' }}>Paid Subscriptions</div>
                                            <div className="value" style={{ color: '#1E1B4B' }}>{allUsers.filter(u => u.role === 'client' && u.plan?.type === 'paid').length}</div>
                                        </div>
                                    </div>
                                    <div className="stat-card" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                        <div className="stat-icon" style={{ background: '#94A3B8', color: 'white' }}><Users size={20}/></div>
                                        <div className="stat-info">
                                            <div className="label">Free / Starter Users</div>
                                            <div className="value">{allUsers.filter(u => u.role === 'client' && (u.plan?.type === 'free' || !u.plan?.type)).length}</div>
                                        </div>
                                    </div>
                                    <div className="stat-card" style={{ background: '#ECFDF5', border: '1px solid #D1FAE5' }}>
                                        <div className="stat-icon" style={{ background: '#10B981', color: 'white' }}><TrendingUp size={20}/></div>
                                        <div className="stat-info">
                                            <div className="label" style={{ color: '#047857' }}>Active Ratio</div>
                                            <div className="value" style={{ color: '#064E3B' }}>
                                                {allUsers.filter(u => u.role === 'client').length > 0 
                                                    ? Math.round((allUsers.filter(u => u.role === 'client' && u.plan?.type === 'paid').length / allUsers.filter(u => u.role === 'client').length) * 100)
                                                    : 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Organization</th>
                                                <th>Plan Type</th>
                                                <th>Status</th>
                                                <th>Expiry Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allUsers
                                                .filter(u => u.role === 'client' && (
                                                    (u.organizationName || u.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    u.email.toLowerCase().includes(searchQuery.toLowerCase())
                                                ))
                                                .map((client, i) => {
                                                    const isExpired = client.plan?.expiryDate && new Date(client.plan.expiryDate) < new Date();
                                                    const isPaid = client.plan?.type === 'paid';
                                                    
                                                    return (
                                                        <motion.tr key={client._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                                            <td>
                                                                <div style={{ fontWeight: 900 }}>{client.organizationName || client.name}</div>
                                                                <div style={{ fontSize: '11px', color: '#64748B' }}>{client.email}</div>
                                                            </td>
                                                            <td>
                                                                <span style={{ 
                                                                    background: isPaid ? '#EEF2FF' : '#F1F5F9', 
                                                                    color: isPaid ? '#4F46E5' : '#64748B',
                                                                    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 900
                                                                }}>
                                                                    {isPaid ? 'PREMIUM PRO' : 'FREE STARTER'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`status-badge ${isExpired ? 'status-failed' : 'status-paid'}`}>
                                                                    {isExpired ? 'EXPIRED' : 'ACTIVE'}
                                                                </span>
                                                            </td>
                                                            <td style={{ fontSize: '13px', fontWeight: 700 }}>
                                                                {client.plan?.expiryDate ? new Date(client.plan.expiryDate).toLocaleDateString() : 'LIFETIME'}
                                                            </td>
                                                            <td>
                                                                <button className="action-btn" onClick={() => alert("Opening subscription manager...")} title="Manage Subscription">
                                                                    <Settings size={16}/>
                                                                </button>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            {allUsers.filter(u => u.role === 'client').length === 0 && (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No client subscriptions found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'announcements' && (
                            <div className="fade-in">
                                <div className="table-header">
                                    <h2>📢 Announcement Module</h2>
                                    <button className="action-btn" onClick={() => setShowAnnounceModal(true)} style={{ background: '#6366F1', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Plus size={18} /> Create New
                                    </button>
                                </div>
                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Announcement Detail</th>
                                                <th>Target Audience</th>
                                                <th>Priority</th>
                                                <th>Published</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {announcements.map((ann, i) => (
                                                <motion.tr key={ann._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                                                    <td>
                                                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{ann.title}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, marginTop: '4px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ann.message}>
                                                            {ann.message}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                                                            {ann.targetRole} {ann.targetDepartment ? `(${ann.targetDepartment})` : ''}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ 
                                                            fontSize: '11px', fontWeight: 900, textTransform: 'uppercase',
                                                            color: ann.priority === 'high' ? '#EF4444' : ann.priority === 'low' ? '#6B7280' : '#F59E0B'
                                                        }}>
                                                            ● {ann.priority}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '12px' }}>{new Date(ann.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <button 
                                                            onClick={() => handleToggleAnnouncement(ann._id)}
                                                            style={{
                                                                border: 'none', background: ann.isActive ? '#D1FAE5' : '#F3F4F6',
                                                                color: ann.isActive ? '#059669' : '#6B7280',
                                                                padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 900,
                                                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                            }}
                                                        >
                                                            {ann.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button className="action-btn" style={{ color: '#EF4444', border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => handleDeleteAnnouncement(ann._id)} title="Delete">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                            {announcements.length === 0 && (
                                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No announcements published yet.</td></tr>
                                            )}
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

                        {activeTab === 'sectors' && (
                            <div className="fade-in">
                                <div className="table-header">
                                    <h2>💼 Industry Sectors</h2>
                                    <button className="action-btn" style={{ background: '#6366F1', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Plus size={18} /> New Sector
                                    </button>
                                </div>
                                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                                    {sectors.map((s, i) => {
                                        const config = getSectorConfig(s.name);
                                        const sectorImage = s.image || config.userSide?.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80';
                                        
                                        return (
                                            <motion.div 
                                                key={s._id} 
                                                initial={{ opacity: 0, scale: 0.9 }} 
                                                animate={{ opacity: 1, scale: 1 }} 
                                                transition={{ delay: i * 0.05 }}
                                                className="data-table-container shadow-hover"
                                                style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                                            >
                                                <div style={{ height: '120px', position: 'relative' }}>
                                                    <img src={sectorImage} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
                                                    <div style={{ position: 'absolute', bottom: '15px', left: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        {(() => {
                                                            const getIconColor = (name) => {
                                                                switch(name) {
                                                                    case 'Hospital': return '#EF4444';
                                                                    case 'Heart': return '#F43F5E';
                                                                    case 'Scissors': return '#EC4899';
                                                                    case 'Home': return '#F59E0B';
                                                                    case 'Car': return '#3B82F6';
                                                                    case 'Dumbbell': return '#10B981';
                                                                    case 'GraduationCap': return '#8B5CF6';
                                                                    case 'Laptop': return '#6366F1';
                                                                    case 'Cpu': return '#06B6D4';
                                                                    case 'Wrench': return '#64748B';
                                                                    case 'Scale': return '#1E293B';
                                                                    case 'Camera': return '#F43F5E';
                                                                    case 'Calendar': return '#4F46E5';
                                                                    case 'Gavel': return '#78350F';
                                                                    case 'Music': return '#D946EF';
                                                                    case 'Sparkles': return '#F59E0B';
                                                                    default: return '#white';
                                                                }
                                                            };
                                                            const iconColor = getIconColor(s.icon);
                                                            return (
                                                                <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
                                                                    {s.icon === 'Hospital' && <Building2 size={20}/>}
                                                                    {s.icon === 'Heart' && <Heart size={20}/>}
                                                                    {s.icon === 'Scissors' && <Scissors size={20}/>}
                                                                    {s.icon === 'Home' && <Home size={20}/>}
                                                                    {s.icon === 'Car' && <Car size={20}/>}
                                                                    {s.icon === 'Dumbbell' && <Dumbbell size={20}/>}
                                                                    {s.icon === 'GraduationCap' && <GraduationCap size={20}/>}
                                                                    {s.icon === 'Laptop' && <Laptop size={20}/>}
                                                                    {s.icon === 'Cpu' && <Cpu size={20}/>}
                                                                    {s.icon === 'Wrench' && <Wrench size={20}/>}
                                                                    {s.icon === 'Scale' && <Scale size={20}/>}
                                                                    {s.icon === 'Camera' && <Camera size={20}/>}
                                                                    {s.icon === 'Calendar' && <Calendar size={20}/>}
                                                                    {s.icon === 'Gavel' && <Gavel size={20}/>}
                                                                    {s.icon === 'Music' && <Music size={20}/>}
                                                                    {s.icon === 'Sparkles' && <Sparkles size={20}/>}
                                                                    {!['Hospital', 'Heart', 'Scissors', 'Home', 'Car', 'Dumbbell', 'GraduationCap', 'Laptop', 'Cpu', 'Wrench', 'Scale', 'Camera', 'Calendar', 'Gavel', 'Music', 'Sparkles'].includes(s.icon) && <Briefcase size={20}/>}
                                                                </div>
                                                            );
                                                        })()}
                                                        <div style={{ color: 'white' }}>
                                                            <div style={{ fontSize: '18px', fontWeight: 900 }}>{s.name}</div>
                                                            <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>{s.category}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '20px' }}>
                                                    {s.subCategories && s.subCategories.length > 0 && (
                                                        <div style={{ fontSize: '11px', color: '#6366F1', fontWeight: 700, background: '#EEF2FF', padding: '6px 12px', borderRadius: '8px', display: 'block', marginBottom: '15px' }}>
                                                            Roles: {s.subCategories.join(', ')}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button className="action-btn" style={{ flex: 1, justifyContent: 'center' }} title="Add Role" onClick={() => handleAddRole(s._id, s.subCategories || [])}><Plus size={16}/> Add Role</button>
                                                        <button className="action-btn" title="Edit"><Edit2 size={16}/></button>
                                                        <button className="action-btn" title="Delete" style={{ color: '#EF4444' }}><Trash2 size={16}/></button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
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
                                    <thead><tr><th>Organization</th><th>Industry</th><th>Expiry</th><th>Plan</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {allUsers.filter(u => u.role === 'client' && (u.organizationName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.name.toLowerCase().includes(searchQuery.toLowerCase()))).map((c, i) => (
                                            <motion.tr key={c._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                                <td>
                                                    <div style={{ fontWeight: 900, color: '#0F172A' }}>{c.organizationName || c.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#64748B' }}>{c.email}</div>
                                                </td>
                                                <td><span style={{ background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>{c.sectorName || 'General'}</span></td>
                                                <td><span style={{ color: c.plan?.expiryDate ? '#EF4444' : '#64748B', fontWeight: 700 }}>{c.plan?.expiryDate ? new Date(c.plan.expiryDate).toLocaleDateString() : 'Lifetime'}</span></td>
                                                <td><span style={{ background: c.plan?.type === 'paid' ? '#EEF2FF' : '#F1F5F9', color: c.plan?.type === 'paid' ? '#6366F1' : '#64748B', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>{c.plan?.type?.toUpperCase() || 'FREE'}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button className="action-btn" title="Edit" onClick={() => handleEditClick(c)} style={{ color: '#6366F1' }}><Edit2 size={16}/></button>
                                                        <button 
                                                           className="action-btn" 
                                                           title={c.isBlocked ? "Activate" : "Deactivate"} 
                                                           onClick={() => handleToggleStatus(c._id)}
                                                           style={{ color: c.isBlocked ? '#10B981' : '#EF4444' }}
                                                        >
                                                            {c.isBlocked ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                        {allUsers.filter(u => u.role === 'client').length === 0 && (
                                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No organizations found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="fade-in">
                                <div className="table-header">
                                    <h2>👥 System User Directory</h2>
                                    <div className="search-bar" style={{ width: '400px' }}>
                                        <Search size={18}/>
                                        <input placeholder="Search users by name, email or role..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
                                    </div>
                                </div>
                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead><tr><th>User Detail</th><th>Access Level</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
                                        <tbody>
                                            {allUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.role.toLowerCase().includes(searchQuery.toLowerCase())).map((u, i) => (
                                                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '32px', height: '32px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>{u.name[0]}</div>
                                                            <div>
                                                                <div style={{ fontWeight: 800 }}>{u.name}</div>
                                                                <div style={{ fontSize: '11px', color: '#64748B' }}>{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ 
                                                            padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase',
                                                            background: u.role === 'super-admin' ? '#FEF3C7' : u.role === 'client' ? '#E0E7FF' : '#F1F5F9',
                                                            color: u.role === 'super-admin' ? '#D97706' : u.role === 'client' ? '#4F46E5' : '#64748B'
                                                        }}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ 
                                                            color: u.isBlocked ? '#EF4444' : '#10B981', 
                                                            fontWeight: 900, 
                                                            fontSize: '11px',
                                                            textTransform: 'uppercase',
                                                            background: u.isBlocked ? '#FEE2E2' : '#D1FAE5',
                                                            padding: '4px 10px',
                                                            borderRadius: '8px'
                                                        }}>
                                                            ● {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '12px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button 
                                                                className="action-btn" 
                                                                title="Edit Permissions" 
                                                                onClick={() => handleEditRolePermission(u)}
                                                                style={{ color: '#4F46E5' }}
                                                            >
                                                                <Shield size={16}/>
                                                            </button>
                                                            <button 
                                                                className="action-btn" 
                                                                title={u.isBlocked ? "Unban User" : "Ban User"} 
                                                                onClick={() => handleToggleStatus(u._id)}
                                                                style={{ color: u.isBlocked ? '#10B981' : '#EF4444' }}
                                                            >
                                                                {u.isBlocked ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'sys_requests' && (
                            <div className="fade-in">
                                <div className="table-header">
                                    <h2>💬 Help & Support Requests</h2>
                                    <button className="action-btn" style={{ background: '#6366F1', color: 'white' }}>Support Tickets (2)</button>
                                </div>
                                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                                    {[
                                        { user: 'Rahul V.', issue: 'Payment Gateway Integration', time: '2 hours ago', priority: 'High' },
                                        { user: 'Sita M.', issue: 'Custom Domain Setup', time: '5 hours ago', priority: 'Medium' }
                                    ].map((t, i) => (
                                        <div key={i} className="data-table-container shadow-hover" style={{ padding: '25px', borderRadius: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 900, color: t.priority === 'High' ? '#EF4444' : '#F59E0B' }}>● {t.priority.toUpperCase()} PRIORITY</span>
                                                <span style={{ fontSize: '11px', color: '#64748B' }}>{t.time}</span>
                                            </div>
                                            <h4 style={{ margin: '0 0 5px', fontSize: '16px', fontWeight: 800 }}>{t.issue}</h4>
                                            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Requested by {t.user}</p>
                                            <button className="action-btn" style={{ width: '100%', background: '#F8FAFC' }}>Open Ticket</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'reports' && (
                            <div className="fade-in">
                                <div className="table-header">
                                    <h2>📊 Platform Performance Reports</h2>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="action-btn"><RefreshCw size={16}/> Refresh</button>
                                        <button className="action-btn" style={{ background: '#0F172A', color: 'white' }}><Database size={16}/> Export Full Data</button>
                                    </div>
                                </div>
                                <div className="stats-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                                    <div className="data-table-container" style={{ padding: '30px', height: '400px' }}>
                                        <h4 style={{ marginBottom: '20px' }}>Revenue Growth (Projected)</h4>
                                        <Bar 
                                            data={{ 
                                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], 
                                                datasets: [{ label: 'Revenue', data: [12000, 19000, 15000, 25000, 22000, 30000], backgroundColor: '#6366F1', borderRadius: 8 }] 
                                            }} 
                                            options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                        />
                                    </div>
                                    <div className="data-table-container" style={{ padding: '30px', height: '400px' }}>
                                        <h4 style={{ marginBottom: '20px' }}>User Distribution</h4>
                                        <Doughnut 
                                            data={{ 
                                                labels: ['Admin', 'Clients', 'Users'], 
                                                datasets: [{ data: [5, 45, 150], backgroundColor: ['#0F172A', '#6366F1', '#E0E7FF'], borderWidth: 0 }] 
                                            }} 
                                            options={{ maintainAspectRatio: false }}
                                        />
                                    </div>
                                </div>
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

                {/* Edit Organization Modal */}
                <AnimatePresence>
                    {editingOrg && (
                        <div className="modal-overlay" onClick={() => setEditingOrg(null)}>
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="modal-content" 
                                style={{ maxWidth: '500px', width: '90%' }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Edit Organization</h2>
                                    <button onClick={() => setEditingOrg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={24}/></button>
                                </div>
                                <form onSubmit={handleUpdateOrg}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Organization Name</label>
                                            <input 
                                                className="form-input" 
                                                value={editFormData.organizationName} 
                                                onChange={e => setEditFormData({...editFormData, organizationName: e.target.value})} 
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Admin Name</label>
                                            <input 
                                                className="form-input" 
                                                value={editFormData.name} 
                                                onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Email Address</label>
                                            <input 
                                                className="form-input" 
                                                value={editFormData.email} 
                                                onChange={e => setEditFormData({...editFormData, email: e.target.value})} 
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Sector</label>
                                            <select 
                                                className="form-input" 
                                                value={editFormData.sector} 
                                                onChange={e => setEditFormData({...editFormData, sector: e.target.value})} 
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                            >
                                                {sectors.map(s => <option key={s._id} value={s.name.toLowerCase()}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Plan Expiry Date</label>
                                            <input 
                                                type="date"
                                                className="form-input" 
                                                value={editFormData.expiryDate} 
                                                onChange={e => setEditFormData({...editFormData, expiryDate: e.target.value})} 
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                            />
                                        </div>
                                        <button type="submit" className="action-btn" style={{ background: '#6366F1', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 900, marginTop: '10px' }}>Save Changes</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Create Announcement Modal */}
                <AnimatePresence>
                    {showAnnounceModal && (
                        <div className="modal-overlay" onClick={() => setShowAnnounceModal(false)}>
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="modal-content" 
                                style={{ maxWidth: '500px', width: '90%' }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Create New Announcement</h2>
                                    <button onClick={() => setShowAnnounceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={24}/></button>
                                </div>
                                <form onSubmit={handleCreateAnnouncement}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Announcement Title</label>
                                            <input 
                                                required
                                                className="form-input" 
                                                placeholder="e.g. System Upgrade Notification"
                                                value={announceForm.title} 
                                                onChange={e => setAnnounceForm({...announceForm, title: e.target.value})} 
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Announcement Message</label>
                                            <textarea 
                                                required
                                                className="form-input" 
                                                placeholder="Enter full details of the announcement..."
                                                rows={4}
                                                value={announceForm.message} 
                                                onChange={e => setAnnounceForm({...announceForm, message: e.target.value})} 
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', fontFamily: 'inherit', resize: 'vertical' }}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Priority Level</label>
                                                <select 
                                                    className="form-input" 
                                                    value={announceForm.priority} 
                                                    onChange={e => setAnnounceForm({...announceForm, priority: e.target.value})} 
                                                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                                >
                                                    <option value="normal">Normal</option>
                                                    <option value="high">High Priority</option>
                                                    <option value="low">Low Priority</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Target Role</label>
                                                <select 
                                                    className="form-input" 
                                                    value={announceForm.targetRole} 
                                                    onChange={e => setAnnounceForm({...announceForm, targetRole: e.target.value})} 
                                                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                                >
                                                    <option value="all">All Audiences</option>
                                                    <option value="client">Organizations (Clients)</option>
                                                    <option value="hr">HR Managers</option>
                                                    <option value="employee">Staff / Employees</option>
                                                    <option value="user">Customers / Users</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Target Sector/Department (Optional)</label>
                                            <select 
                                                className="form-input" 
                                                value={announceForm.targetDepartment} 
                                                onChange={e => setAnnounceForm({...announceForm, targetDepartment: e.target.value})} 
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                            >
                                                <option value="">System Wide (All Sectors)</option>
                                                {sectors.map(s => <option key={s._id} value={s.name.toLowerCase()}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <button type="submit" className="action-btn" style={{ background: '#6366F1', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 900, marginTop: '10px' }}>Publish Announcement</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Edit Permissions Modal */}
                <AnimatePresence>
                    {showRoleModal && selectedUserForRole && (
                        <div className="modal-overlay" onClick={() => { setShowRoleModal(false); setSelectedUserForRole(null); }}>
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="modal-content" 
                                style={{ maxWidth: '450px', width: '90%' }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Edit Permissions</h2>
                                    <button onClick={() => { setShowRoleModal(false); setSelectedUserForRole(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={24}/></button>
                                </div>
                                <form onSubmit={handleUpdateUserRole}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '8px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#6366F1', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{selectedUserForRole.name[0]}</div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#0F172A' }}>{selectedUserForRole.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748B' }}>{selectedUserForRole.email}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Assigned System Role</label>
                                            <select 
                                                className="form-input" 
                                                value={roleForm.role} 
                                                onChange={e => setRoleForm({...roleForm, role: e.target.value})} 
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                            >
                                                <option value="user">User / Guest</option>
                                                <option value="employee">Employee / Professional</option>
                                                <option value="hr">HR Manager</option>
                                                <option value="client">Client (Tenant Admin)</option>
                                                <option value="admin">System Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '6px' }}>Department / Specialty Designation</label>
                                            <input 
                                                className="form-input" 
                                                placeholder="e.g. Sales, Marketing, IT (Optional)"
                                                value={roleForm.department} 
                                                onChange={e => setRoleForm({...roleForm, department: e.target.value})} 
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                            />
                                        </div>
                                        <button type="submit" className="action-btn" style={{ background: '#6366F1', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 900, marginTop: '10px' }}>Apply Permissions</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminDashboard;




