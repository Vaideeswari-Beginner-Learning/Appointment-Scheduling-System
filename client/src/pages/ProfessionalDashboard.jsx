import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, Calendar, MessageSquare, CheckCircle, XCircle,
    Clock, User, Clipboard, Video, X, ArrowRight, Star,
    Send, Play, Bell, LogOut, Eye, Link2, MapPin, 
    Stethoscope, Activity, Search, Filter, Briefcase, Wrench, ShieldAlert, LayoutDashboard, History, TrendingUp, RefreshCcw, Check, Ban, Settings, Edit2, ShieldCheck, FileText, BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import ProfessionalSlotManager from '../components/ProfessionalSlotManager';
import AvailabilityToggle from '../components/AvailabilityToggle';
import AppointmentChatModal from '../components/AppointmentChatModal';
import { getSectorConfig } from '../config/sectorConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import FloatingSupport from '../components/FloatingSupport';

const StatusBadge = ({ status }) => {
// ... existing StatusBadge code ...
    const map = {
        pending:   { bg: '#FEF3C7', color: '#B76E79', label: 'Pending' },
        confirmed: { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
        approved:  { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
        accepted:  { bg: '#E0F2FE', color: '#0284C7', label: 'Accepted' },
        ongoing:   { bg: '#EDE9FE', color: '#7C3AED', label: 'LIVE' },
        completed: { bg: '#D1FAE5', color: '#4A1C40', label: 'Completed' },
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

const ProfessionalDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;
    const socket = useSocket();
    const showToast = useToast();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0, total: 0 });
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
    }, [window.location.search]);

    const [activeChatApp, setActiveChatApp] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [profileForm, setProfileForm] = useState({ name: '', email: '', gender: '', specialty: '', phone: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const config = getSectorConfig(user?.sector || 'general');

    useEffect(() => {
        if (!socket) return;
        socket.on('slot_booked', () => {
            console.log('📡 Data refresh triggered by real-time event');
            showToast('New appointment booked! Refreshing dashboard...', 'success');
            fetchData();
        });
        return () => socket.off('slot_booked');
    }, [socket, showToast]);

    useEffect(() => {
        if (user) {
            fetchData();
            setProfileForm({
                name: user.name || '',
                email: user.email || '',
                gender: user.gender || '',
                specialty: user.specialty || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_BASE_URL}/appointments/my-appointments`, { headers: { 'x-auth-token': token } });
            setAppointments(res.data);
            const today = new Date().toISOString().split('T')[0];
            const data = res.data;
            setStats({
                total: data.length,
                today: data.filter(a => (a.date === today || a.manualDate === today)).length,
                pending: data.filter(a => a.status === 'pending').length,
                completed: data.filter(a => a.status === 'completed').length,
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
            if (selectedAppointment?._id === id) setSelectedAppointment(null);
        } catch (err) { alert('Failed to update status'); }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/users/profile`, profileForm, { headers: { 'x-auth-token': token } });
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <RefreshCcw size={40} color="#8B5CF6" />
            </motion.div>
        </div>
    );

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 900 }}>Staff <span className="text-gold">Workstation</span></h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Manage your professional appointments and availability.</p>
                </div>
                <AvailabilityToggle currentStatus={user?.availabilityStatus} />
            </header>

            <div style={{ flex: 1 }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                                    {[
                                        { label: "Today's Tasks", value: stats.today, icon: <LayoutDashboard size={20}/>, color: 'var(--primary)', bg: 'rgba(2, 44, 34, 0.05)' },
                                        { label: 'Pending Review', value: stats.pending, icon: <Clock size={20}/>, color: 'var(--accent)', bg: 'rgba(183, 110, 121, 0.05)' },
                                        { label: 'Completed', value: stats.completed, icon: <CheckCircle size={20}/>, color: '#10B981', bg: 'rgba(16, 185, 129, 0.05)' },
                                        { label: 'Total Record', value: stats.total, icon: <BarChart2 size={20}/>, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.05)' }
                                    ].map((s, i) => (
                                        <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div style={{ background: s.bg, color: s.color, width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                                            <div>
                                                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                                                <div style={{ fontSize: '28px', fontWeight: 950, color: 'var(--primary)', marginTop: '2px' }}>{s.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                                    <div style={{ background: 'white', borderRadius: '28px', padding: '32px', border: '1px solid #E2E8F0' }}>
                                        <h3 style={{ margin: '0 0 24px', fontWeight: 900 }}>Upcoming Schedule</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {appointments.filter(a => ['confirmed', 'accepted', 'approved'].includes(a.status)).slice(0, 5).map(b => (
                                                <div key={b._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#8B5CF6', fontSize: '18px' }}>{b.patientName?.[0] || 'G'}</div>
                                                        <div>
                                                            <div style={{ fontWeight: 800 }}>{b.patientName || 'Guest User'}</div>
                                                            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{b.manualTime || b.slotId?.startTime} • {b.purpose || 'General'}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => handleUpdateStatus(b._id, 'completed')} style={{ background: '#D1FAE5', color: '#4A1C40', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Check size={16} /> Complete
                                                        </button>
                                                        <button onClick={() => setSelectedAppointment(b)} style={{ background: 'white', border: '1px solid #E2E8F0', padding: '10px 16px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Details</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {appointments.filter(a => ['confirmed', 'accepted', 'approved'].includes(a.status)).length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>No confirmed tasks for today.</div>}
                                        </div>
                                    </div>

                                    <div style={{ background: 'white', borderRadius: '28px', padding: '32px', border: '1px solid #E2E8F0' }}>
                                        <h3 style={{ margin: '0 0 24px', fontWeight: 900 }}>Pending Requests</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {appointments.filter(a => a.status === 'pending').map(b => (
                                                <div key={b._id} style={{ padding: '20px', borderRadius: '20px', background: '#FFFBEB', border: '1px solid #FEF3C7' }}>
                                                    <div style={{ fontWeight: 800, marginBottom: '4px' }}>{b.patientName || 'Guest User'}</div>
                                                    <div style={{ fontSize: '12px', color: '#92400E', fontWeight: 700, marginBottom: '16px' }}>{b.date || b.manualDate} at {b.manualTime || b.slotId?.startTime}</div>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => handleUpdateStatus(b._id, 'confirmed')} style={{ flex: 1, background: '#B76E79', color: '#2D3748', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Accept</button>
                                                        <button onClick={() => handleUpdateStatus(b._id, 'rejected')} style={{ flex: 1, background: 'white', border: '1px solid #FDE68A', color: '#92400E', padding: '10px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Decline</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {appointments.filter(a => a.status === 'pending').length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>All requests are processed.</div>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'appointments' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'white', borderRadius: '28px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#F8FAFC' }}>
                                        <tr>
                                            {['CUSTOMER', 'TIME/DATE', 'PURPOSE', 'STATUS', 'ACTION'].map(h => <th key={h} style={{ padding: '20px 32px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#64748B' }}>{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map(item => (
                                            <tr key={item._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ fontWeight: 800 }}>{item.patientName || 'Unnamed'}</div>
                                                    <div style={{ fontSize: '11px', color: '#64748B' }}>{item.patientPhone || 'No Contact'}</div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ fontWeight: 800 }}>{item.manualTime || item.slotId?.startTime}</div>
                                                    <div style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: 800 }}>{item.date || item.manualDate}</div>
                                                </td>
                                                <td style={{ padding: '20px 32px', fontWeight: 700 }}>{item.purpose || 'General'}</td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <StatusBadge status={item.status} />
                                                        {item.booking_type === 'offline' && <span className="badge badge-manual">Manual Booking</span>}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <button onClick={() => setSelectedAppointment(item)} style={{ background: 'none', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>View Details</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}

                        {activeTab === 'schedule' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <ProfessionalSlotManager sector={user?.sector} />
                            </motion.div>
                        )}

                        {activeTab === 'profile' && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '40px', border: '1px solid #E2E8F0', maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                                        <div style={{ width: '100%', height: '100%', borderRadius: '40px', overflow: 'hidden', border: '4px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
                                            {user?.avatar ? (
                                                <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                user?.role === 'hr' ? <ShieldCheck size={48} color="#8B5CF6" /> : <User size={48} color="#6366F1" />
                                            )}
                                        </div>
                                        <button style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '36px', height: '36px', borderRadius: '12px', background: '#8B5CF6', color: '#2D3748', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                    <h2 style={{ margin: 0, fontWeight: 900 }}>{profileForm.name}</h2>
                                    <p style={{ color: '#64748B', fontWeight: 600 }}>{profileForm.email}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Full Name</label>
                                        <input className="input-field" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} style={{ height: '56px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0 20px', fontWeight: 700 }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Gender</label>
                                        <select className="input-field" value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})} style={{ height: '56px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0 20px', fontWeight: 700 }}>
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Specialty / Job Title</label>
                                        <input className="input-field" value={profileForm.specialty} onChange={e => setProfileForm({...profileForm, specialty: e.target.value})} placeholder="e.g. Senior Consultant" style={{ height: '56px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0 20px', fontWeight: 700 }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Phone Number</label>
                                        <input className="input-field" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} style={{ height: '56px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0 20px', fontWeight: 700 }} />
                                    </div>
                                </div>

                                <div style={{ marginTop: '32px', borderTop: '1px solid #F1F5F9', paddingTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                    <button onClick={() => fetchData()} style={{ height: '56px', padding: '0 32px', borderRadius: '16px', background: '#F1F5F9', border: 'none', fontWeight: 800, cursor: 'pointer', color: '#64748B' }}>Discard</button>
                                    <button 
                                        disabled={isSaving}
                                        onClick={handleUpdateProfile}
                                        style={{ height: '56px', padding: '0 32px', borderRadius: '16px', background: '#8B5CF6', color: '#2D3748', border: 'none', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(139,92,246,0.4)' }}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        {['availability', 'notifications', 'reports', 'settings'].includes(activeTab) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '80px 40px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{ width: '80px', height: '80px', background: '#F1F5F9', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', margin: '0 auto 24px' }}>
                                    {activeTab === 'availability' && <Clock size={40} />}
                                    {activeTab === 'notifications' && <Bell size={40} />}
                                    {activeTab === 'reports' && <BarChart2 size={40} />}
                                    {activeTab === 'settings' && <Settings size={40} />}
                                </div>
                                <h3 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 900, color: '#2D3748' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
                                <p style={{ margin: 0, color: '#64748B', fontSize: '15px', maxWidth: '400px', marginInline: 'auto' }}>
                                    This feature is currently being tailored for the {user?.specialty || 'professional'} dashboard. Stay tuned for upcoming tools.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <footer style={{ 
                        marginTop: 'auto', padding: '30px', textAlign: 'center', 
                        color: '#D1FAE5', opacity: 0.5, fontSize: '12px', fontWeight: 700,
                        borderTop: '1px solid rgba(217,119,6,0.1)'
                    }}>
                        © 2026 Forge India Connect Pvt Ltd • Professional Workstation Portal
                    </footer>
                </div>


            {/* APPOINTMENT DETAIL MODAL */}
            <AnimatePresence>
                {selectedAppointment && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '22px' }}>Appointment Details</h3>
                                <button onClick={() => setSelectedAppointment(null)} style={{ background: '#F8FAFC', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: '#F8FAFC', borderRadius: '20px' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D3748', fontSize: '24px', fontWeight: 900 }}>{selectedAppointment.patientName?.[0]}</div>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 900 }}>{selectedAppointment.patientName}</div>
                                        <div style={{ fontSize: '14px', color: '#64748B' }}>{selectedAppointment.patientPhone}</div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '4px' }}>SCHEDULE</div>
                                        <div style={{ fontWeight: 800 }}>{selectedAppointment.manualTime || selectedAppointment.slotId?.startTime}</div>
                                    </div>
                                    <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '4px' }}>STATUS</div>
                                        <div style={{ fontWeight: 800, textTransform: 'capitalize' }}>{selectedAppointment.status}</div>
                                    </div>
                                </div>

                                <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '4px' }}>PURPOSE / NOTES</div>
                                    <div style={{ fontWeight: 700, lineHeight: 1.5 }}>{selectedAppointment.purpose || 'No additional notes provided by customer.'}</div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                    {selectedAppointment.status === 'pending' ? (
                                        <>
                                            <button onClick={() => handleUpdateStatus(selectedAppointment._id, 'confirmed')} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#8B5CF6', color: '#2D3748', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Accept Task</button>
                                            <button onClick={() => handleUpdateStatus(selectedAppointment._id, 'rejected')} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'white', border: '1px solid #EF4444', color: '#EF4444', fontWeight: 800, cursor: 'pointer' }}>Reject</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleUpdateStatus(selectedAppointment._id, 'completed')} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#5A315D', color: '#2D3748', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <CheckCircle size={18} /> Mark Completed
                                            </button>
                                            <button onClick={() => setActiveChatApp(selectedAppointment)} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'white', border: '1px solid #E2E8F0', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <MessageSquare size={18} /> Chat
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {activeChatApp && (
                <AppointmentChatModal 
                    appointment={activeChatApp} 
                    onClose={() => setActiveChatApp(null)} 
                />
            )}
            <FloatingSupport />
        </div>
    );
};

export default ProfessionalDashboard;


