import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Building2, CheckCircle2, Clock, Activity, User, 
    X, MapPin, Phone, HelpCircle, ArrowLeft, Heart, Share2, Star, Bookmark,
    ShieldCheck, MessageSquare, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import { getSectorConfig } from '../config/sectorConfig';
import RegisterModal from '../components/RegisterModal';

const MiniWebsite = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isOwner = user && (user._id === id || user.adminId === id);
    const [org, setOrg] = useState(null);
    const [staff, setStaff] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('home');
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // Fetch Organization Basic Info using Public Endpoint
                const orgRes = await axios.get(`${API_BASE_URL}/users/public/tenant-info/${id}`);
                console.log('DEBUG_MINI_WEBSITE_ORG:', orgRes.data);
                setOrg(orgRes.data);

                // Fetch Staff
                const staffRes = await axios.get(`${API_BASE_URL}/users/public/staff/${id}`);
                setStaff(staffRes.data);

                // Fetch Services
                const servRes = await axios.get(`${API_BASE_URL}/services/public/${id}`);
                setServices(servRes.data);
            } catch (err) {
                console.error('Failed to fetch mini website details', err);
                setError('Organization not found or profile is private.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1.s linear infinite', margin: '0 auto 20px' }}></div>
                    <p style={{ fontWeight: 800, color: '#64748B' }}>Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !org) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '20px' }}>
                <div style={{ textAlign: 'center', background: 'white', padding: '48px', borderRadius: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', maxWidth: '500px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#EF4444' }}>
                        <X size={40} />
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '12px' }}>Profile Unavailable</h2>
                    <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '32px' }}>{error || 'This organization does not have a public profile yet.'}</p>
                    <button 
                        onClick={() => {
                            if (user) navigate('/dashboard');
                            else setShowRegisterModal(true);
                        }} 
                        className="btn btn-primary" 
                        style={{ width: '100%', height: '56px', borderRadius: '16px', background: '#4F46E5', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                    >
                        {user ? 'Go to Dashboard' : 'Sign Up to Explore'}
                    </button>
                </div>
            </div>
        );
    }

    const rawSector = org.organizationSector || org.sector || org.category || 'general';
    const config = getSectorConfig(rawSector);
    
    // Sector-specific hero & about images from sectorConfig
    const sectorHeroImage = config.userSide?.image || config.userSide?.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
    const sectorAboutImage = config.userSide?.secondaryImage || config.userSide?.images?.[1] || sectorHeroImage;

    const getSectorColor = (name) => {
        const n = name?.toLowerCase() || '';
        if (n.includes('health') || n.includes('hospital') || n.includes('clinic')) return '#EF4444';
        if (n.includes('beauty') || n.includes('salon')) return '#EC4899';
        if (n.includes('automotive') || n.includes('car')) return '#3B82F6';
        if (n.includes('wellness') || n.includes('fitness') || n.includes('gym')) return '#10B981';
        if (n.includes('edu') || n.includes('coach') || n.includes('school')) return '#8B5CF6';
        if (n.includes('tech') || n.includes('it')) return '#6366F1';
        if (n.includes('legal') || n.includes('law')) return '#1E293B';
        if (n.includes('event') || n.includes('photo') || n.includes('wedding')) return '#F43F5E';
        if (n.includes('home') || n.includes('repair')) return '#F59E0B';
        if (n.includes('hotel') || n.includes('hospitality') || n.includes('resort')) return '#0EA5E9';
        if (n.includes('retail') || n.includes('shop')) return '#F97316';
        if (n.includes('consult')) return '#6366F1';
        return '#4F46E5';
    };
    const primaryColor = getSectorColor(rawSector);

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', scrollBehavior: 'smooth' }}>
            {/* 🔝 PREMIUM NAVIGATION */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #E2E8F0', padding: '12px 40px' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button 
                            onClick={() => {
                                if (user) navigate('/dashboard');
                                else setShowRegisterModal(true);
                            }} 
                            style={{ background: '#F1F5F9', border: 'none', padding: '10px', borderRadius: '14px', cursor: 'pointer', color: '#475569', transition: '0.3s' }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {org.organizationLogo ? 
                                <img src={org.organizationLogo} alt="" style={{ height: '40px', width: '40px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} /> : 
                                <div style={{ background: primaryColor + '10', color: primaryColor, padding: '10px', borderRadius: '12px' }}><Building2 size={24} /></div>
                            }
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{org.organizationName || org.name}</div>
                                    {org.plan?.type === 'paid' && (
                                        <div title="Verified Premium Partner" style={{ background: '#6366F1', color: 'white', padding: '2px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ShieldCheck size={12} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', marginTop: '4px' }}>{config.label} Partner</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '40px', fontWeight: 700, color: '#64748B', fontSize: '15px' }}>
                        {['Home', 'About', 'Team', 'Services'].map(item => (
                            <span 
                                key={item}
                                style={{ cursor: 'pointer', transition: '0.3s' }} 
                                onClick={() => document.getElementById(item.toLowerCase()).scrollIntoView({ behavior: 'smooth' })}
                                onMouseOver={e => e.currentTarget.style.color = primaryColor}
                                onMouseOut={e => e.currentTarget.style.color = '#64748B'}
                            >
                                {item}
                            </span>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={() => {
                                const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
                                if (!bookmarks.includes(id)) {
                                    localStorage.setItem('bookmarks', JSON.stringify([...bookmarks, id]));
                                    alert('Added to your bookmarks!');
                                } else {
                                    alert('Already in your bookmarks.');
                                }
                            }}
                            style={{ background: 'white', border: '1px solid #E2E8F0', padding: '12px 24px', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s' }}
                        >
                            <Bookmark size={18} /> <span style={{ fontSize: '14px' }}>Bookmark</span>
                        </button>
                        <button style={{ background: 'white', border: '1px solid #E2E8F0', padding: '12px 24px', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s' }}>
                            <Share2 size={18} /> <span style={{ fontSize: '14px' }}>Share</span>
                        </button>
                        {!isOwner && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    onClick={() => alert('Opening consultation chat...')}
                                    style={{ 
                                        background: '#F1F5F9', color: '#475569', border: 'none', padding: '12px 20px', 
                                        borderRadius: '16px', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px'
                                    }}
                                >
                                    <MessageSquare size={18} /> Chat
                                </button>
                                <button 
                                    onClick={() => navigate(`/book?clientId=${id}`)} 
                                    style={{ 
                                        background: primaryColor, color: 'white', border: 'none', padding: '12px 32px', 
                                        borderRadius: '16px', fontWeight: 900, fontSize: '14px', cursor: 'pointer',
                                        boxShadow: `0 10px 25px -5px ${primaryColor}40`
                                    }}
                                >
                                    Book Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main id="home" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
                {/* 🚀 MODERN HERO SECTION */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', marginBottom: '80px', alignItems: 'center' }}>
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ paddingRight: '40px' }}
                    >
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: primaryColor + '10', color: primaryColor, padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 900, marginBottom: '24px', border: `1px solid ${primaryColor}20` }}>
                            <ShieldCheck size={16} /> CERTIFIED {config.label.toUpperCase()} PROVIDER
                        </div>
                        <h1 style={{ fontSize: '72px', fontWeight: 950, color: '#0F172A', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-3px' }}>
                            {config.websiteContent?.heroTitle || `Premium ${config.label} Services`}
                        </h1>
                        <p style={{ fontSize: '22px', color: '#475569', lineHeight: 1.6, marginBottom: '48px', maxWidth: '550px', fontWeight: 500 }}>
                            {config.websiteContent?.heroSub || `Experience the next level of ${config.label.toLowerCase()} with our expert team and state-of-the-art facilities.`}
                        </p>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button 
                                onClick={() => navigate(`/book?clientId=${id}`)}
                                style={{ 
                                    background: primaryColor, color: 'white', border: 'none', height: '72px', 
                                    padding: '0 48px', borderRadius: '24px', fontSize: '18px', fontWeight: 900, 
                                    cursor: 'pointer', boxShadow: `0 20px 40px -10px ${primaryColor}50`,
                                    display: 'flex', alignItems: 'center', gap: '12px'
                                }}
                            >
                                Get Started <ArrowRight size={20} />
                            </button>
                            <button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'white', color: '#0F172A', border: '1px solid #E2E8F0', height: '72px', padding: '0 32px', borderRadius: '24px', fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}>
                                View Services
                            </button>
                        </div>
                        
                        <div style={{ marginTop: '56px', display: 'flex', alignItems: 'center', gap: '32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A' }}>5k+</span>
                                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 700 }}>Happy Clients</span>
                            </div>
                            <div style={{ width: '1px', height: '40px', background: '#E2E8F0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A' }}>12+</span>
                                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 700 }}>Specialists</span>
                            </div>
                            <div style={{ width: '1px', height: '40px', background: '#E2E8F0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', color: '#F59E0B', gap: '2px', marginBottom: '4px' }}>
                                    {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#F59E0B" />)}
                                </div>
                                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 700 }}>Avg Rating</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ position: 'relative' }}
                    >
                        <div style={{ 
                            position: 'absolute', top: '20px', left: '-40px', zIndex: 2, 
                            background: 'white', padding: '24px', borderRadius: '24px', 
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #F1F5F9' 
                        }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ background: '#F0FDF4', color: '#10B981', padding: '12px', borderRadius: '16px' }}><CheckCircle2 size={24} /></div>
                                <div>
                                    <div style={{ fontWeight: 900, fontSize: '14px', color: '#0F172A' }}>Slots Available Today</div>
                                    <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Book in 60 seconds</div>
                                </div>
                            </div>
                        </div>
                        <img 
                            src={org.organizationImages?.split(',')[0] || sectorHeroImage} 
                            style={{ width: '100%', height: '600px', objectFit: 'cover', borderRadius: '60px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.2)' }} 
                            alt={`${config.label} - ${org.organizationName || org.name}`} 
                        />
                    </motion.div>
                </div>

                {/* ✨ ABOUT SECTION */}
                <div id="about" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginBottom: '120px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <img 
                            src={org.organizationImages?.split(',')[1] || sectorAboutImage} 
                            style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '40px' }} 
                            alt={`About ${config.label}`} 
                        />
                        <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', width: '250px', background: primaryColor, padding: '40px', borderRadius: '30px', color: 'white', boxShadow: `0 20px 40px ${primaryColor}40` }}>
                            <div style={{ fontSize: '48px', fontWeight: 950, lineHeight: 1 }}>10+</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px', opacity: 0.9 }}>Years of Industry Excellence</div>
                        </div>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '48px', fontWeight: 900, color: '#0F172A', marginBottom: '32px', letterSpacing: '-1.5px' }}>
                            {config.websiteContent?.aboutTitle || `Modern ${config.label} for Everyone`}
                        </h2>
                        <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#475569', marginBottom: '40px' }}>
                            {org.organizationStory || org.organizationPurpose || "We set the standard for quality and professional integrity. Our facilities are designed to provide maximum comfort while our team ensures every client receives personalized attention and world-class results."}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {[
                                { icon: ShieldCheck, title: 'Secure & Safe', desc: 'Fully compliant protocols' },
                                { icon: Clock, title: 'Flexible Slots', desc: 'Book at your convenience' },
                                { icon: Star, title: 'Premium Quality', desc: 'Top-rated professional team' },
                                { icon: Heart, title: 'Client Care', desc: 'Personalized experience' }
                            ].map((feat, i) => (
                                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ color: primaryColor }}><feat.icon size={24} /></div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>{feat.title}</div>
                                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>{feat.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 👨‍💼 TEAM SECTION */}
                <section id="team" style={{ marginBottom: '120px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <div style={{ color: primaryColor, fontWeight: 900, fontSize: '14px', letterSpacing: '2px', marginBottom: '16px' }}>EXPERTS AT YOUR SERVICE</div>
                        <h2 style={{ fontSize: '56px', fontWeight: 900, color: '#0F172A', letterSpacing: '-2px' }}>Meet Our {config.dashboard.employeeRole}s</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                        {(staff.length > 0 ? staff : [
                            { _id: 'dummy1', name: `Sarah Jenkins`, specialty: `Senior ${config.dashboard.employeeRole}`, gender: 'female', avatar: config.dummyStaff?.[0] || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80', dummy: true },
                            { _id: 'dummy2', name: `Michael Chen`, specialty: `Lead ${config.dashboard.employeeRole}`, gender: 'male', avatar: config.dummyStaff?.[1] || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80', dummy: true },
                            { _id: 'dummy3', name: `Emma Thompson`, specialty: `Expert ${config.dashboard.employeeRole}`, gender: 'female', avatar: config.dummyStaff?.[2] || 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=400&q=80', dummy: true }
                        ]).map(member => {
                            // Logic for gender-based default avatar
                            const defaultAvatar = member.gender === 'female' 
                                ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' // Professional Woman
                                : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'; // Professional Man

                            // Logic for Role Label
                            const displayRole = member.specialty || (
                                member.role === 'hr' ? 'HR Manager' : 
                                member.role === 'doctor' ? 'Medical Specialist' :
                                member.role === 'interviewer' ? 'Senior Interviewer' :
                                member.role === 'employee' ? 'Team Member' :
                                member.role?.toUpperCase() || config.dashboard.employeeRole
                            );

                            return (
                                <motion.div 
                                    whileHover={{ y: -15 }}
                                    key={member._id}
                                    style={{ background: 'white', padding: '40px', borderRadius: '40px', border: '1px solid #E2E8F0', textAlign: 'center', transition: '0.3s', position: 'relative' }}
                                >
                                    {member.dummy && org.plan?.type !== 'paid' && <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', color: '#64748B', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>Demo Profile</div>}
                                    <div style={{ width: '160px', height: '160px', margin: '0 auto 32px', borderRadius: '50px', overflow: 'hidden', border: `4px solid ${primaryColor}10`, padding: '8px' }}>
                                        <img src={member.avatar || defaultAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '40px' }} alt={member.name} />
                                    </div>
                                    <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>{member.name}</h3>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', marginBottom: '24px' }}>{displayRole}</div>
                                    <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, marginBottom: '32px' }}>{member.bio || `Certified expert with extensive training and a commitment to delivering exceptional results.`}</p>
                                    <button onClick={() => navigate(`/book?clientId=${id}`)} style={{ width: '100%', height: '56px', borderRadius: '18px', border: `2px solid ${primaryColor}20`, background: 'transparent', color: primaryColor, fontWeight: 900, cursor: 'pointer', transition: '0.3s' }} onMouseOver={e => { e.currentTarget.style.background = primaryColor; e.currentTarget.style.color = 'white'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = primaryColor; }}>View Schedule</button>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* 💼 SERVICES SECTION */}
                <section id="services" style={{ marginBottom: '120px' }}>
                    <div style={{ background: '#0F172A', borderRadius: '60px', padding: '100px 60px', color: 'white' }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <h2 style={{ fontSize: '56px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-2px' }}>Professional Catalog</h2>
                            <p style={{ fontSize: '18px', color: '#94A3B8', maxWidth: '600px', margin: '0 auto' }}>Select the perfect service for your needs. All services are performed by our certified team.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
                            {(services.length > 0 ? services : [
                                { _id: 'dserv1', name: `Premium ${config.label} Consultation`, duration: 45, price: 1500, description: `Comprehensive evaluation and tailored strategy.`, dummy: true },
                                { _id: 'dserv2', name: `Standard Session`, duration: 30, price: 800, description: `Routine service with our expert ${config.dashboard.employeeRole}s.`, dummy: true },
                                { _id: 'dserv3', name: `Advanced Treatment`, duration: 60, price: 2500, description: `Specialized approach using our state-of-the-art facilities.`, dummy: true }
                            ]).map(srv => (
                                <div key={srv._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '40px', borderRadius: '40px', position: 'relative', overflow: 'hidden' }}>
                                    {srv.dummy && org.plan?.type !== 'paid' && <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.1)', color: '#94A3B8', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>Demo Service</div>}
                                    <div style={{ position: 'absolute', top: 0, right: 0, background: primaryColor, color: 'white', padding: '8px 24px', fontSize: '12px', fontWeight: 900, borderBottomLeftRadius: '20px' }}>Rs. {srv.price}</div>
                                    <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px' }}>{srv.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '13px', fontWeight: 700, marginBottom: '24px' }}>
                                        <Clock size={16} /> {srv.duration} Minutes Session
                                    </div>
                                    <p style={{ color: '#94A3B8', lineHeight: 1.6, marginBottom: '32px', fontSize: '15px' }}>{srv.description || 'Our signature high-performance service tailored to deliver maximum value and professional results.'}</p>
                                    <button onClick={() => navigate(`/book?clientId=${id}`)} style={{ width: '100%', height: '60px', borderRadius: '20px', background: 'white', color: '#0F172A', border: 'none', fontWeight: 900, fontSize: '16px', cursor: 'pointer', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>Book This Service</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 💬 TESTIMONIALS */}
                <section style={{ marginBottom: '120px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '80px', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '48px', fontWeight: 900, color: '#0F172A', marginBottom: '24px', letterSpacing: '-1.5px' }}>What Our Clients Are Saying</h2>
                            <p style={{ fontSize: '18px', color: '#64748B', lineHeight: 1.6, marginBottom: '40px' }}>Join over 5,000+ satisfied clients who trust our {config.label.toLowerCase()} services every month.</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A' }}>4.9</div>
                                <div>
                                    <div style={{ display: 'flex', color: '#F59E0B' }}>
                                        {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#F59E0B" />)}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 700, marginTop: '4px' }}>Average User Rating</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {[
                                { name: 'Priya S.', text: 'Absolutely professional. The booking process was seamless and the service exceeded my expectations.' },
                                { name: 'Rahul M.', text: 'The best in the industry. Highly recommended for anyone looking for quality and reliability.' },
                                { name: 'Anjali K.', text: 'Prompt and expert service. The staff is very courteous and knowledgeable. 10/10 experience.' },
                                { name: 'Vikram D.', text: 'Finally a proper scheduling system that works. Saved me so much time. Great work!' }
                            ].map((t, i) => (
                                <div key={i} style={{ background: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', color: '#F59E0B', marginBottom: '16px' }}>
                                        {[1,2,3,4,5].map(j => <Star key={j} size={12} fill="#F59E0B" />)}
                                    </div>
                                    <p style={{ fontSize: '15px', fontStyle: 'italic', color: '#475569', marginBottom: '20px', lineHeight: 1.6 }}>"{t.text}"</p>
                                    <div style={{ fontWeight: 900, fontSize: '14px', color: '#0F172A' }}>- {t.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 📍 CONTACT SECTION */}
                <div id="contact" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'white', borderRadius: '60px', overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: '120px' }}>
                    <div style={{ padding: '80px' }}>
                        <h2 style={{ fontSize: '40px', fontWeight: 900, marginBottom: '48px', color: '#0F172A' }}>Get in Touch</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <div style={{ width: '64px', height: '64px', background: primaryColor + '10', color: primaryColor, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MapPin size={28} /></div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#94A3B8', letterSpacing: '1px', marginBottom: '8px' }}>OUR LOCATION</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{org.address || 'Chennai, Tamil Nadu, India'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <div style={{ width: '64px', height: '64px', background: primaryColor + '10', color: primaryColor, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Phone size={28} /></div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#94A3B8', letterSpacing: '1px', marginBottom: '8px' }}>PHONE NUMBER</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{org.phone || '+91 98765 43210'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <div style={{ width: '64px', height: '64px', background: primaryColor + '10', color: primaryColor, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><HelpCircle size={28} /></div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#94A3B8', letterSpacing: '1px', marginBottom: '8px' }}>SUPPORT EMAIL</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{org.email || 'care@organization.com'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ background: '#F1F5F9' }}>
                         <iframe 
                            title="map"
                            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.5!2d80.2!3d13.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAwJzAwLjAiTiA4MMKwMTInMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin`} 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </main>

            <footer style={{ background: '#0F172A', padding: '100px 40px 40px', color: 'white' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '60px', marginBottom: '100px' }}>
                        <div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ background: 'white', color: '#0F172A', padding: '10px', borderRadius: '12px' }}><Building2 size={24} /></div>
                                <span style={{ fontSize: '24px', fontWeight: 900 }}>{org.organizationName || org.name}</span>
                            </div>
                            <p style={{ color: '#94A3B8', lineHeight: 1.8, fontSize: '15px' }}>Providing excellence in {org.sector} with a commitment to quality, trust, and professional integrity. Book your appointment today.</p>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 900, marginBottom: '32px', fontSize: '14px', letterSpacing: '1px' }}>QUICK LINKS</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', color: '#94A3B8', fontSize: '15px', fontWeight: 600 }}>
                                <li>Meet the Team</li>
                                <li>Service Catalog</li>
                                <li>Book Slot</li>
                                <li>Contact Us</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 900, marginBottom: '32px', fontSize: '14px', letterSpacing: '1px' }}>INDUSTRY</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', color: '#94A3B8', fontSize: '15px', fontWeight: 600 }}>
                                <li>{config.label} Excellence</li>
                                <li>Certified Partners</li>
                                <li>Professional Care</li>
                                <li>Quality First</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 900, marginBottom: '32px', fontSize: '14px', letterSpacing: '1px' }}>LEGAL</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', color: '#94A3B8', fontSize: '15px', fontWeight: 600 }}>
                                <li>Privacy Policy</li>
                                <li>Terms of Service</li>
                                <li>Cookie Policy</li>
                                <li>GDPR Compliance</li>
                            </ul>
                        </div>
                    </div>
                    <div style={{ paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: '#475569', fontSize: '14px', fontWeight: 600 }}>
                        &copy; {new Date().getFullYear()} {org.organizationName || org.name}. Powered by Forge-SAAS. All Rights Reserved.
                    </div>
                </div>
            </footer>
            
            <RegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
            <FloatingSupport color={primaryColor} />
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                body { overflow-x: hidden; }
                * { transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s; }
            `}</style>
        </div>
    );
};

const FloatingSupport = ({ color }) => (
    <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000 }}
    >
        <button style={{ 
            width: '72px', height: '72px', borderRadius: '24px', 
            background: color, 
            border: 'none', color: 'white', display: 'flex', 
            alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 20px 40px ${color}60`,
            cursor: 'pointer'
        }}>
            <MessageSquare size={32} />
        </button>
    </motion.div>
);

export default MiniWebsite;
