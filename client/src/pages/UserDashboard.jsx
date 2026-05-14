import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Calendar, User, ArrowRight, ClipboardList, Search,
    Video, ExternalLink, X, Bell, Activity, LogOut,
    CheckCircle2, Clock, ShieldCheck, HeartPulse, Sparkles, PhoneCall,
    Bookmark, ChevronRight, ChevronDown, ChevronUp, Edit3, Camera, Building2,
    GraduationCap, Briefcase, Car, Dumbbell, Scale, ArrowLeft,
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
import FloatingSupport from '../components/FloatingSupport';

const StatusBadge = ({ status }) => {
    const map = {
        pending:   { bg: '#FEF3C7', color: '#B76E79', border: '#FDE68A', label: 'Pending Approval' },
        confirmed: { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD', label: 'Confirmed' },
        approved:  { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD', label: 'Confirmed' },
        accepted:  { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD', label: 'Confirmed' },
        ongoing:   { bg: '#EDE9FE', color: '#7C3AED', border: '#DDD6FE', label: 'Session Live' },
        completed: { bg: '#D1FAE5', color: '#4A1C40', border: '#A7F3D0', label: 'Completed' },
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

    if (!user) return null;
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [orgInfo, setOrgInfo] = useState(null);
    const [directoryData, setDirectoryData] = useState([]);
    const [directoryLoading, setDirectoryLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(user?.clientId ? 'home' : 'explore'); 

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
    }, [window.location.search]);

    const [categories, setCategories] = useState([]);
    const [allSectors, setAllSectors] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(user?.sector && user.sector !== 'general' ? user.sector : '');
    const [selectedSubSector, setSelectedSubSector] = useState(user?.subCategory || '');
    const [activeChatApp, setActiveChatApp] = useState(null);
    const [activeRateApp, setActiveRateApp] = useState(null);
    const [activePayApp, setActivePayApp] = useState(null);
    const [heroSlide, setHeroSlide] = useState(0);
    const [isNavVisible, setIsNavVisible] = useState(true);

    const [onboardingSector, setOnboardingSector] = useState(null);
    const [onboardingSubSector, setOnboardingSubSector] = useState('');
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [onboardingLoading, setOnboardingLoading] = useState(false);

    // Freeze / Premium plan state
    const isPlanFrozen = user?.plan?.status === 'expired' || user?.plan?.status === 'frozen' || user?.plan?.status === 'inactive';
    const [showPremiumModal, setShowPremiumModal] = useState(isPlanFrozen);
    const [selectedPlan, setSelectedPlan] = useState(null); // null = plan list, object = show QR

    const premiumPlans = [
        { id: 'yearly',   label: '1 Year',   price: 3999,  badge: 'Best Value 🏆',  color: '#7C3AED', savings: 'Save ₹1,201' },
        { id: 'biannual', label: '6 Months', price: 2400,  badge: 'Popular ⭐',    color: '#4F46E5', savings: 'Save ₹600' },
        { id: 'monthly',  label: '1 Month',  price: 500,   badge: 'Starter 🚀',   color: '#0EA5E9', savings: '' }
    ];

    const config = getSectorConfig(user?.sector || 'general');
    const heroImages = config.userSide?.images || [config.userSide?.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80'];

    // Auto-slide hero images
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroSlide(prev => (prev + 1) % heroImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

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
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <AnimatePresence>
                {isPlanFrozen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ 
                            background: '#FEE2E2', color: '#B91C1C', padding: '12px 40px', 
                            fontSize: '13px', fontWeight: 800, textAlign: 'center', 
                            borderBottom: '1px solid #FECACA', position: 'sticky', top: 0, zIndex: 100
                        }}
                    >
                        ⚠️ Your subscription has expired. Some features are restricted. <button onClick={() => setShowPremiumModal(true)} style={{ color: '#B91C1C', fontWeight: 950, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px' }}>Renew Now</button>
                    </motion.div>
                )}
            </AnimatePresence>



            {/* ====== FREEZE / PREMIUM PLAN POPUP ====== */}
            {showPremiumModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 10000,
                    background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
                }}>
                    {!selectedPlan ? (
                        /* ─── Plan Selection Screen ─── */
                        <div style={{
                            background: 'white', borderRadius: '32px', padding: '48px',
                            maxWidth: '760px', width: '100%', position: 'relative',
                            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto'
                        }}>
                            {/* Freeze Badge */}
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    background: '#FEF2F2', color: '#DC2626', padding: '8px 20px',
                                    borderRadius: '100px', fontWeight: 900, fontSize: '14px', marginBottom: '20px',
                                    border: '1px solid #FECACA'
                                }}>
                                    ⚠️ Account Subscription Expired
                                </div>
                                <h2 style={{ fontSize: '34px', fontWeight: 950, color: '#2D3748', marginBottom: '10px', letterSpacing: '-1px' }}>
                                    Renew Your Premium Plan
                                </h2>
                                <p style={{ color: '#64748B', fontSize: '16px', fontWeight: 600 }}>
                                    Your subscription has expired. Choose a plan below to continue accessing all features.
                                </p>
                            </div>

                            {/* Plans Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                                {premiumPlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan)}
                                        style={{
                                            border: `2.5px solid ${plan.color}30`,
                                            borderRadius: '24px', padding: '32px 24px', textAlign: 'center',
                                            cursor: 'pointer', transition: 'all 0.25s', position: 'relative',
                                            background: `linear-gradient(145deg, ${plan.color}08, ${plan.color}02)`
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = plan.color; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${plan.color}25`; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = plan.color + '30'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        {/* Badge */}
                                        <div style={{
                                            position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                                            background: plan.color, color: '#2D3748', padding: '4px 16px',
                                            borderRadius: '100px', fontSize: '11px', fontWeight: 900, whiteSpace: 'nowrap'
                                        }}>{plan.badge}</div>

                                        <div style={{ fontSize: '15px', fontWeight: 900, color: '#475569', marginBottom: '12px', marginTop: '8px' }}>
                                            {plan.label}
                                        </div>
                                        <div style={{ fontSize: '40px', fontWeight: 950, color: plan.color, lineHeight: 1.1 }}>
                                            ₹{plan.price.toLocaleString()}
                                        </div>
                                        {plan.savings && (
                                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#5A315D', marginTop: '6px' }}>
                                                {plan.savings}
                                            </div>
                                        )}
                                        <div style={{ marginTop: '20px', background: plan.color, color: '#2D3748', padding: '12px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: 900 }}>
                                            Select Plan →
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Features included */}
                            <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '20px 24px', border: '1px solid #E2E8F0' }}>
                                <div style={{ fontWeight: 900, color: '#2D3748', marginBottom: '12px', fontSize: '14px' }}>✅ All Plans Include:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {['Unlimited Bookings', 'Priority Support', 'WhatsApp Alerts', 'Analytics Dashboard', 'Custom Branding', 'Multi-Staff Management'].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>
                                            <span style={{ color: '#5A315D' }}>✓</span> {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ─── QR Code Payment Screen ─── */
                        <div style={{
                            background: 'white', borderRadius: '32px', padding: '48px',
                            maxWidth: '500px', width: '100%', textAlign: 'center',
                            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)'
                        }}>
                            <button
                                onClick={() => setSelectedPlan(null)}
                                style={{ position: 'absolute', top: '0', left: '0', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '8px', fontSize: '14px', fontWeight: 700 }}
                            >
                                ← Back
                            </button>

                            {/* Plan Summary */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: selectedPlan.color + '15', color: selectedPlan.color,
                                padding: '8px 20px', borderRadius: '100px', fontWeight: 900,
                                fontSize: '14px', marginBottom: '24px', border: `1px solid ${selectedPlan.color}30`
                            }}>
                                💎 {selectedPlan.label} Premium — ₹{selectedPlan.price.toLocaleString()}
                            </div>

                            <h3 style={{ fontSize: '26px', fontWeight: 950, color: '#2D3748', marginBottom: '8px' }}>Scan & Pay via PhonePe</h3>
                            <p style={{ color: '#64748B', fontWeight: 600, fontSize: '14px', marginBottom: '28px' }}>Scan the QR code below using any UPI app to complete your payment</p>

                            {/* QR Code */}
                            <div style={{
                                background: 'linear-gradient(145deg, #5B21B6, #7C3AED)',
                                padding: '24px', borderRadius: '24px', marginBottom: '24px',
                                display: 'inline-block', boxShadow: '0 20px 40px rgba(124,58,237,0.35)'
                            }}>
                                <div style={{ background: 'white', padding: '12px', borderRadius: '12px' }}>
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=smartscheduler@ybl%26pn=SmartScheduler%26am=${selectedPlan.price}%26cu=INR%26tn=Premium_${selectedPlan.label.replace(/ /g,'_')}_Plan`}
                                        alt="UPI QR Code"
                                        style={{ width: '220px', height: '220px', display: 'block', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>

                            {/* UPI ID */}
                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 20px', marginBottom: '20px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 900, color: '#718096', letterSpacing: '1px', marginBottom: '4px' }}>UPI ID</div>
                                <div style={{ fontSize: '16px', fontWeight: 900, color: '#2D3748' }}>smartscheduler@ybl</div>
                            </div>

                            {/* Amount */}
                            <div style={{ background: selectedPlan.color + '10', border: `1px solid ${selectedPlan.color}30`, borderRadius: '14px', padding: '14px 20px', marginBottom: '28px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 900, color: '#718096', letterSpacing: '1px', marginBottom: '4px' }}>AMOUNT TO PAY</div>
                                <div style={{ fontSize: '28px', fontWeight: 950, color: selectedPlan.color }}>₹{selectedPlan.price.toLocaleString()}</div>
                                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>for {selectedPlan.label} subscription</div>
                            </div>

                            {/* Steps */}
                            <div style={{ textAlign: 'left', background: '#F0FDF4', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', border: '1px solid #BBF7D0' }}>
                                <div style={{ fontWeight: 900, color: '#4A1C40', fontSize: '13px', marginBottom: '10px' }}>📱 How to Pay:</div>
                                {['Open PhonePe / GPay / Paytm / any UPI app', 'Scan the QR code above', `Pay ₹${selectedPlan.price.toLocaleString()} to activate your plan`, 'Share screenshot with support to activate'].map((step, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '13px', color: '#374151', fontWeight: 600 }}>
                                        <span style={{ color: '#5A315D', fontWeight: 900, flexShrink: 0 }}>{i + 1}.</span> {step}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    alert('Thank you! After payment, please contact support to activate your plan immediately.');
                                    setShowPremiumModal(false);
                                }}
                                style={{
                                    width: '100%', height: '56px', borderRadius: '18px',
                                    background: `linear-gradient(135deg, ${selectedPlan.color}, ${selectedPlan.color}CC)`,
                                    color: '#FFFFFF', border: 'none', fontWeight: 900, fontSize: '16px',
                                    cursor: 'pointer', boxShadow: `0 15px 30px ${selectedPlan.color}40`
                                }}
                            >
                                ✅ I've Completed the Payment
                            </button>
                        </div>
                    )}
                </div>
            )}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .ud-section { padding: 60px 40px; max-width: 1400px; margin: 0 auto; }
                .ud-card { background: var(--bg-light); padding: 32px; border-radius: 24px; border: 1px solid var(--border-color); transition: 0.3s; color: var(--text-dark); }
                .ud-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1); }
                .ud-btn { padding: 14px 28px; border-radius: 16px; font-weight: 800; border: none; cursor: pointer; display: inline-flex; alignItems: center; gap: 10px; transition: 0.3s; font-size: 15px; }
                .ud-btn:hover { transform: scale(1.05); }
                .nav-pill { padding: 10px 20px; border-radius: 99px; font-weight: 800; cursor: pointer; border: none; font-size: 13px; transition: 0.3s; }
                .nav-pill.active { background: #FFFFFF; color: white; }
                .nav-pill:not(.active) { background: var(--bg-main); color: var(--text-gray); border: 1px solid var(--border-color); }
            `}</style>

            <div style={{ flex: 1 }}>
                {/* 1. HERO BANNER with sliding images */}
                <div id="hero-sec" style={{ position:'relative', height:'480px', borderRadius:'0 0 48px 48px', overflow:'hidden', background:'#FFFFFF' }}>
                    {heroImages.map((img, idx) => (
                        <img 
                            key={idx}
                            src={img}
                            alt={`${config.label} slide ${idx + 1}`}
                            style={{ 
                                position:'absolute', inset:0, width:'100%', height:'100%', 
                                objectFit:'cover', opacity: idx === heroSlide ? 0.45 : 0,
                                transition:'opacity 1s ease-in-out'
                            }} 
                        />
                    ))}
                    {/* Gradient overlay */}
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(15,23,42,0.96), rgba(15,23,42,0.2))' }} />
                    
                    {/* Content */}
                    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 80px', color: '#2D3748' }}>
                        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
                            <div style={{ fontSize:'13px', fontWeight:900, color:'#A5B4FC', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'3px' }}>Welcome to {config.label} Portal</div>
                            <h1 style={{ fontSize:'52px', fontWeight:950, marginBottom:'8px', lineHeight:1.1 }}>Hello, {user.name} 👋</h1>
                            {user.sector && (
                                <div style={{ fontSize: '14px', fontWeight: 900, color: '#B76E79', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>
                                    <span className="text-red-highlight">{user.sector}</span> ACCESS PORTAL
                                </div>
                            )}
                            <p style={{ fontSize:'20px', opacity:0.85, fontWeight:600, marginBottom:'32px', maxWidth:'520px' }}>{config.websiteContent?.heroSub || `Book ${config.label.toLowerCase()} appointments instantly.`}</p>
                            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                                <button className="btn-gold" onClick={() => navigate('/book')}><Calendar size={18} /> {config.userSide?.button || 'Book Now'}</button>
                                <button className="ud-btn" onClick={() => document.getElementById('services-sec')?.scrollIntoView({behavior:'smooth'})} style={{ background:'rgba(2, 44, 34, 0.08)', color: 'var(--primary)', border:'1px solid var(--border-color)' }}>View Services</button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Slide dot indicators */}
                    <div style={{ position:'absolute', bottom:'24px', left:'80px', display:'flex', gap:'8px' }}>
                        {heroImages.map((_, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setHeroSlide(idx)}
                                style={{ 
                                    width: idx === heroSlide ? '28px' : '8px', height:'8px',
                                    borderRadius:'4px', border:'none', cursor:'pointer',
                                    background: idx === heroSlide ? '#6366F1' : 'rgba(255,255,255,0.4)',
                                    transition:'all 0.4s ease', padding:0
                                }} 
                            />
                        ))}
                    </div>

                    {/* Slide counter */}
                    <div style={{ position:'absolute', top:'24px', right:'32px', background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)', color: '#2D3748', padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:800 }}>
                        {heroSlide + 1} / {heroImages.length}
                    </div>
                </div>

                {/* 2. QUICK BOOKING BAR */}
                <div className="ud-section" style={{ marginTop:'-40px', position:'relative', zIndex:10 }}>
                    <div style={{ background:'var(--bg-main)', borderRadius:'24px', padding:'24px 32px', boxShadow:'0 20px 40px -12px rgba(0,0,0,0.2)', display:'flex', gap:'16px', alignItems:'center', border:'1px solid var(--border-color)' }}>
                        <Search size={20} style={{ color:'var(--text-gray)' }} />
                        <input placeholder={`Search ${config.label.toLowerCase()} services...`} style={{ flex:1, border:'none', outline:'none', fontSize:'16px', fontWeight:600, background:'transparent', color: 'var(--text-dark)' }} />
                        <select style={{ padding:'12px 20px', borderRadius:'14px', border:'1px solid var(--border-color)', fontWeight:700, fontSize:'14px', background:'var(--bg-light)', color:'var(--text-dark)' }}>
                            <option value="">All Sectors</option>
                            {Array.from(new Set(allSectors.map(s => s.category))).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select style={{ padding:'12px 20px', borderRadius:'14px', border:'1px solid var(--border-color)', fontWeight:700, fontSize:'14px', background:'var(--bg-light)', color:'var(--text-dark)' }}>
                            <option>Any Time</option><option>Today</option><option>Tomorrow</option><option>This Week</option>
                        </select>
                        <button className="btn-gold" onClick={() => navigate('/book')}>Search <ArrowRight size={16} /></button>
                    </div>
                </div>

                {/* 3. POPULAR SERVICES */}
                <div id="services-sec" className="ud-section">
                    <h2 style={{ fontSize:'32px', fontWeight:950, marginBottom:'32px' }}>Popular {config.dashboard?.serviceLabel || 'Services'}</h2>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'24px' }}>
                        {(config.subCategories || ['Consultation','Standard Session','Premium Package']).map((s,i) => (
                            <motion.div key={i} whileHover={{ y:-8 }} className="ud-card" style={{ cursor:'pointer' }} onClick={() => navigate('/book')}>
                                <div style={{ width:'56px', height:'56px', borderRadius:'18px', background:'var(--accent-light)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px' }}><Activity size={24} /></div>
                                <h3 style={{ fontWeight:900, fontSize:'18px', marginBottom:'8px' }}>{s}</h3>
                                <p style={{ color:'var(--text-muted)', fontSize:'14px', marginBottom:'16px' }}>Professional {config.label.toLowerCase()} service with expert care.</p>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                    <span style={{ fontWeight:900, color:'var(--primary)' }}>Book Now</span>
                                    <ArrowRight size={16} color="var(--primary)" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* 4. FEATURED PROFESSIONALS */}
                <div className="ud-section" style={{ background:'#F1F5F9', borderRadius:'40px', margin:'0 20px', padding:'60px 40px' }}>
                    <h2 style={{ fontSize:'32px', fontWeight:950, marginBottom:'32px' }}>Featured {config.dashboard?.employeeRole || 'Professional'}s</h2>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'24px' }}>
                        {(config.dummyStaff || ['https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80']).map((img,i) => (
                            <motion.div key={i} whileHover={{ y:-8 }} className="ud-card" style={{ textAlign:'center', background:'white' }}>
                                <img src={img} alt="" style={{ width:'100px', height:'100px', borderRadius:'50%', objectFit:'cover', margin:'0 auto 16px', display:'block', border:'4px solid #EEF2FF' }} />
                                <h3 style={{ fontWeight:900, fontSize:'17px' }}>{['Dr. Sarah','Dr. Michael','Dr. Emma'][i] || `${config.dashboard?.employeeRole} ${i+1}`}</h3>
                                <div style={{ fontSize:'12px', color:'var(--primary)', fontWeight:800, marginBottom:'8px' }}>Senior {config.dashboard?.employeeRole}</div>
                                <div style={{ display:'flex', justifyContent:'center', gap:'4px', marginBottom:'8px' }}>{[1,2,3,4,5].map(j => <Star key={j} size={14} fill="var(--accent)" color="var(--accent)" />)}</div>
                                <div className="badge-success">Available</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div id="appt-sec" className="ud-section">
                    <h2 style={{ fontSize:'32px', fontWeight:950, marginBottom:'32px' }}>Upcoming Appointments</h2>
                    {appointments.length === 0 ? (
                        <div className="ud-card" style={{ textAlign:'center', padding:'60px' }}>
                            <Calendar size={48} color="#CBD5E1" style={{ marginBottom:'16px' }} />
                            <p style={{ fontWeight:800, color:'#718096' }}>No upcoming appointments. Book one now!</p>
                            <button className="ud-btn" onClick={() => navigate('/book')} style={{ background:'#6366F1', color: '#2D3748', margin:'16px auto 0' }}>Book Appointment</button>
                        </div>
                    ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                            {appointments.slice(0,5).map(app => (
                                <div key={app._id} className="ud-card" style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                                    <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:'#EEF2FF', color:'#6366F1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Calendar size={24} /></div>
                                    <div style={{ flex:1 }}>
                                        <div style={{ fontWeight:900 }}>{app.purpose || app.serviceName || 'Appointment'}</div>
                                        <div style={{ fontSize:'13px', color:'#64748B', fontWeight:600 }}>{app.manualDate || app.date} at {app.manualTime || 'TBD'}</div>
                                    </div>
                                    <StatusBadge status={app.status} />
                                    <button onClick={() => setActiveChatApp(app)} style={{ background:'#F1F5F9', border:'none', padding:'8px 16px', borderRadius:'12px', fontWeight:800, cursor:'pointer', fontSize:'13px' }}>Chat</button>
                                    {app.status === 'pending' && <button onClick={() => handleCancelAppointment(app._id)} style={{ color:'#EF4444', background:'#FEF2F2', border:'none', padding:'8px 16px', borderRadius:'12px', fontWeight:800, cursor:'pointer', fontSize:'13px' }}>Cancel</button>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 6. NOTIFICATIONS */}
                <div className="ud-section">
                    <h2 style={{ fontSize:'32px', fontWeight:950, marginBottom:'32px' }}><Bell size={28} style={{ marginRight:'8px' }} />Notifications</h2>
                    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                        {announcements.length > 0 ? announcements.map((a,i) => (
                            <div key={i} className="ud-card" style={{ display:'flex', gap:'16px', alignItems:'center' }}>
                                <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'#FEF3C7', color:'#B76E79', display:'flex', alignItems:'center', justifyContent:'center' }}><Bell size={18} /></div>
                                <div><div style={{ fontWeight:800 }}>{a.title}</div><div style={{ fontSize:'13px', color:'#64748B' }}>{a.message}</div></div>
                            </div>
                        )) : ['Appointment confirmed ✅','Reminder: Upcoming visit tomorrow','Payment received successfully'].map((n,i) => (
                            <div key={i} className="ud-card" style={{ display:'flex', gap:'16px', alignItems:'center' }}>
                                <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:['#D1FAE5','#FEF3C7','#DBEAFE'][i], color:['#4A1C40','#B76E79','#4A1C40'][i], display:'flex', alignItems:'center', justifyContent:'center' }}><CheckCircle2 size={18} /></div>
                                <div style={{ fontWeight:700, fontSize:'14px' }}>{n}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7. ABOUT SECTOR */}
                <div style={{ margin:'0 20px', background:'#FFFFFF', borderRadius:'40px', padding:'80px 60px', color: '#2D3748' }}>
                    <div style={{ maxWidth:'800px' }}>
                        <div style={{ color:'#A5B4FC', fontWeight:900, fontSize:'13px', letterSpacing:'2px', marginBottom:'16px' }}>ABOUT US</div>
                        <h2 style={{ fontSize:'36px', fontWeight:950, marginBottom:'20px' }}>{config.websiteContent?.aboutTitle || `Trusted ${config.label} Services`}</h2>
                        <p style={{ color:'#718096', lineHeight:1.8, fontSize:'16px', marginBottom:'32px' }}>{config.websiteContent?.aboutText || `We provide trusted ${config.label.toLowerCase()} appointment services with easy scheduling, verified professionals, and secure payments. Your satisfaction is our priority.`}</p>
                        <div style={{ display:'flex', gap:'40px' }}>
                            {[{v:'10+', l:'Years'},{v:'5K+', l:'Customers'},{v:'4.9', l:'Rating'}].map((s,i) => (
                                <div key={i}><div style={{ fontSize:'32px', fontWeight:950 }}>{s.v}</div><div style={{ fontSize:'13px', color:'#64748B', fontWeight:700 }}>{s.l}</div></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div id="reviews-sec" className="ud-section">
                    <h2 style={{ fontSize:'32px', fontWeight:950, marginBottom:'32px' }}>Reviews & Ratings</h2>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'24px' }}>
                        {[{name:'Priya S.',text:'Amazing experience! Booking was seamless.'},{name:'Rahul M.',text:'Very professional service. Highly recommend!'},{name:'Anjali K.',text:'Quick, easy scheduling. Love this platform!'}].map((r,i) => (
                            <div key={i} className="ud-card">
                                <div style={{ display:'flex', gap:'4px', marginBottom:'12px' }}>{[1,2,3,4,5].map(j => <Star key={j} size={14} fill="var(--accent)" color="var(--accent)" />)}</div>
                                <p style={{ fontStyle:'italic', color:'var(--text-muted)', marginBottom:'16px', lineHeight:1.6 }}>"{r.text}"</p>
                                <div style={{ fontWeight:900, fontSize:'14px' }}>— {r.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
 
                <div style={{ margin:'0 20px', background:'var(--primary)', borderRadius:'40px', padding:'80px', textAlign:'center', color: 'white' }}>
                    <h2 style={{ fontSize:'40px', fontWeight:950, marginBottom:'16px' }}>Ready to Book?</h2>
                    <p style={{ fontSize:'18px', opacity:0.9, marginBottom:'32px' }}>Schedule your next {config.label.toLowerCase()} appointment in seconds.</p>
                    <button className="btn-gold" onClick={() => navigate('/book')} style={{ fontSize:'18px', padding:'18px 48px' }}>Book Appointment Now <ArrowRight size={20} /></button>
                </div>
                </div>

            <ChatWidget role="user" />
            {activeChatApp && <AppointmentChatModal appointment={activeChatApp} onClose={() => setActiveChatApp(null)} />}
            {activeRateApp && <RatingModal appointment={activeRateApp} onClose={() => setActiveRateApp(null)} onSuccess={fetchAppointments} />}
            {activePayApp && <PaymentModal appointment={activePayApp} onClose={() => setActivePayApp(null)} onSuccess={fetchAppointments} />}
            <FloatingSupport />
        </div>
    );
};

export default UserDashboard;
