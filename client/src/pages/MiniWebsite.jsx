import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Building2, CheckCircle2, Clock, Activity, User, 
    X, MapPin, Phone, HelpCircle, ArrowLeft, Heart, Share2, Star,
    ShieldCheck, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import { getSectorConfig } from '../config/sectorConfig';

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
                    <button onClick={() => window.location.href = '/dashboard'} className="btn btn-primary" style={{ width: '100%', height: '56px', borderRadius: '16px' }}>Go to Dashboard</button>
                </div>
            </div>
        );
    }

    const rawSector = org.organizationSector || org.sector || org.category || 'general';
    const config = getSectorConfig(rawSector);
    console.log('DEBUG_MINI_WEBSITE_CONFIG:', { rawSector, label: config.label });

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
            {/* 🔝 FLOATING NAV */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0', padding: '16px 40px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => window.location.href = '/dashboard'} style={{ background: '#F1F5F9', border: 'none', padding: '8px', borderRadius: '12px', cursor: 'pointer', color: '#475569' }}>
                            <ArrowLeft size={18} />
                        </button>
                        {org.organizationLogo ? <img src={org.organizationLogo} alt="" style={{ height: '32px', objectFit: 'contain' }} /> : <Building2 size={24} color="#4F46E5" />}
                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>{org.organizationName || org.name}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '32px', fontWeight: 800, color: '#64748B', fontSize: '14px' }}>
                        <span style={{ cursor: 'pointer', color: '#0F172A' }}>Home</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => document.getElementById('details').scrollIntoView({ behavior: 'smooth' })}>About</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => document.getElementById('staff').scrollIntoView({ behavior: 'smooth' })}>{config.dashboard.employeeRole}s</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}>Services</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ background: 'white', border: '1px solid #E2E8F0', padding: '10px 16px', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Share2 size={16} /> Share
                        </button>
                        {!isOwner && (
                            <button onClick={() => navigate(`/book?clientId=${id}`)} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '12px' }}>
                                Book Now
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 20px' }}>
                {/* 🏠 HERO SECTION */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'relative', height: '480px', borderRadius: '40px', overflow: 'hidden', background: '#0F172A', color: 'white', marginBottom: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}
                >
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
                        <img src={org.organizationImages?.split(',')[0] || config.userSide.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Hero" />
                    </div>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(15, 23, 42, 0.9) 100%)' }} />
                    <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', width: 'fit-content', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {(config.label || 'Service').toUpperCase()} EXCELLENCE
                        </div>
                        <h1 style={{ fontSize: '64px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-2px' }}>
                            {config.websiteContent?.heroTitle || `Quality ${config.label} You Can Trust`}
                        </h1>
                        <p style={{ fontSize: '20px', fontWeight: 500, maxWidth: '600px', marginBottom: '40px', opacity: 0.9, lineHeight: 1.5 }}>
                            {config.websiteContent?.heroSub || `Book appointments with experienced ${config.dashboard.employeeRole.toLowerCase()}s quickly and easily.`}
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {!isOwner && (
                                <button onClick={() => navigate(`/book?clientId=${id}`)} style={{ background: 'white', color: '#0F172A', border: 'none', height: '64px', padding: '0 40px', borderRadius: '20px', fontSize: '18px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                                    Instant Booking
                                </button>
                            )}
                            <button onClick={() => document.getElementById('details').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', height: '64px', padding: '0 32px', borderRadius: '20px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                                Explore Details
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* 🏥 ABOUT SECTION */}
                <div id="details" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', marginBottom: '80px' }}>
                    <div style={{ background: 'white', padding: '60px', borderRadius: '40px', border: '1px solid #E2E8F0' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px', color: '#0F172A' }}>{config.websiteContent?.aboutTitle || `About Our ${config.brandLabel?.split('/')[0] || 'Center'}`}</h2>
                        <p style={{ fontSize: '17px', lineHeight: 1.8, color: '#475569', marginBottom: '32px' }}>
                            {org.organizationStory || org.organizationPurpose || config.websiteContent?.aboutText || "We provide comprehensive services with highly experienced professionals and modern facilities. Our goal is to deliver quality with care, trust, and comfort."}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', padding: '16px', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                <div style={{ width: '40px', height: '40px', background: '#D1FAE5', color: '#059669', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={24} /></div>
                                <span style={{ fontWeight: 800, fontSize: '15px' }}>Verified Partner</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', padding: '16px', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                <div style={{ width: '40px', height: '40px', background: '#E0F2FE', color: '#0284C7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={24} /></div>
                                <span style={{ fontWeight: 800, fontSize: '15px' }}>Top Rated Provider</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <img 
                            src={org.organizationImages?.split(',')[1] || config.userSide?.secondaryImage || config.userSide?.image} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }} 
                            alt="Gallery" 
                        />
                        <div style={{ position: 'absolute', bottom: '24px', left: '24px', background: 'rgba(255,255,255,0.9)', padding: '16px 24px', borderRadius: '24px', border: '1px solid white', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', color: '#F59E0B' }}>
                                    {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#F59E0B" />)}
                                </div>
                                <span style={{ fontWeight: 900, fontSize: '14px' }}>4.9/5</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{config.websiteContent?.trustBadge || 'Trusted by 10k+ local users'}</p>
                        </div>
                    </div>
                </div>
                {/* STAFF SECTION */}
                <section id="staff" style={{ marginBottom: '80px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>Our {config.dashboard.employeeRole}s</h2>
                        <p style={{ color: '#64748B', fontSize: '18px', fontWeight: 500 }}>Meet our handpicked team of certified experts</p>
                    </div>

                    {staff.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                            {staff.map(member => (
                                <motion.div 
                                    whileHover={{ y: -12, scale: 1.02 }}
                                    key={member._id} 
                                    style={{ 
                                        background: 'white', 
                                        borderRadius: '40px', 
                                        padding: '48px 32px 32px', 
                                        border: '1px solid #F1F5F9', 
                                        textAlign: 'center', 
                                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }}
                                >
                                    {/* Subtle Ambient Background */}
                                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
                                    
                                    <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 32px' }}>
                                        {/* Premium Avatar Container */}
                                        <div style={{ 
                                            width: '100%', height: '100%', 
                                            borderRadius: '35% 65% 60% 40% / 30% 35% 65% 70%', 
                                            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', 
                                            padding: '5px',
                                            boxShadow: '0 15px 35px -10px rgba(79, 70, 229, 0.4)',
                                            animation: 'morph 8s ease-in-out infinite'
                                        }}>
                                            <div style={{ width: '100%', height: '100%', borderRadius: 'inherit', background: 'white', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {member.avatar ? (
                                                    <img src={member.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={member.name} />
                                                ) : (
                                                    <div style={{ background: '#F8FAFC', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <User size={56} color="#4F46E5" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Status Glow */}
                                        <div style={{ 
                                            position: 'absolute', bottom: '10px', right: '10px', 
                                            background: '#10B981', width: '28px', height: '28px', 
                                            borderRadius: '50%', border: '5px solid white',
                                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)'
                                        }} />
                                    </div>

                                    <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', color: '#0F172A', letterSpacing: '-0.5px' }}>
                                        {org.sector === 'health' ? 'Dr. ' : ''}{member.name}
                                    </h3>
                                    
                                    <div style={{ 
                                        fontSize: '12px', fontWeight: 900, color: '#4F46E5', textTransform: 'uppercase', 
                                        letterSpacing: '1px', background: '#F5F3FF', padding: '8px 16px', 
                                        borderRadius: '12px', display: 'inline-block', marginBottom: '20px' 
                                    }}>
                                        {member.specialty || member.department || config.dashboard.employeeRole}
                                    </div>

                                    <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6, marginBottom: '32px', padding: '0 10px' }}>
                                        Recognized for world-class domain expertise with over 5+ years of distinguished excellence.
                                    </p>

                                    {/* Action Footnotes */}
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '32px', opacity: 0.6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}><ShieldCheck size={14} color="#10B981" /> Verified</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}><Star size={14} color="#F59E0B" /> 4.9/5</div>
                                    </div>

                                    {!isOwner ? (
                                        <button 
                                            onClick={() => navigate(`/book?clientId=${id}`)} 
                                            className="btn btn-primary" 
                                            style={{ 
                                                width: '100%', 
                                                borderRadius: '20px', 
                                                fontWeight: 900, 
                                                padding: '16px', 
                                                fontSize: '15px',
                                                boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.3)',
                                                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                                                border: 'none'
                                            }}
                                        >
                                            Check Slots & Book
                                        </button>
                                    ) : (
                                        <div style={{ padding: '16px', borderRadius: '20px', background: '#F1F5F9', color: '#64748B', fontWeight: 800, fontSize: '14px' }}>
                                            Your Staff Member
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px', opacity: 0.7 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ background: 'white', borderRadius: '40px', padding: '48px 32px', border: '1px solid #E2E8F0', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #4F46E5, #7C3AED)' }} />
                                    <div style={{ width: '90px', height: '90px', background: '#F8FAFC', borderRadius: '24px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #CBD5E1' }}>
                                        <User size={32} color="#CBD5E1" />
                                    </div>
                                    <div style={{ height: '24px', width: '70%', background: '#F1F5F9', borderRadius: '12px', margin: '0 auto 12px' }} />
                                    <div style={{ height: '14px', width: '50%', background: '#F8FAFC', borderRadius: '10px', margin: '0 auto 32px' }} />
                                    <p style={{ fontSize: '13px', color: '#64748B', fontWeight: 800, letterSpacing: '0.5px' }}>Expert {config.dashboard.employeeRole} coming soon</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 💊 SERVICES SECTION */}
                <section id="services" style={{ marginBottom: '80px' }}>
                     <div style={{ background: 'white', padding: '80px 40px', borderRadius: '50px', border: '1px solid #E2E8F0' }}>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>Professional Services</h2>
                            <p style={{ color: '#64748B', fontSize: '18px', fontWeight: 500 }}>Comprehensive solutions tailored to your specific requirements</p>
                        </div>

                        {services.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {services.map(srv => (
                                    <div key={srv._id} style={{ padding: '32px', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #F1F5F9', transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#4F46E5'}>
                                        <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)', color: '#4F46E5' }}>
                                            <Activity size={24} />
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '8px' }}>{srv.name}</h3>
                                        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.6 }}>{srv.description || 'Full professional service protocol with dedicated support.'}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <span style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>Rs. {srv.price}</span>
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8' }}>{srv.duration} MINS</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: '32px', border: '2px dashed #E2E8F0' }}>
                                <Activity size={40} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Service Catalog Coming Soon</h3>
                                <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>We are currently finalizing our premium {config.dashboard.serviceLabel.toLowerCase()} list. Please check back shortly for updates.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 📅 CALL TO ACTION */}
                <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', borderRadius: '50px', padding: '80px', textAlign: 'center', color: 'white', marginBottom: '80px', boxShadow: '0 40px 80px -20px rgba(79, 70, 229, 0.4)' }}>
                    <h2 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '24px' }}>Ready to get started?</h2>
                    <p style={{ fontSize: '20px', maxWidth: '600px', margin: '0 auto 48px', opacity: 0.9 }}>
                        Schedule your visit today and experience the highest standard of service in {org.sector}.
                    </p>
                    {!isOwner && (
                        <button onClick={() => navigate(`/book?clientId=${id}`)} style={{ background: 'white', color: '#4F46E5', height: '72px', padding: '0 56px', borderRadius: '24px', fontSize: '20px', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            Confirm Your Slot Now
                        </button>
                    )}
                    <div style={{ marginTop: '32px', display: 'flex', gap: '24px', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} /> Instant Confirmation</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} /> Reschedule Anytime</span>
                    </div>
                </div>

                {/* 📍 CONTACT & MAP */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', background: 'white', borderRadius: '50px', overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: '80px' }}>
                     <div style={{ padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '40px', color: '#0F172A' }}>Visit Our Location</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MapPin size={24} /></div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>OFFICE ADDRESS</div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>{org.address || 'Chennai, Tamil Nadu, India'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Phone size={24} /></div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>BUSINESS PHONE</div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>{org.phone || '+91 98765 43210'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><HelpCircle size={24} /></div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>CLIENT SUPPORT</div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>{org.email || 'care@organization.com'}</div>
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

            <footer style={{ background: 'white', borderTop: '1px solid #E2E8F0', padding: '60px 40px 40px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
                        <div style={{ maxWidth: '300px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                {org.organizationLogo ? <img src={org.organizationLogo} alt="" style={{ height: '32px' }} /> : <Building2 size={24} color="#4F46E5" />}
                                <span style={{ fontSize: '20px', fontWeight: 900 }}>{org.organizationName || org.name}</span>
                            </div>
                            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>Providing excellence in {org.sector} with a commitment to quality, trust, and professional integrity.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '80px' }}>
                            <div>
                                <h4 style={{ fontWeight: 900, marginBottom: '20px', fontSize: '14px' }}>Quick Links</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
                                    <li style={{ cursor: 'pointer' }}>Meet the Team</li>
                                    <li style={{ cursor: 'pointer' }}>Service Catalog</li>
                                    <li style={{ cursor: 'pointer' }}>Book Slot</li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 900, marginBottom: '20px', fontSize: '14px' }}>Legal</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
                                    <li style={{ cursor: 'pointer' }}>Privacy Policy</li>
                                    <li style={{ cursor: 'pointer' }}>Terms of Use</li>
                                    <li style={{ cursor: 'pointer' }}>Contact Admin</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div style={{ paddingTop: '40px', borderTop: '1px solid #F1F5F9', textAlign: 'center', color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>
                        (c) {new Date().getFullYear()} {org.organizationName || org.name}. Powered by SmartScheduler AI. All Rights Reserved.
                    </div>
                </div>
            </footer>
            <style>{`
                @keyframes morph {
                    0% { border-radius: 35% 65% 60% 40% / 30% 35% 65% 70%; }
                    50% { border-radius: 65% 35% 40% 60% / 70% 65% 35% 30%; }
                    100% { border-radius: 35% 65% 60% 40% / 30% 35% 65% 70%; }
                }
                .staff-card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 32px;
                }
                @media (max-width: 768px) {
                    .staff-card-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <FloatingSupport />
        </div>
    );
};

const FloatingSupport = () => (
    <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000 }}
    >
        <button style={{ 
            width: '64px', height: '64px', borderRadius: '24px', 
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', 
            border: 'none', color: 'white', display: 'flex', 
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(79, 70, 229, 0.4)',
            cursor: 'pointer'
        }}>
            <MessageSquare size={28} />
        </button>
    </motion.div>
);

export default MiniWebsite;
