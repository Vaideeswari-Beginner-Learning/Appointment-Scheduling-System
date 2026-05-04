import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, Calendar, MessageSquare, CheckCircle, XCircle,
    Clock, User, Clipboard, Video, X, ArrowRight, Star,
    Send, Play, Bell, LogOut, Eye, Link2, MapPin, 
    Stethoscope, Activity, Search, Filter, Briefcase, Wrench, ShieldAlert, LayoutDashboard, History, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import ProfessionalSlotManager from '../components/ProfessionalSlotManager';
import TopNavbar from '../components/TopNavbar';
import AvailabilityToggle from '../components/AvailabilityToggle';
import AppointmentChatModal from '../components/AppointmentChatModal';
import { getSectorConfig } from '../config/sectorConfig';

const ProfessionalDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [patientHistory, setPatientHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0, total: 0 });
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [professionalList, setProfessionalList] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [announcements, setAnnouncements] = useState([]);
    const [activeChatApp, setActiveChatApp] = useState(null);

    const sectorCfg = getSectorConfig(user?.sector || user?.userType || 'general');

    // Dynamic UI Configuration derived from sectorCfg
    const config = {
        title: `${sectorCfg.label} Portal`,
        welcome: `Welcome back, ${user?.name}. Manage your ${sectorCfg.dashboard.userRole.toLowerCase()} flow efficiently.`,
        clientLabel: sectorCfg.dashboard.userRole,
        clientsLabel: `${sectorCfg.dashboard.userRole}s`,
        registryLabel: `${sectorCfg.dashboard.bookingLabel} Registry`,
        expertLabel: sectorCfg.dashboard.employeeRole,
        icon: user?.userType === 'hospital' ? <Stethoscope size={32} /> : (user?.userType === 'interview' ? <Briefcase size={32} /> : <Activity size={32} />),
        themeColor: user?.userType === 'hospital' ? '#3B82F6' : (user?.userType === 'interview' ? '#10B981' : '#6366F1'),
        statsLabel: `Pending ${sectorCfg.dashboard.bookingLabel}`,
        statsDoneLabel: `Completed Today`,
        actionPrefix: 'Process'
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedPatient?.userId?._id) {
            fetchPatientHistory(selectedPatient.userId._id);
        } else {
            setPatientHistory([]);
        }
    }, [selectedPatient]);

    const fetchPatientHistory = async (patientId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(API_BASE_URL + `/appointments/patient/${patientId}`, {
                headers: { 'x-auth-token': token }
            });
            // Filter out the CURRENT appointment from the history list
            setPatientHistory(res.data.filter(a => a._id !== selectedPatient?._id));
        } catch (err) { console.error('History Fetch Error:', err); }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const [aptRes, profRes, annRes] = await Promise.all([
                axios.get(API_BASE_URL + '/appointments/my-appointments', { headers: { 'x-auth-token': token } }),
                axios.get(API_BASE_URL + '/users/professionals-by-dept?department=' + (user?.department || 'hospital'), { headers: { 'x-auth-token': token } }),
                axios.get(API_BASE_URL + '/announcements', { headers: { 'x-auth-token': token } })
            ]);
            
            setAppointments(aptRes.data);
            setProfessionalList(profRes.data);
            setAnnouncements(annRes.data);
            
            const today = new Date().toDateString();
            setStats({
                total: aptRes.data.length,
                today: aptRes.data.filter(a => new Date(a.slotId?.date || a.manualDate).toDateString() === today).length,
                pending: aptRes.data.filter(a => ['pending', 'approved', 'confirmed'].includes(a.status)).length,
                completed: aptRes.data.filter(a => a.status === 'completed').length
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, data) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch(API_BASE_URL + `/appointments/${id}/hospital-update`, data, {
                headers: { 'x-auth-token': token }
            });
            alert('Record updated successfully');
            fetchInitialData();
            if (selectedPatient?._id === id) {
                setSelectedPatient(res.data);
            }
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredAppointments = appointments.filter(a => {
        const matchesFilter = filter === 'all' ? true : a.status === filter;
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
            a.userId?.name?.toLowerCase().includes(query) ||
            (a.extra?.doctorType || '').toLowerCase().includes(query) ||
            (a.extra?.symptoms || '').toLowerCase().includes(query) ||
            (a.purpose || '').toLowerCase().includes(query);
        return matchesFilter && matchesSearch;
    });

    const todayAppointments = appointments.filter(a => 
        new Date(a.slotId?.date || a.manualDate).toDateString() === new Date().toDateString()
    );

    const StatusBadge = ({ status }) => {
        const styles = {
            pending:   { bg: '#FFFBEB', color: '#D97706', label: 'Pending' },
            confirmed: { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
            approved:  { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
            rejected:  { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
            completed: { bg: '#D1FAE5', color: '#1E40AF', label: 'Completed' }
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{ background: s.bg, color: s.color, padding: '4px 14px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3px', border: `1px solid ${s.color}20` }}>
                {s.label || status}
            </span>
        );
    };

    return (
        <div className="professional-dashboard" style={{ padding: '0px', animation: 'fadeIn 0.5s ease-out', minHeight: '100vh', background: '#F8FAFC' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .data-card { background: white; border-radius: 24px; border: 1px solid #E2E8F0; padding: 24px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .data-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
                .stat-icon { width: 48px; height: 48px; border-radius: 16px; display: flex; alignItems: center; justifyContent: center; margin-bottom: 20px; }
                .action-btn { transition: all 0.2s; border-radius: 12px !important; }
                .action-btn:hover { filter: brightness(0.9); transform: scale(1.02); }
                .row-hover:hover { background: #f8fafc; cursor: pointer; }
                .dash-tab { padding: 12px 24px; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
                .dash-tab.active { background: #0F172A; color: white; }
                .dash-tab:not(.active) { background: #F1F5F9; color: #64748B; }
                .dash-tab:not(.active):hover { background: #E2E8F0; }
                .top-navbar { height: 80px; background: white; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; position: sticky; top: 0; z-index: 100; }
            `}</style>

            <TopNavbar />

            <div style={{ padding: '40px' }}>
                {/* MODAL: DETAILS */}
                {selectedPatient && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div className="data-card" style={{ maxWidth: '600px', width: '100%', padding: '40px', overflowY: 'auto', maxHeight: '90vh' }}>
                            <div className="flex-between" style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: config.themeColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900 }}>
                                        {selectedPatient.userId?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>{selectedPatient.userId?.name}</h2>
                                        <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>{selectedPatient.userId?.email}</p>
                                    </div>
                                </div>
                                <button className="btn btn-ghost" onClick={() => setSelectedPatient(null)}><X size={24} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                                <div style={{ background: '#F0F9FF', padding: '20px', borderRadius: '20px', border: '1px solid #E0F2FE' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>{config.expertLabel} Specialty</div>
                                    <div style={{ fontWeight: 800, fontSize: '18px', color: '#0C4A6E' }}>{selectedPatient.extra?.doctorType || selectedPatient.purposeType || 'General'}</div>
                                </div>
                                <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '20px', border: '1px solid #DCFCE7' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Scheduled Date</div>
                                    <div style={{ fontWeight: 800, fontSize: '18px', color: '#064E3B' }}>{new Date(selectedPatient.slotId?.date || selectedPatient.manualDate).toLocaleDateString()} at {selectedPatient.slotId?.startTime || selectedPatient.manualTime}</div>
                                </div>
                                <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0', gridColumn: 'span 2' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>{config.clientLabel} Contact Info</div>
                                    <div style={{ display: 'flex', gap: '24px' }}>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>PHONE</div>
                                            <div style={{ fontWeight: 800, fontSize: '15px' }}>[PH] {selectedPatient.patientPhone || selectedPatient.extra?.phone || 'Not Provided'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>EMAIL</div>
                                            <div style={{ fontWeight: 800, fontSize: '15px' }}>[EM] {selectedPatient.userId?.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex" style={{ gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
                                {['pending'].includes(selectedPatient.status) && (
                                    <button className="btn btn-primary action-btn" style={{ flex: 2, background: '#10B981', borderColor: '#10B981' }} 
                                        onClick={() => handleUpdate(selectedPatient._id, { status: 'confirmed' })}>
                                        <CheckCircle size={18} style={{ marginRight: '8px' }} /> Confirm
                                    </button>
                                )}
                                {['approved', 'confirmed', 'ongoing'].includes(selectedPatient.status) && (
                                    <button className="btn btn-primary action-btn" style={{ flex: 2, background: '#3B82F6', borderColor: '#3B82F6' }} 
                                        onClick={() => handleUpdate(selectedPatient._id, { status: 'completed' })}>
                                        <CheckCircle size={18} style={{ marginRight: '8px' }} /> Mark Completed
                                    </button>
                                )}
                                {['pending', 'confirmed', 'approved', 'ongoing'].includes(selectedPatient.status) && (
                                    <button className="btn btn-outline action-btn" style={{ flex: 1, color: '#EF4444', borderColor: '#FCA5A5' }}
                                        onClick={() => handleUpdate(selectedPatient._id, { status: 'rejected' })}>
                                        <XCircle size={18} style={{ marginRight: '8px' }} /> Reject
                                    </button>
                                )}
                                {['confirmed', 'ongoing', 'completed'].includes(selectedPatient.status) && (
                                    <button className="btn btn-outline action-btn" style={{ flex: 1 }}
                                        onClick={() => setActiveChatApp(selectedPatient)}>
                                        <MessageSquare size={18} style={{ marginRight: '8px' }} /> Chat with Client
                                    </button>
                                )}
                            </div>

                            {/* ═══ PATIENT HISTORY SECTION ═══ */}
                            <div style={{ marginTop: '40px', borderTop: '1px solid #F1F5F9', paddingTop: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <History size={16} color="#64748B" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Past Records / History</h3>
                                </div>

                                {patientHistory.length === 0 ? (
                                    <div style={{ padding: '24px', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #E2E8F0', color: '#94A3B8', fontSize: '13px' }}>
                                        No previous interactions found for this patient.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {patientHistory.map(h => (
                                            <div key={h._id} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9', position: 'relative', overflow: 'hidden' }}>
                                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: h.status === 'completed' ? '#10B981' : h.status === 'approved' ? '#3B82F6' : '#94A3B8' }} />
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '14px' }}>{h.extra?.doctorType || h.purposeType || 'Session'}</span>
                                                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748B' }}>{new Date(h.slotId?.date || h.manualDate).toLocaleDateString()}</span>
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>By: {h.hrId?.name || 'Assigned Expert'}</span>
                                                    <span style={{ textTransform: 'uppercase', fontWeight: 900, fontSize: '9px', color: h.status === 'completed' ? '#10B981' : '#64748B' }}>{h.status}</span>
                                                </div>
                                                {h.feedback && (
                                                    <div style={{ marginTop: '8px', padding: '8px', background: '#F8FAFC', borderRadius: '8px', fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>
                                                        "{h.feedback}"
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ROLE-SPECIFIC WELCOME HEADER */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '40px', background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                        {config.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {config.title.split(' ')[0]} <span style={{ color: config.themeColor }}>{config.title.split(' ').slice(1).join(' ')}</span>
                            <div style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', background: `${config.themeColor}15`, color: config.themeColor, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {user?.role} portal
                            </div>
                        </h1>
                        <p style={{ margin: '8px 0 0 0', color: '#64748B', fontWeight: 600, fontSize: '16px' }}>{config.welcome}</p>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'right' }}>Your Status</div>
                        <AvailabilityToggle currentStatus={user?.availabilityStatus} />
                    </div>
                </div>

                {/* TABS */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                    <button className={`dash-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <LayoutDashboard size={18} /> Overview
                    </button>
                    <button className={`dash-tab ${activeTab === 'availability' ? 'active' : ''}`} onClick={() => setActiveTab('availability')}>
                        <Clock size={18} /> My Availability
                    </button>
                </div>

                {activeTab === 'overview' ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            <div className="data-card stat-card">
                                <div className="stat-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}><Users size={24} /></div>
                                <div style={{ fontSize: '32px', fontWeight: 900 }}>{stats.total}</div>
                                <div style={{ color: '#64748B', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Total {config.clientsLabel}</div>
                            </div>
                            <div className="data-card stat-card">
                                <div className="stat-icon" style={{ background: '#FFFBEB', color: '#D97706' }}><Clock size={24} /></div>
                                <div style={{ fontSize: '32px', fontWeight: 900 }}>{stats.today}</div>
                                <div style={{ color: '#64748B', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Today's Tasks</div>
                            </div>
                            <div className="data-card stat-card">
                                <div className="stat-icon" style={{ background: '#F0FDF4', color: '#166534' }}><Activity size={24} /></div>
                                <div style={{ fontSize: '32px', fontWeight: 900 }}>{stats.pending}</div>
                                <div style={{ color: '#64748B', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>{config.statsLabel}</div>
                            </div>
                            <div className="data-card stat-card">
                                <div className="stat-icon" style={{ background: '#D1FAE5', color: '#10B981' }}><TrendingUp size={24} /></div>
                                <div style={{ fontSize: '32px', fontWeight: 900 }}>Rs. {stats.revenue || 0}</div>
                                <div style={{ color: '#64748B', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Total Revenue</div>
                            </div>
                        </div>

                        {/* ANNOUNCEMENTS NOTICE BOARD */}
                        {announcements.length > 0 && (
                            <div style={{ marginBottom: '32px', animation: 'fadeIn 0.6s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ width: '40px', height: '40px', background: config.themeColor, color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Notice Board</h3>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Department & System-wide updates</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none' }}>
                                    {announcements.map(a => (
                                        <div key={a._id} style={{ minWidth: '320px', background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '24px', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <span style={{ 
                                                    fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '12px',
                                                    background: a.priority === 'urgent' ? '#FEE2E2' : '#F1F5F9',
                                                    color: a.priority === 'urgent' ? '#DC2626' : '#64748B'
                                                }}>{a.priority}</span>
                                                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 900 }}>{a.title}</h4>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{a.message}</p>
                                            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
                                                From: {a.createdBy?.role === 'admin' ? 'Administration' : `HR Department (${a.targetDepartment})`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
                            <div className="data-card" style={{ padding: '0px', overflow: 'hidden' }}>
                                <div style={{ padding: '24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontWeight: 900 }}>{config.registryLabel}</h3>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['all', 'pending', 'approved', 'completed'].map(f => (
                                            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                                                style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, padding: '6px 16px', ...(filter === f ? { background: config.themeColor, borderColor: config.themeColor } : {}) }}
                                                onClick={() => setFilter(f)}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                                {loading ? (
                                    <div style={{ padding: '80px', textAlign: 'center', color: '#94A3B8' }}>Loading Data...</div>
                                ) : filteredAppointments.length === 0 ? (
                                    <div style={{ padding: '80px', textAlign: 'center' }}>
                                        <Clipboard size={48} color="#CBD5E1" style={{ margin: '0 auto 20px' }} />
                                        <h4 style={{ margin: 0 }}>No records found</h4>
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#F8FAFC' }}>
                                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>{config.clientLabel}</th>
                                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Specialty</th>
                                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Schedule</th>
                                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAppointments.map(app => (
                                                <tr key={app._id} className="row-hover" style={{ borderBottom: '1px solid #F1F5F9' }} onClick={() => setSelectedPatient(app)}>
                                                    <td style={{ padding: '20px 24px' }}>
                                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>
                                                                {(app.patientName || app.userId?.name || 'P')?.charAt(0)}
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>{app.patientName || app.userId?.name || 'Unnamed Patient'}</div>
                                                                {app.patientPhone && <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>[PH] {app.patientPhone}</div>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '20px 24px', color: '#475569', fontWeight: 600 }}>{app.extra?.doctorType || app.purposeType || 'General'}</td>
                                                    <td style={{ padding: '20px 24px' }}>
                                                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{new Date(app.slotId?.date || app.manualDate).toLocaleDateString()}</div>
                                                        <div style={{ fontSize: '11px', color: config.themeColor, fontWeight: 700 }}>{app.slotId?.startTime || app.manualTime}</div>
                                                    </td>
                                                    <td style={{ padding: '20px 24px' }}><StatusBadge status={app.status} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="data-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>Recent Activity</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    {appointments.slice(0, 8).map((b, idx) => (
                                        <div key={b._id} style={{ 
                                            padding: '20px 0', 
                                            borderBottom: idx === appointments.slice(0, 8).length - 1 ? 'none' : '1px solid #F1F5F9', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center' 
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', marginBottom: '4px' }}>{b.userId?.name || b.patientName || 'Anonymous'}</div>
                                                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{b.type || 'General'} · {b.slotId?.date || b.manualDate || 'No Date'}</div>
                                            </div>
                                            <div style={{ 
                                                fontSize: '11px', 
                                                fontWeight: 900, 
                                                textTransform: 'uppercase', 
                                                color: b.status === 'pending' ? '#EA580C' : b.status === 'cancelled' || b.status === 'rejected' ? '#64748B' : (config.themeColor || '#0284C7')
                                            }}>
                                                {b.status}
                                            </div>
                                        </div>
                                    ))}
                                    {appointments.length === 0 && <p style={{ fontSize: '14px', color: '#94A3B8', textAlign: 'center', padding: '40px 0' }}>No recent activity to show.</p>}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <ProfessionalSlotManager />
                    </div>
                )}
            </div>

            {/* MODALS */}
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

