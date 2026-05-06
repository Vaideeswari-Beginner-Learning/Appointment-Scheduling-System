import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Calendar, User, ArrowRight, ClipboardList,
    Video, ExternalLink, X, Bell, Activity, LogOut,
    CheckCircle2, Clock, ShieldCheck, HeartPulse, Sparkles, PhoneCall,
    Bookmark, ChevronRight, ChevronDown, Edit3, Camera, Building2,
    GraduationCap, Hospital, Briefcase, Car, Dumbbell, Scale, ArrowLeft,
    AlertCircle, Phone, HelpCircle, MapPin, MessageSquare, Star, CreditCard,
    Scissors, Home, Wrench, Laptop, Cpu, Music
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Booking from './Booking';
import { API_BASE_URL } from '../config/api';
import { getSectorConfig } from '../config/sectorConfig';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';
import AppointmentChatModal from '../components/AppointmentChatModal';
import RatingModal from '../components/RatingModal';
import PaymentModal from '../components/PaymentModal';

const StatusBadge = ({ status }) => {
    const map = {
        pending:   { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A', label: 'Pending Approval' },
        confirmed: { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD', label: 'Confirmed' },
        approved:  { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD', label: 'Confirmed' },
        accepted:  { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD', label: 'Confirmed' },
        ongoing:   { bg: '#EDE9FE', color: '#7C3AED', border: '#DDD6FE', label: 'Session Live' },
        completed: { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0', label: 'Completed' },
        rejected:  { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA', label: 'Cancelled' },
    };
    const s = map[status] || { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB', label: status };
    return (
        <span style={{ 
            padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 900, 
            textTransform: 'uppercase', background: s.bg, color: s.color, 
            border: `1px solid ${s.border}`, display: 'inline-flex', alignItems: 'center', gap: '4px' 
        }}>
            {s.label}
        </span>
    );
};

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [orgInfo, setOrgInfo] = useState(null);
    const [directoryData, setDirectoryData] = useState([]);
    const [directoryLoading, setDirectoryLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(user?.clientId ? 'home' : 'explore'); 
    const [categories, setCategories] = useState([]);
    const [allSectors, setAllSectors] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(user?.sector && user.sector !== 'general' ? user.sector : '');
    const [selectedSubSector, setSelectedSubSector] = useState(user?.subCategory || '');
    const [activeChatApp, setActiveChatApp] = useState(null);
    const [activeRateApp, setActiveRateApp] = useState(null);
    const [activePayApp, setActivePayApp] = useState(null);

    const [onboardingSector, setOnboardingSector] = useState(null);
    const [onboardingSubSector, setOnboardingSubSector] = useState('');
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [onboardingLoading, setOnboardingLoading] = useState(false);

    const config = getSectorConfig(user?.sector || 'general');

    useEffect(() => {
        if (user) {
            fetchAppointments();
            fetchAnnouncements();
            fetchDirectory();
            fetchSectors();
            if (user.clientId) fetchOrganization(user.clientId);
        } else {
            navigate('/login');
        }
    }, [user]);

    const fetchSectors = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/sectors`);
            setAllSectors(res.data);
            const uniqueCats = [...new Set(res.data.map(s => s.category))];
            setCategories(uniqueCats);
        } catch (err) { console.error(err); }
    };

    const fetchDirectory = async () => {
        try {
            setDirectoryLoading(true);
            const res = await axios.get(`${API_BASE_URL}/users/public/directory`);
            setDirectoryData(res.data);
        } catch (err) { console.error(err); } finally { setDirectoryLoading(false); }
    };

    const fetchOrganization = async (cid) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/users/tenant-info/${cid}`, { headers: { 'x-auth-token': token } });
            setOrgInfo(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/appointments/my-appointments`, { headers: { 'x-auth-token': token } });
            setAppointments(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/announcements`, { headers: { 'x-auth-token': token } });
            setAnnouncements(res.data);
        } catch (err) { console.error(err); }
    };

    const handleCancelAppointment = async (id) => {
        if (!window.confirm('Cancel this booking?')) return;
        try {
            await axios.patch(`${API_BASE_URL}/appointments/${id}/status`, { status: 'cancelled' }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
            fetchAppointments();
        } catch (err) { alert('Cancel failed'); }
    };

    const handleCompleteOnboarding = async () => {
        setOnboardingLoading(true);
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`${API_BASE_URL}/users/${user._id || user.id}`, {
                sector: onboardingSector,
                subCategory: onboardingSubSector
            }, { 
                headers: { 'x-auth-token': token } 
            });
            setOnboardingStep(3);
            setTimeout(() => {
                window.location.reload(); 
            }, 2000);
        } catch (err) {
            alert('Selection failed');
        } finally {
            setOnboardingLoading(false);
        }
    };

    const QuickAction = ({ icon: Icon, label, color, onClick }) => (
        <button onClick={onClick} className="quick-action-card">
            <div className="icon-box" style={{ background: color + '15', color }}>
                <Icon size={24} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '14px' }}>{label}</span>
        </button>
    );

    const FeatureItem = ({ icon: Icon, title, desc }) => (
        <div className="feature-item">
            <div className="feature-icon"><Icon size={20} /></div>
            <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 900 }}>{title}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{desc}</p>
            </div>
        </div>
    );

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {(!user.sector || user.sector === 'general' || user.sector === 'User') && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: '24px' }}>
                    <div className="onboarding-modal" style={{ background: 'white', width: '100%', maxWidth: onboardingStep === 1 ? '900px' : '500px', borderRadius: '32px', padding: '48px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                                <div style={{ background: '#EEF2FF', padding: '16px', borderRadius: '24px', color: '#4F46E5' }}>
                                    <User size={32} />
                                </div>
                            </div>
                            {onboardingStep === 1 && <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Welcome!</h2>}
                            {onboardingStep === 2 && <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Refine your interests</h2>}
                            {onboardingStep === 3 && <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#10B981', marginBottom: '8px' }}>Setup Complete!</h2>}
                            
                            <p style={{ color: '#64748B', fontWeight: 600, fontSize: '16px' }}>
                                {onboardingStep === 1 && "What type of services are you looking for?"}
                                {onboardingStep === 2 && `Which specific type of ${onboardingSector} services?`}
                                {onboardingStep === 3 && "We are tailoring your dashboard experience."}
                            </p>
                        </div>

                        {onboardingStep === 1 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                {Array.from(new Set(allSectors.map(s => s.category))).map(cat => {
                                    const iconName = allSectors.find(s => s.category === cat)?.icon;
                                    
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
                                            default: return '#4F46E5';
                                        }
                                    };
                                    const iconColor = getIconColor(iconName);

                                    let iconComponent = <Building2 size={32} color={iconColor} />;
                                    if (iconName === 'Heart') iconComponent = <HeartPulse size={32} color={iconColor} />;
                                    else if (iconName === 'Sparkles') iconComponent = <Sparkles size={32} color={iconColor} />;
                                    else if (iconName === 'Home') iconComponent = <Home size={32} color={iconColor} />;
                                    else if (iconName === 'Car') iconComponent = <Car size={32} color={iconColor} />;
                                    else if (iconName === 'Dumbbell') iconComponent = <Dumbbell size={32} color={iconColor} />;
                                    else if (iconName === 'GraduationCap') iconComponent = <GraduationCap size={32} color={iconColor} />;
                                    else if (iconName === 'Laptop') iconComponent = <Laptop size={32} color={iconColor} />;
                                    else if (iconName === 'Cpu') iconComponent = <Cpu size={32} color={iconColor} />;
                                    else if (iconName === 'Wrench') iconComponent = <Wrench size={32} color={iconColor} />;
                                    else if (iconName === 'Scale') iconComponent = <Scale size={32} color={iconColor} />;
                                    else if (iconName === 'Camera') iconComponent = <Camera size={32} color={iconColor} />;
                                    else if (iconName === 'Calendar') iconComponent = <Calendar size={32} color={iconColor} />;
                                    else if (iconName === 'Briefcase') iconComponent = <Briefcase size={32} color={iconColor} />;
                                    else if (iconName === 'Music') iconComponent = <Music size={32} color={iconColor} />;
                                    else if (iconName === 'Hospital') iconComponent = <Hospital size={32} color={iconColor} />;
                                    else if (iconName === 'Scissors') iconComponent = <Scissors size={32} color={iconColor} />;

                                    return (
                                        <div 
                                            key={cat}
                                            onClick={() => { setOnboardingSector(cat); setOnboardingStep(2); }}
                                            style={{ 
                                                background: 'white', padding: '24px', borderRadius: '20px', border: '2px solid #E2E8F0', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <div style={{ fontSize: '32px' }}>{iconComponent}</div>
                                            <div style={{ fontWeight: 900, color: '#0F172A' }}>{cat}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {onboardingStep === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <select 
                                    style={{ height: '60px', fontSize: '16px', fontWeight: 700, padding: '0 20px', borderRadius: '16px', border: '2px solid #E2E8F0', outline: 'none' }}
                                    value={onboardingSubSector}
                                    onChange={e => setOnboardingSubSector(e.target.value)}
                                >
                                    <option value="">Select specific type...</option>
                                    {allSectors.filter(s => s.category === onboardingSector).map(s => (
                                        <option key={s._id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={handleCompleteOnboarding}
                                    disabled={!onboardingSubSector || onboardingLoading}
                                    style={{ width: '100%', padding: '16px', borderRadius: '16px', background: !onboardingSubSector ? '#CBD5E1' : '#4F46E5', color: 'white', fontWeight: 900, border: 'none', cursor: !onboardingSubSector ? 'not-allowed' : 'pointer' }}
                                >
                                    {onboardingLoading ? 'Saving...' : 'Complete Setup'}
                                </button>
                            </div>
                        )}

                        {onboardingStep === 3 && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
                                <p style={{ fontWeight: 800, color: '#4F46E5' }}>Configuring sector-specific themes...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <style>{`
                .hero-banner { position: relative; height: 350px; border-radius: 30px; overflow: hidden; margin: 20px 40px; background: #0F172A; }
                .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(15,23,42,0.9), transparent); display: flex; flex-direction: column; justify-content: center; padding: 0 60px; color: white; }
                .quick-actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 0 40px; margin-bottom: 40px; }
                .quick-action-card { background: white; border-radius: 20px; padding: 25px; border: 1px solid #E2E8F0; display: flex; flex-direction: column; align-items: center; gap: 15px; cursor: pointer; transition: 0.3s; }
                .quick-action-card:hover { transform: translateY(-5px); border-color: #3B82F6; }
                .icon-box { width: 50px; height: 50px; border-radius: 15px; display: flex; alignItems: center; justifyContent: center; }
                .nav-pill { padding: 10px 20px; border-radius: 99px; font-weight: 800; cursor: pointer; border: none; font-size: 13px; transition: 0.3s; }
                .nav-pill.active { background: #0F172A; color: white; }
                .nav-pill:not(.active) { background: white; color: #64748B; border: 1px solid #E2E8F0; }
                .booking-card { background: white; border-radius: 20px; border: 1px solid #E2E8F0; padding: 20px; display: flex; gap: 20px; align-items: center; }
                .feature-item { display: flex; gap: 12px; }
                .feature-icon { color: #3B82F6; background: #EFF6FF; padding: 10px; border-radius: 12px; }
            `}</style>

            <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {['explore', 'home', 'bookings', 'profile'].map(tab => (
                        <button key={tab} className={`nav-pill ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize' }}>{tab}</button>
                    ))}
                </div>
                <button onClick={logout} style={{ color: '#EF4444', fontWeight: 800, border: 'none', background: 'transparent', cursor: 'pointer' }}>Sign Out</button>
            </header>

            <main style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {activeTab === 'home' && (
                    <>
                        <div className="hero-banner" style={{ 
                            backgroundImage: `url(${config.userSide?.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                            <div className="hero-overlay">
                                <h1 style={{ fontSize: '42px', fontWeight: 950 }}>Welcome back, {user.name}</h1>
                                <p style={{ fontSize: '20px', opacity: 0.9, fontWeight: 700 }}>Manage your {config.label} appointments effortlessly.</p>
                            </div>
                        </div>
                        <div className="quick-actions-grid">
                            <QuickAction icon={Calendar} label="Book Now" color="#3B82F6" onClick={() => navigate('/booking')} />
                            <QuickAction icon={ClipboardList} label="My Ledger" color="#8B5CF6" onClick={() => setActiveTab('bookings')} />
                            <QuickAction icon={Building2} label="Directory" color="#10B981" onClick={() => setActiveTab('explore')} />
                            <QuickAction icon={PhoneCall} label="Support" color="#F59E0B" onClick={() => alert('Contacting support...')} />
                        </div>

                        {/* 🔖 BOOKMARKED ORGANIZATIONS */}
                        {JSON.parse(localStorage.getItem('bookmarks') || '[]').length > 0 && (
                            <div style={{ padding: '0 40px', marginBottom: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Bookmark size={24} fill="#4F46E5" color="#4F46E5" /> Your Bookmarks
                                    </h2>
                                    <button onClick={() => setActiveTab('explore')} style={{ background: 'transparent', border: 'none', color: '#4F46E5', fontWeight: 800, cursor: 'pointer' }}>View All</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                    {directoryData.filter(org => JSON.parse(localStorage.getItem('bookmarks') || '[]').includes(org._id)).map(org => (
                                        <motion.div 
                                            key={org._id} 
                                            whileHover={{ y: -5 }}
                                            style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 900, color: '#0F172A' }}>{org.organizationName || org.name}</div>
                                                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{org.sector}</div>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/org/${org._id}`)}
                                                style={{ background: '#F1F5F9', border: 'none', padding: '10px 16px', borderRadius: '12px', color: '#4F46E5', fontWeight: 800, cursor: 'pointer' }}
                                            >
                                                Visit
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'explore' && (
                    <div style={{ padding: '0 40px' }}>
                        <h2 style={{ fontWeight: 900, marginBottom: '20px' }}>Discover Organizations</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {directoryData.map(org => (
                                <div key={org._id} className="booking-card">
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900, fontSize: '18px' }}>{org.organizationName || org.name}</div>
                                        <div style={{ fontSize: '13px', color: '#64748B' }}>{org.sector} - {org.subCategory}</div>
                                    </div>
                                    <button onClick={() => navigate(`/org/${org._id}`)}>Visit Profile</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div style={{ padding: '0 40px' }}>
                        <h2 style={{ fontWeight: 900, marginBottom: '20px' }}>Your Appointments</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {appointments.map(app => (
                                <div key={app._id} className="booking-card">
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800 }}>{app.purpose || 'Service'}</div>
                                        <div style={{ fontSize: '13px', color: '#64748B' }}>{app.manualDate || app.date} at {app.manualTime || 'TBD'}</div>
                                    </div>
                                    <StatusBadge status={app.status} />
                                    <button onClick={() => setActiveChatApp(app)}>Chat</button>
                                    <button onClick={() => handleCancelAppointment(app._id)} style={{ color: '#EF4444' }}>Cancel</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <ChatWidget role="user" />
            {activeChatApp && <AppointmentChatModal appointment={activeChatApp} onClose={() => setActiveChatApp(null)} />}
            {activeRateApp && <RatingModal appointment={activeRateApp} onClose={() => setActiveRateApp(null)} onSuccess={fetchAppointments} />}
            {activePayApp && <PaymentModal appointment={activePayApp} onClose={() => setActivePayApp(null)} onSuccess={fetchAppointments} />}
        </div>
    );
};

export default UserDashboard;
