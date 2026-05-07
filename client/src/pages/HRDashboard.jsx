import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, Calendar, MessageSquare, CheckCircle, XCircle,
    Clock, User, Clipboard, Video, X, ArrowRight, Star,
    Send, Play, Bell, LogOut, Eye, Link2, TrendingUp, Award, Filter, Plus, LayoutDashboard, ChevronRight, Menu, Search, Building, FileText, BarChart2, Activity, UserPlus, Briefcase, Settings, Trash2, StopCircle, RefreshCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import FloatingSupport from '../components/FloatingSupport';
import { getSectorConfig } from '../config/sectorConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';

const StatusBadge = ({ status }) => {
// ...
    const map = {
        pending:   { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
        confirmed: { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
        approved:  { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
        accepted:  { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
        ongoing:   { bg: '#EDE9FE', color: '#7C3AED', label: 'LIVE' },
        completed: { bg: '#D1FAE5', color: '#059669', label: 'Completed' },
        rejected:  { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
    };
    const s = map[status] || { bg: '#F3F4F6', color: '#6B7280', label: status };
    return (
        <span style={{ padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color }}></div>
            {s.label}
        </span>
    );
};

const StatCard = ({ icon, label, value, color, bg }) => (
    <motion.div 
        whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}
    >
        <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {React.cloneElement(icon, { size: 28, color })}
        </div>
        <div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>{value}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>{label}</div>
        </div>
    </motion.div>
);

const HRDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const socket = useSocket();
    const showToast = useToast();
    const config = getSectorConfig(user?.sector || 'general');

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0, total: 0, revenue: 0 });
    const [activeTab, setActiveTab] = useState('overview');
    const [employees, setEmployees] = useState([]);
    const [showWalkInModal, setShowWalkInModal] = useState(false);
    const [walkInForm, setWalkInForm] = useState({ 
        patientName: '', patientPhone: '', professionalId: '',
        manualDate: new Date().toISOString().split('T')[0], manualTime: '', notes: '', purpose: '' 
    });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'employee', department: user?.department || '', specialty: '' });
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState(null);

    // Real-time listener
    useEffect(() => {
        if (!socket) return;

        socket.on('slot_booked', () => {
            console.log('📡 HR Refresh triggered by real-time event');
            showToast('Live Booking Update! Data synchronized.', 'success');
            fetchData();
        });

        return () => socket.off('slot_booked');
    }, [socket, showToast]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            // Fetch Appointments
            const appRes = await axios.get(`${API_BASE_URL}/appointments/my-appointments`, { headers: { 'x-auth-token': token } });
            setAppointments(appRes.data);
            
            // Fetch Employees
            const empRes = await axios.get(`${API_BASE_URL}/users`, { headers: { 'x-auth-token': token } });
            // Filter: Only employees, and potentially filter by department if multi-tenant
            setEmployees(empRes.data.filter(u => u.role === 'employee'));

            // Calc Stats
            const today = new Date().toISOString().split('T')[0];
            const data = appRes.data;
            setStats({
                total: data.length,
                today: data.filter(a => (a.date === today || a.manualDate === today)).length,
                pending: data.filter(a => a.status === 'pending').length,
                completed: data.filter(a => a.status === 'completed').length,
                revenue: data.filter(a => a.status === 'completed').length * 500 // Dummy revenue calc
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/appointments/${id}/status`, { status }, { headers: { 'x-auth-token': token } });
            fetchData();
        } catch (err) { alert('Failed to update status'); }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const endpoint = isEditMode ? `/users/${selectedStaffId}` : '/users/create-professional';
            const method = isEditMode ? 'patch' : 'post';
            
            await axios[method](`${API_BASE_URL}${endpoint}`, staffForm, { headers: { 'x-auth-token': token } });
            
            alert(isEditMode ? 'Staff updated!' : 'Staff onboarded!');
            setShowStaffModal(false);
            setIsEditMode(false);
            setStaffForm({ name: '', email: '', password: '', role: 'employee', department: user?.department || '', specialty: '' });
            fetchData();
        } catch (err) { alert('Operation failed'); }
    };

    const handleDeleteStaff = async (id) => {
        if (!window.confirm('Remove this staff member?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/users/${id}`, { headers: { 'x-auth-token': token } });
            fetchData();
        } catch (err) { alert('Deletion failed'); }
    };

    const handleWalkInBooking = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...walkInForm,
                booking_type: 'offline',
                status: 'confirmed',
                clientId: user.clientId
            };
            await axios.post(`${API_BASE_URL}/appointments/book`, payload, { headers: { 'x-auth-token': token } });
            alert('Booking confirmed!');
            setShowWalkInModal(false);
            fetchData();
        } catch (err) { alert('Booking failed'); } finally { setBookingLoading(false); }
    };

    const renderSidebar = () => (
        <aside style={{ width: '280px', background: '#0F172A', color: 'white', display: 'flex', flexDirection: 'column', height: '100vh', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(37,99,235,0.5)' }}>
                    <Briefcase size={22} color="white" />
                </div>
                <div>
                    <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px' }}>HR PORTAL</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>{user?.department || 'General'}</div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                    { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
                    { id: 'bookings', icon: <Calendar size={18} />, label: 'Live Bookings' },
                    { id: 'employees', icon: <Users size={18} />, label: 'Staff Management' },
                    { id: 'analytics', icon: <TrendingUp size={18} />, label: 'Performance' },
                    { id: 'settings', icon: <Settings size={18} />, label: 'Settings' }
                ].map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveTab(item.id)} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRadius: '14px', border: 'none', 
                            background: activeTab === item.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                            color: activeTab === item.id ? '#60A5FA' : '#94A3B8',
                            fontWeight: 800, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                        }}
                    >
                        {item.icon}
                        {item.label}
                        {activeTab === item.id && <motion.div layoutId="activeTab" style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: '#60A5FA' }} />}
                    </button>
                ))}
            </nav>

            <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '0 10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>{user?.name?.[0]}</div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>HR Manager</div>
                    </div>
                </div>
                <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#F87171', width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );

    const renderTopBar = () => (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', background: 'white', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 10 }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Manage your department resources and schedules effectively.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => fetchData()} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', cursor: 'pointer' }}>
                    <RefreshCcw size={20} />
                </button>
                <button 
                    onClick={() => activeTab === 'employees' ? setShowStaffModal(true) : setShowWalkInModal(true)} 
                    style={{ background: '#0F172A', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(15,23,42,0.3)' }}
                >
                    <Plus size={20} /> 
                    {activeTab === 'employees' ? 'Add Staff' : 'Quick Booking'}
                </button>
            </div>
        </header>
    );

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <RefreshCcw size={40} color="#3B82F6" />
            </motion.div>
        </div>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', fontFamily: "'Outfit', sans-serif", overflow: 'hidden' }}>
            {renderSidebar()}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                {renderTopBar()}
                <main style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                                    <StatCard icon={<TrendingUp />} label="Total Volume" value={stats.total} color="#10B981" bg="#D1FAE5" />
                                    <StatCard icon={<Clock />} label="Today's Slots" value={stats.today} color="#D97706" bg="#FEF3C7" />
                                    <StatCard icon={<Bell />} label="Pending" value={stats.pending} color="#3B82F6" bg="#DBEAFE" />
                                    <StatCard icon={<Users />} label="Staff Online" value={employees.length} color="#7C3AED" bg="#EDE9FE" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                                    <div style={{ background: 'white', borderRadius: '28px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '20px' }}>Recent Live Activity</h3>
                                            <button style={{ color: '#3B82F6', background: 'none', border: 'none', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>View All</button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                            {appointments.slice(0, 6).map((b, idx) => (
                                                <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: idx === 5 ? 'none' : '1px solid #F1F5F9' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                                            <User size={20} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 800, color: '#0F172A' }}>{b.patientName || b.userId?.name || 'Guest User'}</div>
                                                            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{b.purpose || 'General'} • {b.manualTime || b.slotId?.startTime}</div>
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={b.status} />
                                                </div>
                                            ))}
                                            {appointments.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>No activity records found.</div>}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: '28px', padding: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                                                <Activity size={150} />
                                            </div>
                                            <h3 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: '20px' }}>Department Health</h3>
                                            <p style={{ margin: '0 0 24px', fontSize: '13px', opacity: 0.7 }}>Your team efficiency is at 94% this week.</p>
                                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                                                <div style={{ height: '100%', background: '#3B82F6', width: '94%', borderRadius: '10px' }}></div>
                                            </div>
                                            <div style={{ fontSize: '12px', fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                                                <span>94% EFFICIENCY</span>
                                                <span>TARGET: 90%</span>
                                            </div>
                                        </div>

                                        <div style={{ background: 'white', borderRadius: '28px', padding: '32px', border: '1px solid #E2E8F0' }}>
                                            <h3 style={{ margin: '0 0 20px', fontWeight: 900, fontSize: '18px' }}>Quick Shortcuts</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                {[
                                                    { icon: <UserPlus size={18} />, label: 'Add Staff', onClick: () => { setActiveTab('employees'); setShowStaffModal(true); } },
                                                    { icon: <FileText size={18} />, label: 'Reports', onClick: () => setActiveTab('analytics') },
                                                    { icon: <Calendar size={18} />, label: 'Calendar', onClick: () => setActiveTab('bookings') },
                                                    { icon: <Settings size={18} />, label: 'Settings', onClick: () => setActiveTab('settings') }
                                                ].map((s, i) => (
                                                    <button key={i} onClick={s.onClick} style={{ padding: '16px', borderRadius: '20px', border: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                        <div style={{ color: '#3B82F6' }}>{s.icon}</div>
                                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E293B' }}>{s.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'bookings' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'white', borderRadius: '28px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                <div style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontWeight: 900 }}>Live Booking Monitor</h3>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input placeholder="Search bookings..." style={{ padding: '10px 16px 10px 40px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', width: '240px' }} />
                                        </div>
                                        <button style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                                            <Filter size={16} /> Filter
                                        </button>
                                    </div>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#F8FAFC' }}>
                                        <tr>
                                            {['CUSTOMER', 'SERVICE/PURPOSE', 'PROFESSIONAL', 'TIME', 'STATUS', 'ACTIONS'].map(h => <th key={h} style={{ padding: '20px 32px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map(item => (
                                            <tr key={item._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ fontWeight: 800, color: '#0F172A' }}>{item.patientName || item.userId?.name || 'Guest'}</div>
                                                    <div style={{ fontSize: '11px', color: '#64748B' }}>{item.patientPhone || 'No contact'}</div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{item.purpose || 'General Service'}</div>
                                                    <div style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 800 }}>{item.type?.toUpperCase()}</div>
                                                </td>
                                                <td style={{ padding: '20px 32px', fontWeight: 700, fontSize: '13px' }}>{item.hrId?.name || 'Not Assigned'}</td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ fontWeight: 800, fontSize: '13px' }}>{item.manualTime || item.slotId?.startTime}</div>
                                                    <div style={{ fontSize: '11px', color: '#64748B' }}>{item.date || item.manualDate}</div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}><StatusBadge status={item.status} /></td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {item.status === 'pending' && (
                                                            <button onClick={() => handleUpdateStatus(item._id, 'confirmed')} style={{ padding: '8px', borderRadius: '8px', background: '#D1FAE5', color: '#059669', border: 'none', cursor: 'pointer' }}>
                                                                <CheckCircle size={18} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleUpdateStatus(item._id, 'rejected')} style={{ padding: '8px', borderRadius: '8px', background: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer' }}>
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}

                        {activeTab === 'employees' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'white', borderRadius: '28px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                <div style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontWeight: 900 }}>Staff Directory</h3>
                                    <button onClick={() => { setShowStaffModal(true); setIsEditMode(false); setStaffForm({ name: '', email: '', password: '', role: 'employee', department: user?.department || '', specialty: '' }); }} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}>
                                        + Onboard Staff
                                    </button>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#F8FAFC' }}>
                                        <tr>
                                            {['STAFF NAME', 'CONTACT', 'SPECIALTY', 'ATTENDANCE', 'STATUS', 'ACTIONS'].map(h => <th key={h} style={{ padding: '20px 32px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#64748B' }}>{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.map(emp => (
                                            <tr key={emp._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#3B82F6' }}>{emp.name[0]}</div>
                                                        <div style={{ fontWeight: 800 }}>{emp.name}</div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px', color: '#64748B', fontSize: '13px' }}>{emp.email}</td>
                                                <td style={{ padding: '20px 32px', fontSize: '13px', fontWeight: 600 }}>{emp.specialty || 'Generalist'}</td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: '8px', background: emp.isBlocked ? '#FEE2E2' : '#D1FAE5', color: emp.isBlocked ? '#DC2626' : '#059669', fontSize: '11px', fontWeight: 800 }}>
                                                        {emp.isBlocked ? 'ABSENT' : 'PRESENT'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: emp.isBlocked ? '#EF4444' : '#10B981' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: emp.isBlocked ? '#EF4444' : '#10B981' }}></div>
                                                        {emp.isBlocked ? 'Blocked' : 'Active'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button 
                                                            onClick={() => {
                                                                setStaffForm({ name: emp.name, email: emp.email, role: emp.role, department: emp.department, specialty: emp.specialty });
                                                                setSelectedStaffId(emp._id);
                                                                setIsEditMode(true);
                                                                setShowStaffModal(true);
                                                            }}
                                                            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                                                        >
                                                            <Settings size={18} />
                                                        </button>
                                                        <button onClick={() => handleDeleteStaff(emp._id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {showWalkInModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '22px' }}>Quick Booking</h3>
                                <button onClick={() => setShowWalkInModal(false)} style={{ background: '#F8FAFC', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleWalkInBooking} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#64748B' }}>CUSTOMER NAME</label>
                                    <input required className="input-field" placeholder="Full legal name" value={walkInForm.patientName} onChange={e => setWalkInForm({...walkInForm, patientName: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#64748B' }}>DATE</label>
                                        <input required type="date" className="input-field" value={walkInForm.manualDate} onChange={e => setWalkInForm({...walkInForm, manualDate: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#64748B' }}>TIME</label>
                                        <input required type="time" className="input-field" value={walkInForm.manualTime} onChange={e => setWalkInForm({...walkInForm, manualTime: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#64748B' }}>ASSIGN PROFESSIONAL</label>
                                    <select required value={walkInForm.professionalId} onChange={e => setWalkInForm({...walkInForm, professionalId: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                                        <option value="">Select available staff</option>
                                        {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={bookingLoading} style={{ background: '#0F172A', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: 900, cursor: 'pointer', marginTop: '10px' }}>
                                    {bookingLoading ? 'Processing...' : 'Confirm Appointment'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {showStaffModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '500px' }}>
                            <h3 style={{ margin: '0 0 32px', fontWeight: 900, fontSize: '22px' }}>{isEditMode ? 'Edit Staff' : 'Onboard New Staff'}</h3>
                            <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <input required placeholder="Full Name" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                                <input required type="email" placeholder="Email Address" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                                {!isEditMode && <input required type="password" placeholder="Set Password" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }} />}
                                <input placeholder="Specialty (e.g. Cardiology, Frontend)" value={staffForm.specialty} onChange={e => setStaffForm({...staffForm, specialty: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setShowStaffModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ flex: 2, padding: '14px', borderRadius: '14px', border: 'none', background: '#3B82F6', color: 'white', fontWeight: 800, cursor: 'pointer' }}>{isEditMode ? 'Save Changes' : 'Create Account'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <FloatingSupport />
        </div>
    );
};

export default HRDashboard;

