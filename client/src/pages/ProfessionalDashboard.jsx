import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, Calendar, MessageSquare, CheckCircle, XCircle,
    Clock, User, Clipboard, Video, X, ArrowRight, Star,
    Send, Play, Bell, LogOut, Eye, Link2, MapPin, 
    Stethoscope, Activity, Search, Filter, Briefcase, Wrench, ShieldAlert, LayoutDashboard, History, TrendingUp, RefreshCcw, Check, Ban
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

const StatusBadge = ({ status }) => {
// ... existing StatusBadge code ...
    const map = {
        pending:   { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
        confirmed: { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
        approved:  { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
        accepted:  { bg: '#E0F2FE', color: '#0284C7', label: 'Accepted' },
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

const ProfessionalDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const socket = useSocket();
    const showToast = useToast();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0, total: 0 });
    const [activeTab, setActiveTab] = useState('overview');
    const [activeChatApp, setActiveChatApp] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const config = getSectorConfig(user?.sector || 'general');

    // Real-time listener
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

    const renderSidebar = () => (
        <aside style={{ width: '280px', background: '#0F172A', color: 'white', display: 'flex', flexDirection: 'column', height: '100vh', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ padding: '24px 32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                <div style={{ background: 'white', padding: '6px 12px', borderRadius: '12px', display: 'inline-flex', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.15)', width: '100%', boxSizing: 'border-box', justifyContent: 'center' }}>
                    <img src="/logo.png" alt="Forge India Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '1px' }}>Forge India Connect</div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '2px' }}>Staff Hub</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginTop: '2px' }}>{user?.specialty || 'Professional'}</div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                    { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
                    { id: 'schedule', icon: <Calendar size={18} />, label: 'My Schedule' },
                    { id: 'slots', icon: <Clock size={18} />, label: 'Manage Slots' },
                    { id: 'history', icon: <History size={18} />, label: 'Past Tasks' },
                    { id: 'settings', icon: <Settings size={18} />, label: 'Profile' }
                ].map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveTab(item.id)} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRadius: '14px', border: 'none', 
                            background: activeTab === item.id ? 'rgba(139,92,246,0.1)' : 'transparent',
                            color: activeTab === item.id ? '#A78BFA' : '#94A3B8',
                            fontWeight: 800, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                        }}
                    >
                        {item.icon}
                        {item.label}
                        {activeTab === item.id && <motion.div layoutId="activeTabEmp" style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: '#A78BFA' }} />}
                    </button>
                ))}
            </nav>

            <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#F87171', width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <RefreshCcw size={40} color="#8B5CF6" />
            </motion.div>
        </div>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', fontFamily: "'Outfit', sans-serif", overflow: 'hidden' }}>
            {renderSidebar()}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', background: 'white', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Welcome back, {user?.name}. You have {stats.today} tasks today.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <AvailabilityToggle currentStatus={user?.availabilityStatus} />
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <Bell size={20} color="#64748B" />
                            {stats.pending > 0 && <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', background: '#EF4444', borderRadius: '50%', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 900 }}>{stats.pending}</div>}
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                                    <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #E2E8F0' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', marginBottom: '8px' }}>TODAY'S TASKS</div>
                                        <div style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A' }}>{stats.today}</div>
                                    </div>
                                    <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #E2E8F0' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', marginBottom: '8px' }}>PENDING REVIEW</div>
                                        <div style={{ fontSize: '32px', fontWeight: 900, color: '#D97706' }}>{stats.pending}</div>
                                    </div>
                                    <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #E2E8F0' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', marginBottom: '8px' }}>COMPLETED</div>
                                        <div style={{ fontSize: '32px', fontWeight: 900, color: '#059669' }}>{stats.completed}</div>
                                    </div>
                                    <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #E2E8F0' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', marginBottom: '8px' }}>TOTAL RECORD</div>
                                        <div style={{ fontSize: '32px', fontWeight: 900, color: '#6366F1' }}>{stats.total}</div>
                                    </div>
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
                                                        <button onClick={() => handleUpdateStatus(b._id, 'completed')} style={{ background: '#D1FAE5', color: '#059669', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Check size={16} /> Complete
                                                        </button>
                                                        <button onClick={() => setSelectedAppointment(b)} style={{ background: 'white', border: '1px solid #E2E8F0', padding: '10px 16px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Details</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {appointments.filter(a => ['confirmed', 'accepted', 'approved'].includes(a.status)).length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No confirmed tasks for today.</div>}
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
                                                        <button onClick={() => handleUpdateStatus(b._id, 'confirmed')} style={{ flex: 1, background: '#D97706', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Accept</button>
                                                        <button onClick={() => handleUpdateStatus(b._id, 'rejected')} style={{ flex: 1, background: 'white', border: '1px solid #FDE68A', color: '#92400E', padding: '10px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Decline</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {appointments.filter(a => a.status === 'pending').length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>All requests are processed.</div>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'schedule' && (
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
                                                <td style={{ padding: '20px 32px' }}><StatusBadge status={item.status} /></td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <button onClick={() => setSelectedAppointment(item)} style={{ background: 'none', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>View Details</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}

                        {activeTab === 'slots' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <ProfessionalSlotManager />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
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
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 900 }}>{selectedAppointment.patientName?.[0]}</div>
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
                                            <button onClick={() => handleUpdateStatus(selectedAppointment._id, 'confirmed')} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#8B5CF6', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Accept Task</button>
                                            <button onClick={() => handleUpdateStatus(selectedAppointment._id, 'rejected')} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'white', border: '1px solid #EF4444', color: '#EF4444', fontWeight: 800, cursor: 'pointer' }}>Reject</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleUpdateStatus(selectedAppointment._id, 'completed')} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#10B981', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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
        </div>
    );
};

export default ProfessionalDashboard;


