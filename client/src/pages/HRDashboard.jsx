import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, Calendar, MessageSquare, CheckCircle, XCircle,
    Clock, User, Clipboard, Video, X, ArrowRight, Star,
    Send, Play, Bell, LogOut, Eye, Link2, TrendingUp, Award, Filter, Plus, LayoutDashboard, ChevronRight, Menu, Search, Building, FileText, BarChart2, Activity, UserPlus, Briefcase, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import SlotCreation from '../components/SlotCreation';
import StaffOnboardingForm from '../components/StaffOnboardingForm';
import ServiceCreationForm from '../components/ServiceCreationForm';
import ClientRegistryForm from '../components/ClientRegistryForm';
import RequirementPostingForm from '../components/RequirementPostingForm';
import FloatingSupport from '../components/FloatingSupport';
import { getSectorConfig } from '../config/sectorConfig';

const StatusBadge = ({ status }) => {
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
        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', background: s.bg, color: s.color }}>
            {s.label}
        </span>
    );
};

const StatCard = ({ icon, label, value, color, bg }) => (
    <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '18px', transition: 'all 0.25s', cursor: 'default', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.12)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {React.cloneElement(icon, { size: 26, color })}
        </div>
        <div>
            <div style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginTop: '4px' }}>{label}</div>
        </div>
    </div>
);

const Modal = ({ children, onClose }) => (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px' }}>
            {children}
        </div>
    </div>
);

const HRDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const config = getSectorConfig(user?.sector || 'general');

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0, total: 0, revenue: 0 });
    const [activeTab, setActiveTab] = useState('overview');
    const [doctors, setDoctors] = useState([]);
    const [showWalkInModal, setShowWalkInModal] = useState(false);
    const [walkInForm, setWalkInForm] = useState({ 
        patientName: '', patientPhone: '', doctorId: '', doctorName: '', 
        manualDate: new Date().toISOString().split('T')[0], manualTime: '', notes: '' 
    });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'employee', specialty: '', department: user?.department || '' });
    const [customers, setCustomers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        if (user) {
            fetchAssignedWork();
            fetchDashboardStats();
            fetchCustomers();
            fetchAllUsers();
        }
    }, [user]);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/users/customer-list`, { headers: { 'x-auth-token': token } });
            setCustomers(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAllUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/users`, { headers: { 'x-auth-token': token } });
            setAllUsers(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/analytics/stats`, { headers: { 'x-auth-token': token } });
            setStats(prev => ({ ...prev, ...res.data }));
        } catch (err) { console.error(err); }
    };

    const fetchAssignedWork = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(API_BASE_URL + '/appointments/my-appointments', { headers: { 'x-auth-token': token } });
            const data = res.data;
            setInterviews(data);
            const todayStr = new Date().toDateString();
            setStats(prev => ({
                ...prev,
                total: data.length,
                today: data.filter(a => new Date(a.slotId?.date || a.manualDate).toDateString() === todayStr).length,
                pending: data.filter(a => ['pending', 'approved', 'accepted'].includes(a.status)).length,
                completed: data.filter(a => a.status === 'completed').length,
            }));

            const drRes = await axios.get(API_BASE_URL + '/users/professionals?department=' + (user?.department || 'hospital'), { headers: { 'x-auth-token': token } });
            setDoctors(drRes.data || []);
        } catch (err) { 
            console.error(err);
            if (err.response?.status === 401) { logout(); navigate('/login'); }
        } finally { setLoading(false); }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/appointments/${id}/status`, { status }, { headers: { 'x-auth-token': token } });
            fetchAssignedWork();
        } catch (err) { alert('Failed to update status'); }
    };

    const handleOnboardStaff = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/users/create-professional`, { ...staffForm, clientId: user.clientId || user.id, department: user.department }, { headers: { 'x-auth-token': token } });
            alert('Staff onboarded successfully!');
            setShowStaffModal(false);
            setStaffForm({ name: '', email: '', password: '', role: 'employee', specialty: '', department: user?.department || '' });
            fetchAssignedWork();
        } catch (err) { alert('Onboarding failed'); }
    };

    const handleDeactivateDoctor = async (id) => {
        if (!window.confirm('Remove this employee?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/users/${id}`, { headers: { 'x-auth-token': token } });
            fetchAssignedWork();
        } catch (err) { alert('Deletion failed'); }
    };

    const handleWalkInBooking = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/appointments`, { ...walkInForm, clientId: user.clientId || user.id, status: 'confirmed' }, { headers: { 'x-auth-token': token } });
            alert('Booking confirmed!');
            setShowWalkInModal(false);
            fetchAssignedWork();
        } catch (err) { alert('Booking failed'); } finally { setBookingLoading(false); }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const renderSidebar = () => (
        <aside style={{ width: '280px', background: '#0F172A', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={20} color="white" />
                </div>
                <span style={{ fontSize: '20px', fontWeight: 900 }}>ForgeIndia</span>
            </div>
            <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['overview', 'bookings', 'employees', 'customers', 'allUsers'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRadius: '14px', border: 'none', 
                        background: activeTab === tab ? 'rgba(59,130,246,0.15)' : 'transparent',
                        color: activeTab === tab ? '#60A5FA' : '#94A3B8',
                        fontWeight: 800, cursor: 'pointer', textAlign: 'left', textTransform: 'capitalize'
                    }}>
                        {tab === 'overview' && <Clock size={18} />}
                        {tab === 'bookings' && <Clipboard size={18} />}
                        {tab === 'employees' && <Users size={18} />}
                        {tab === 'customers' && <User size={18} />}
                        {tab === 'allUsers' && <Users size={18} />}
                        {tab}
                    </button>
                ))}
            </nav>
            <div style={{ padding: '24px' }}>
                <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#F87171', width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Logout</button>
            </div>
        </aside>
    );

    const renderTopBar = () => (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', background: 'white', borderBottom: '1px solid #F1F5F9' }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>{activeTab.toUpperCase()}</h1>
            <button onClick={() => activeTab === 'employees' ? setShowStaffModal(true) : setShowWalkInModal(true)} style={{ background: '#0F172A', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 900, cursor: 'pointer' }}>
                {activeTab === 'employees' ? '+ Add Staff' : '+ New Booking'}
            </button>
        </header>
    );

    const todayInterviews = interviews.filter(a => new Date(a.slotId?.date || a.manualDate).toDateString() === new Date().toDateString());

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
            {renderSidebar()}
            <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
                {renderTopBar()}
                <div style={{ padding: '40px' }}>
                    {activeTab === 'overview' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                                <StatCard icon={<TrendingUp />} label="Revenue" value={`RS ${stats.revenue || 0}`} color="#10B981" bg="#D1FAE5" />
                                <StatCard icon={<Clock />} label="Today" value={stats.today} color="#D97706" bg="#FEF3C7" />
                                <StatCard icon={<Clipboard />} label="Pending" value={stats.pending} color="#3B82F6" bg="#DBEAFE" />
                                <StatCard icon={<Users />} label="Total" value={stats.total} color="#7C3AED" bg="#EDE9FE" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0' }}>
                                    <h3 style={{ margin: '0 0 20px', fontWeight: 900 }}>Recent Activity</h3>
                                    {interviews.slice(0, 5).map(b => (
                                        <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #F1F5F9' }}>
                                            <div>
                                                <div style={{ fontWeight: 800 }}>{b.patientName || b.userId?.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748B' }}>{b.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0' }}>
                                    <h3 style={{ margin: '0 0 20px', fontWeight: 900 }}>Today's Schedule</h3>
                                    {todayInterviews.length === 0 ? <p>No bookings today</p> : todayInterviews.map(item => (
                                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #F1F5F9' }}>
                                            <div>{item.patientName || item.userId?.name}</div>
                                            <StatusBadge status={item.status} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'bookings' && (
                        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#F8FAFC' }}>
                                    <tr>
                                        {['User', 'Service', 'Time', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '20px', textAlign: 'left', fontSize: '12px' }}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {interviews.map(item => (
                                        <tr key={item._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '20px' }}>{item.patientName || item.userId?.name}</td>
                                            <td style={{ padding: '20px' }}>{item.purpose || 'General'}</td>
                                            <td style={{ padding: '20px' }}>{item.manualTime || item.slotId?.startTime}</td>
                                            <td style={{ padding: '20px' }}><StatusBadge status={item.status} /></td>
                                            <td style={{ padding: '20px' }}>
                                                <button onClick={() => handleUpdateStatus(item._id, 'confirmed')}>Confirm</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {showWalkInModal && (
                    <Modal onClose={() => setShowWalkInModal(false)}>
                        <div style={{ background: 'white', padding: '40px', borderRadius: '32px' }}>
                            <h3 style={{ margin: 0, fontWeight: 900 }}>New Booking</h3>
                            <form onSubmit={handleWalkInBooking} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                                <input required placeholder="Name" value={walkInForm.patientName} onChange={e => setWalkInForm({...walkInForm, patientName: e.target.value})} />
                                <input required placeholder="Phone" value={walkInForm.patientPhone} onChange={e => setWalkInForm({...walkInForm, patientPhone: e.target.value})} />
                                <input required type="date" value={walkInForm.manualDate} onChange={e => setWalkInForm({...walkInForm, manualDate: e.target.value})} />
                                <input required type="time" value={walkInForm.manualTime} onChange={e => setWalkInForm({...walkInForm, manualTime: e.target.value})} />
                                <select required value={walkInForm.doctorId} onChange={e => setWalkInForm({...walkInForm, doctorId: e.target.value})}>
                                    <option value="">Select Staff</option>
                                    {doctors.map(dr => <option key={dr._id} value={dr._id}>{dr.name}</option>)}
                                </select>
                                <button type="submit" disabled={bookingLoading}>Confirm Booking</button>
                            </form>
                        </div>
                    </Modal>
                )}

                {showStaffModal && (
                    <Modal onClose={() => setShowStaffModal(false)}>
                        <div style={{ background: 'white', padding: '40px', borderRadius: '32px' }}>
                            <h3 style={{ margin: 0, fontWeight: 900 }}>Add Staff</h3>
                            <form onSubmit={handleOnboardStaff} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                                <input required placeholder="Full Name" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} />
                                <input required type="email" placeholder="Email" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} />
                                <input required type="password" placeholder="Password" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} />
                                <button type="submit">Onboard</button>
                            </form>
                        </div>
                    </Modal>
                )}
                <FloatingSupport />
            </main>
        </div>
    );
};

export default HRDashboard;
