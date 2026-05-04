import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Calendar, Users, Shield, BarChart3, Clock, 
    Bell, CreditCard, ArrowRight, Play, Hospital,
    Building2, Briefcase, Scissors, ShoppingBag, Star, Settings,
    ChevronDown, CheckCircle2, Zap, Globe, Sparkles, Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getSectorConfig } from '../config/sectorConfig';
import { 
    Heart, GraduationCap, Sparkle, Hotel as HotelIcon, 
    Car, Dumbbell, Gavel, Home, Wrench, 
    Music, ShoppingCart, MessageCircle, Briefcase as BizIcon 
} from 'lucide-react';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isYearly, setIsYearly] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);
    const [currentSectorIndex, setCurrentSectorIndex] = useState(0);

    const heroSectors = [
        { label: 'Healthcare', icon: <Heart size={16} />, image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Education', icon: <GraduationCap size={16} />, image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Salon & Beauty', icon: <Sparkle size={16} />, image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Hospitality', icon: <HotelIcon size={16} />, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Corporate', icon: <Briefcase size={16} />, image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Automobile', icon: <Car size={16} />, image: 'https://images.unsplash.com/photo-1562426509-5044a121aa49?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Fitness', icon: <Dumbbell size={16} />, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Legal', icon: <Gavel size={16} />, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Property', icon: <Home size={16} />, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Repair Services', icon: <Wrench size={16} />, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Events', icon: <Music size={16} />, image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Retail', icon: <ShoppingCart size={16} />, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Consultancy', icon: <BizIcon size={16} />, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80' }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSectorIndex(prev => (prev + 1) % heroSectors.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Auto-redirect to dashboard if user is already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    const staggerContainer = {
        initial: {},
        whileInView: {
            transition: { staggerChildren: 0.1 }
        }
    };

    const floating = {
        animate: {
            y: [0, -15, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh', color: 'white', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>
            
            {/* 1. NAVBAR (Ultra Modern) */}
            <header style={{ 
                position: 'fixed', top: 0, width: '100%', zIndex: 1000, 
                background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '90px', padding: '0 40px', maxWidth: '1400px', margin: '0 auto' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
                        <div style={{ background: 'white', padding: '6px', borderRadius: '12px', display: 'flex' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '32px' }} />
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: 950, color: 'white', letterSpacing: '-0.5px' }}>Smart<span style={{ color: '#818CF8' }}>Scheduler</span></span>
                    </Link>

                    <nav style={{ display: 'flex', gap: '40px', alignItems: 'center', fontWeight: 600, color: '#94A3B8' }}>
                        <a href="#features" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Features</a>
                        <a href="#industries" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Industries</a>
                        <a href="#pricing" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Pricing</a>
                        <a href="#faq" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>FAQ</a>
                    </nav>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <Link to="/login" style={{ color: 'white', fontWeight: 700, textDecoration: 'none', padding: '12px 24px', fontSize: '15px' }}>Sign In</Link>
                        <Link to="/register" style={{ 
                            background: 'white', color: '#0F172A', 
                            borderRadius: '14px', padding: '12px 28px', fontWeight: 800, textDecoration: 'none',
                            fontSize: '15px', transition: 'transform 0.2s, box-shadow 0.2s'
                        }} onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 20px -5px rgba(255,255,255,0.2)'; }} onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}>Get Started Free</Link>
                    </div>
                </div>
            </header>

            <main style={{ paddingTop: '90px' }}>
                
                {/* 2. HERO SECTION (Parallax & Premium) */}
                <section style={{ position: 'relative', padding: '100px 24px 120px', overflow: 'hidden' }}>
                    {/* Background Visuals */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '1000px', height: '600px', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
                    </div>

                    <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "circOut" }}>
                            <div style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                                background: 'rgba(255,255,255,0.05)', padding: '8px 16px', 
                                borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)',
                                marginBottom: '24px', fontSize: '14px', fontWeight: 700, color: '#A5B4FC'
                            }}>
                                <Sparkles size={16} /> <span>Trusted by 5,000+ businesses globally</span>
                            </div>
                            
                            <h1 style={{ fontSize: '64px', fontWeight: 950, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1.5px' }}>
                                The Operating System for <br/>
                                <span style={{ background: 'linear-gradient(to right, #818CF8, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Modern Service Economy</span>
                            </h1>
                            
                            <p style={{ fontSize: '20px', color: '#94A3B8', maxWidth: '800px', margin: '0 auto 48px', lineHeight: 1.6 }}>
                                Automate your entire booking lifecycle, manage global teams, and scale your operations with AI-driven scheduling intelligence.
                            </p>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '80px' }}>
                                <Link to="/register" style={{ 
                                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', 
                                    height: '60px', padding: '0 40px', borderRadius: '18px', fontWeight: 900,
                                    fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
                                    boxShadow: '0 20px 40px -10px rgba(79,70,229,0.5)', transition: 'transform 0.2s'
                                }} onMouseEnter={e => e.target.style.transform = 'scale(1.02)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
                                    Launch Your Portal <ArrowRight size={20} />
                                </Link>
                            </div>
                        </motion.div>

                        {/* 🎞️ AUTO-SLIDING SECTOR HERO MOCKUP */}
                        <motion.div variants={floating} animate="animate" style={{ position: 'relative', marginTop: '40px', minHeight: '600px' }}>
                            <div style={{ 
                                position: 'absolute', inset: '-20px', 
                                background: 'linear-gradient(180deg, rgba(129, 140, 248, 0.3) 0%, transparent 100%)',
                                borderRadius: '40px', filter: 'blur(60px)', zIndex: 0
                            }}></div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSectorIndex}
                                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                    style={{ position: 'relative', zIndex: 1 }}
                                >
                                    <div style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.6)' }}>
                                        <img 
                                            src={heroSectors[currentSectorIndex].image} 
                                            alt={heroSectors[currentSectorIndex].label} 
                                            style={{ 
                                                width: '100%', height: '600px', 
                                                objectFit: 'cover', display: 'block'
                                            }} 
                                        />
                                        {/* Overlay Gradient */}
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 40%)' }}></div>
                                        
                                        {/* Dynamic Sector Badge */}
                                        <motion.div 
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            style={{ 
                                                position: 'absolute', bottom: '40px', left: '40px',
                                                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
                                                padding: '12px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)',
                                                display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                            }}
                                        >
                                            <div style={{ background: 'white', color: '#4F46E5', padding: '8px', borderRadius: '10px' }}>
                                                {heroSectors[currentSectorIndex].icon}
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', opacity: 0.6, letterSpacing: '1px' }}>Industry Focus</div>
                                                <div style={{ fontSize: '18px', fontWeight: 900, color: 'white' }}>{heroSectors[currentSectorIndex].label}</div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                            
                            {/* Glassmorphism Stats Card - Fixed Alignment */}
                            <div style={{ 
                                position: 'absolute', top: '15%', right: '5%', width: '200px', 
                                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', 
                                padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)', 
                                zIndex: 2, textAlign: 'left', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' 
                            }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: '#818CF8', textTransform: 'uppercase', marginBottom: '8px' }}>Real-time Stats</div>
                                <div style={{ fontSize: '28px', fontWeight: 900 }}>+245%</div>
                                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Growth this month</div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 3. NEW SECTION: WHO IS SMARTSCHEDULER FOR? (Circular Real Photos) */}
                <section style={{ padding: '100px 24px', background: 'white', color: '#0F172A' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '42px', fontWeight: 950, color: '#3B82F6', marginBottom: '64px' }}>Who is SmartScheduler for?</h2>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
                            {[
                                { label: 'Venues/Rooms', img: '/sector_venues_real.png' },
                                { label: 'Freelancers', img: '/sector_freelancer_real.png' },
                                { label: 'Startups', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop' },
                                { label: 'Salons', img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop' },
                                { label: 'Personal Trainers', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop' },
                                { label: 'Tutors', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop' }
                            ].map((item, i) => (
                                <motion.div key={i} whileHover={{ y: -12 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '160px' }}>
                                    <div style={{ 
                                        width: '140px', height: '140px', borderRadius: '50%', overflow: 'hidden',
                                        border: '6px solid #F1F5F9', boxShadow: '0 12px 24px rgba(0,0,0,0.08)'
                                    }}>
                                        <img src={item.img} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#475569' }}>{item.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. STATS BAR (Trust & Authority) */}
                <section style={{ background: 'rgba(255,255,255,0.02)', padding: '60px 0' }}>
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                        {[
                            { label: 'Total Bookings', value: '1.2M+', icon: Calendar },
                            { label: 'Active Orgs', value: '5,000+', icon: Building2 },
                            { label: 'Uptime', value: '99.9%', icon: Shield },
                            { label: 'Satisfaction', value: '4.9/5', icon: Star }
                        ].map((stat, i) => (
                            <motion.div key={i} {...fadeIn} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ color: '#818CF8' }}><stat.icon size={32} /></div>
                                <div>
                                    <div style={{ fontSize: '32px', fontWeight: 950 }}>{stat.value}</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 5. INDUSTRY SELECTOR */}
                <section id="industries" style={{ padding: '140px 24px' }}>
                    <div className="container" style={{ maxWidth: '1300px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <motion.h2 {...fadeIn} style={{ fontSize: '48px', fontWeight: 950, marginBottom: '24px' }}>Tailored for Every Industry</motion.h2>
                            <motion.p {...fadeIn} style={{ fontSize: '20px', color: '#94A3B8', maxWidth: '700px', margin: '0 auto' }}>Our adaptive architecture scales with your sector-specific requirements automatically.</motion.p>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            {[
                                { id: 'health', label: 'Healthcare', icon: Heart, color: '#EF4444' },
                                { id: 'education', label: 'Education', icon: GraduationCap, color: '#3B82F6' },
                                { id: 'salon', label: 'Beauty & Salon', icon: Sparkle, color: '#EC4899' },
                                { id: 'hotel', label: 'Hospitality', icon: HotelIcon, color: '#F59E0B' },
                                { id: 'automobile', label: 'Automobile', icon: Car, color: '#6366F1' },
                                { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: '#10B981' },
                                { id: 'legal', label: 'Legal', icon: Gavel, color: '#A5B4FC' },
                                { id: 'property', label: 'Real Estate', icon: Home, color: '#8B5CF6' },
                                { id: 'repair', label: 'Repairing', icon: Wrench, color: '#F97316' },
                                { id: 'events', label: 'Event Planning', icon: Music, color: '#D946EF' },
                                { id: 'retail', label: 'Retail', icon: ShoppingCart, color: '#06B6D4' },
                                { id: 'consultancy', label: 'Consultancy', icon: BizIcon, color: '#94A3B8' }
                            ].map((sector) => (
                                <motion.div 
                                    key={sector.id}
                                    whileHover={{ y: -10, background: 'rgba(255,255,255,0.06)' }}
                                    onClick={() => navigate(user ? `/select-organization?sector=${sector.id}` : `/login?redirect=/select-organization?sector=${sector.id}`)}
                                    style={{ 
                                        padding: '40px 24px', borderRadius: '28px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }}
                                >
                                    <div style={{ width: '70px', height: '70px', borderRadius: '22px', background: `${sector.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sector.color, boxShadow: `0 10px 20px -5px ${sector.color}30` }}>
                                        <sector.icon size={34} />
                                    </div>
                                    <span style={{ fontWeight: 900, color: 'white', fontSize: '17px' }}>{sector.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. PRICING */}
                <section id="pricing" style={{ padding: '140px 24px', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <h2 style={{ fontSize: '48px', fontWeight: 950, marginBottom: '32px' }}>Simple, Performance-Based Pricing</h2>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                                <span style={{ fontWeight: 800, color: isYearly ? '#64748B' : 'white' }}>Monthly</span>
                                <button onClick={() => setIsYearly(!isYearly)} style={{ width: '64px', height: '32px', borderRadius: '100px', background: '#4F46E5', position: 'relative', border: 'none', cursor: 'pointer' }}>
                                    <motion.div animate={{ x: isYearly ? 34 : 4 }} style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', position: 'absolute', top: 4 }} />
                                </button>
                                <span style={{ fontWeight: 800, color: !isYearly ? '#64748B' : 'white' }}>Yearly <span style={{ color: '#10B981', fontSize: '12px' }}>(Save 20%)</span></span>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                            {[
                                { name: "Starter", price: 0, features: ["50 Bookings / mo", "2 Staff Accounts", "Basic Core"], cta: "Free" },
                                { name: "Professional", price: isYearly ? 239 : 299, popular: true, features: ["500 Bookings / mo", "5 Staff Accounts", "WhatsApp Alerts"], cta: "Go Pro" },
                                { name: "Enterprise", price: isYearly ? 639 : 799, features: ["Unlimited Bookings", "Priority Support", "White-label"], cta: "Contact" }
                            ].map((plan, i) => (
                                <div key={i} style={{ background: plan.popular ? 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)' : 'rgba(255,255,255,0.03)', padding: '56px 40px', borderRadius: '32px', border: plan.popular ? '2px solid #4F46E5' : '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                    {plan.popular && <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: '#4F46E5', color: 'white', fontSize: '12px', fontWeight: 900, padding: '8px 24px', borderRadius: '100px' }}>POPULAR</div>}
                                    <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>{plan.name}</div>
                                    <div style={{ fontSize: '56px', fontWeight: 950, marginBottom: '40px' }}>Rs. {plan.price}<span style={{ fontSize: '18px', color: '#64748B' }}>/mo</span></div>
                                    <div style={{ flex: 1 }}> {plan.features.map((f, j) => ( <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontWeight: 600, color: '#CBD5E1' }}><CheckCircle2 size={18} color="#10B981" /> {f}</div> ))} </div>
                                    <Link to="/register" style={{ display: 'block', textAlign: 'center', padding: '18px', borderRadius: '18px', background: plan.popular ? '#4F46E5' : 'white', color: plan.popular ? 'white' : '#0F172A', fontWeight: 900, textDecoration: 'none', marginTop: '40px' }}>{plan.cta}</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. FAQ SECTION */}
                <section id="faq" style={{ padding: '140px 24px' }}>
                    <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '48px', fontWeight: 950, textAlign: 'center', marginBottom: '64px' }}>Questions & Answers</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { q: "How long is the setup?", a: "Under 10 minutes. Our templates do the heavy lifting." },
                                { q: "Is my data secure?", a: "We use 256-bit encryption and isolated tenant databases." }
                            ].map((faq, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} style={{ width: '100%', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 800 }}>{faq.q}</span>
                                        <ChevronDown size={20} style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                                    </button>
                                    <AnimatePresence> {activeFaq === i && ( <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}><div style={{ padding: '0 32px 24px', color: '#94A3B8' }}>{faq.a}</div></motion.div> )} </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 8. NEW SECTION: SECURITY & TRUST (Filling the Gap) */}
                <section style={{ padding: '100px 24px', background: 'rgba(79, 70, 229, 0.05)' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                            <div style={{ padding: '48px', borderRadius: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                <Shield size={56} color="#818CF8" style={{ marginBottom: '24px' }} />
                                <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>Enterprise Security</h3>
                                <p style={{ color: '#94A3B8', lineHeight: 1.7 }}>Bank-grade 256-bit AES encryption ensures your business and client data stays private and protected at all times.</p>
                            </div>
                            <div style={{ padding: '48px', borderRadius: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                <Zap size={56} color="#C084FC" style={{ marginBottom: '24px' }} />
                                <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>Instant Deployment</h3>
                                <p style={{ color: '#94A3B8', lineHeight: 1.7 }}>No complex servers or code. Launch your entire booking ecosystem in minutes with our auto-scaling cloud infrastructure.</p>
                            </div>
                            <div style={{ padding: '48px', borderRadius: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                <Globe size={56} color="#F472B6" style={{ marginBottom: '24px' }} />
                                <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>Global Reliability</h3>
                                <p style={{ color: '#94A3B8', lineHeight: 1.7 }}>Built on high-availability clusters with 99.9% uptime SLA, serving millions of users across the globe without interruption.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 9. FINAL CTA */}
                <section style={{ padding: '120px 24px' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', padding: '100px 40px', borderRadius: '48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                            <Rocket size={400} style={{ position: 'absolute', right: '-100px', bottom: '-100px', opacity: 0.1, color: 'white', transform: 'rotate(-45deg)' }} />
                            <h2 style={{ fontSize: '56px', fontWeight: 950, marginBottom: '24px' }}>Ready to Launch?</h2>
                            <p style={{ fontSize: '22px', opacity: 0.9, maxWidth: '700px', margin: '0 auto 48px' }}>Join 5,000+ businesses who have automated their growth with SmartScheduler.</p>
                            <Link to="/register" style={{ background: 'white', color: '#4F46E5', padding: '20px 60px', borderRadius: '20px', fontWeight: 950, fontSize: '20px', textDecoration: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>Get Started Free</Link>
                        </div>
                    </div>
                </section>

            </main>

            {/* 10. FOOTER */}
            <footer style={{ background: '#020617', padding: '100px 0 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '80px', marginBottom: '80px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ background: 'white', padding: '6px', borderRadius: '10px' }}> <img src="/logo.png" alt="Logo" style={{ height: '28px' }} /> </div>
                                <span style={{ fontSize: '22px', fontWeight: 950 }}>SmartScheduler</span>
                            </div>
                            <p style={{ color: '#64748B', maxWidth: '400px', lineHeight: 1.7 }}>Automating the world’s service interactions. Built for speed, scale, and total security.</p>
                        </div>
                        <div> <h4 style={{ fontWeight: 900, marginBottom: '32px' }}>Product</h4> <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px', color: '#64748B' }}> <li>Features</li><li>Industries</li><li>Pricing</li> </ul> </div>
                        <div> <h4 style={{ fontWeight: 900, marginBottom: '32px' }}>Company</h4> <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px', color: '#64748B' }}> <li>About Us</li><li>Security</li><li>Privacy</li> </ul> </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px', textAlign: 'center', color: '#475569', fontSize: '14px' }}> &copy; 2026 SmartScheduler Global. All rights reserved. </div>
                </div>
            </footer>
            <style> {` @keyframes float-alt { 0% { transform: translateY(0); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0); } } html { scroll-behavior: smooth; } `} </style>
        </div>
    );
};

export default LandingPage;
