import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Calendar, Users, Shield, BarChart3, Clock, 
    Bell, CreditCard, ArrowRight, Play, Activity,
    Building2, Briefcase, Scissors, ShoppingBag, Star, Settings,
    ChevronDown, CheckCircle, Zap, Globe, Sparkles, Rocket,
    Heart, GraduationCap, Hotel as HotelIcon, 
    Car, Dumbbell, Gavel, Home as HomeIcon, Wrench, 
    Music, ShoppingCart, MessageCircle, Smartphone, User, Check, Monitor, Layout
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentSectorIndex, setCurrentSectorIndex] = useState(0);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    
    // Smart Booking Widget State
    const [bookingStep, setBookingStep] = useState(1);
    const [selectedWidgetSector, setSelectedWidgetSector] = useState(null);
    const [selectedWidgetService, setSelectedWidgetService] = useState(null);

    const heroSectors = [
        { label: 'Healthcare', icon: <Heart size={16} />, image: '/healthcare.png' },
        { label: 'Education', icon: <GraduationCap size={16} />, image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Salon & Beauty', icon: <Sparkles size={16} />, image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Hospitality', icon: <HotelIcon size={16} />, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Corporate', icon: <Briefcase size={16} />, image: '/corporate.png' },
        { label: 'Automobile', icon: <Car size={16} />, image: 'https://images.unsplash.com/photo-1562426509-5044a121aa49?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Fitness', icon: <Dumbbell size={16} />, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Legal', icon: <Gavel size={16} />, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Property', icon: <HomeIcon size={16} />, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Repair Services', icon: <Wrench size={16} />, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Events', icon: <Music size={16} />, image: '/sector_venues_real.png' },
        { label: 'Retail', icon: <ShoppingCart size={16} />, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Consultancy', icon: <Briefcase size={16} />, image: '/sector_freelancer_real.png' }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSectorIndex(prev => (prev + 1) % heroSectors.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroSectors.length]);

    // Live Stats Counter Effect
    const [stats, setStats] = useState({ appointments: 0, clients: 0, services: 0 });
    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            setStats({
                appointments: Math.min(1000, Math.floor((1000 / steps) * currentStep)),
                clients: Math.min(500, Math.floor((500 / steps) * currentStep)),
                services: Math.min(50, Math.floor((50 / steps) * currentStep))
            });
            if (currentStep >= steps) clearInterval(timer);
        }, interval);
        return () => clearInterval(timer);
    }, []);

    const floatingAnim = {
        y: ["-10px", "10px"],
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
        }
    };

    return (
        <div style={{ background: '#020617', minHeight: '100vh', color: 'white', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>
            
            <style>{`
                ::selection { background: rgba(99, 102, 241, 0.3); color: white; }
                .glass-nav {
                    background: rgba(2, 6, 23, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                }
                .sector-card:hover {
                    background: rgba(99, 102, 241, 0.1);
                    border-color: rgba(99, 102, 241, 0.3);
                    box-shadow: 0 0 30px rgba(99, 102, 241, 0.2);
                }
                .sector-card:hover .explore-btn {
                    opacity: 1;
                    transform: translateY(0);
                }
                .explore-btn {
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                }
                .gradient-text {
                    background: linear-gradient(135deg, #818CF8 0%, #C084FC 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .animated-bg {
                    position: absolute;
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                    z-index: 0;
                }
                .blob {
                    position: absolute;
                    filter: blur(80px);
                    border-radius: 50%;
                    opacity: 0.5;
                    animation: move 20s infinite alternate;
                }
                @keyframes move {
                    from { transform: translate(0, 0) scale(1); }
                    to { transform: translate(100px, -100px) scale(1.2); }
                }
                .scroll-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            
            {/* Animated Background Gradients */}
            <div className="animated-bg">
                <div className="blob" style={{ background: '#4F46E5', width: '400px', height: '400px', top: '-100px', left: '-100px' }} />
                <div className="blob" style={{ background: '#9333EA', width: '300px', height: '300px', top: '20%', right: '-50px', animationDelay: '2s' }} />
                <div className="blob" style={{ background: '#0EA5E9', width: '350px', height: '350px', bottom: '-100px', left: '30%', animationDelay: '4s' }} />
            </div>

            {/* 1. NAVBAR (Glassmorphism) */}
            <header className="glass-nav" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, transition: 'all 0.3s' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', padding: '0 40px', maxWidth: '1400px', margin: '0 auto' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
                        <div style={{ background: 'linear-gradient(135deg, #4F46E5, #9333EA)', padding: '8px', borderRadius: '12px', display: 'flex', boxShadow: '0 0 15px rgba(79, 70, 229, 0.5)' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '28px', filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <span style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>Smart<span style={{ color: '#818CF8' }}>Scheduler</span></span>
                    </Link>

                    <nav className="nav-links-desktop" style={{ display: 'flex', gap: '40px', alignItems: 'center', fontWeight: 600, color: '#CBD5E1' }}>
                        <a href="#features" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#fff'} onMouseLeave={(e)=>e.target.style.color='#CBD5E1'}>Features</a>
                        <a href="#industries" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#fff'} onMouseLeave={(e)=>e.target.style.color='#CBD5E1'}>Industries</a>
                        <a href="#demo" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#fff'} onMouseLeave={(e)=>e.target.style.color='#CBD5E1'}>Live Demo</a>
                    </nav>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {user ? (
                            <Link to="/dashboard" style={{ 
                                background: 'white', color: '#0F172A', 
                                borderRadius: '12px', padding: '10px 24px', fontWeight: 800, textDecoration: 'none',
                                fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.2s', boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                            }}>
                                Go to Dashboard <ArrowRight size={16} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" style={{ 
                                    color: 'white', fontWeight: 700, textDecoration: 'none', 
                                    padding: '10px 16px', fontSize: '14px', transition: 'opacity 0.2s'
                                }}>Log In</Link>
                                <Link to="/register" style={{ 
                                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', 
                                    borderRadius: '12px', padding: '10px 24px', fontWeight: 800, textDecoration: 'none',
                                    fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: '0 4px 15px rgba(79,70,229,0.4)', transition: 'transform 0.2s'
                                }} onMouseEnter={(e)=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={(e)=>e.currentTarget.style.transform='translateY(0)'}>
                                    Start Free Trial
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main style={{ paddingTop: '80px', position: 'relative', zIndex: 1 }}>
                
                {/* 2. ANIMATED HERO SECTION */}
                <section style={{ padding: '120px 24px 80px', position: 'relative', textAlign: 'center', minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    
                    {/* Floating Icons Background */}
                    <motion.div animate={floatingAnim} style={{ position: 'absolute', top: '15%', left: '15%', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
                        <Calendar size={32} color="#818CF8" />
                    </motion.div>
                    <motion.div animate={floatingAnim} transition={{ delay: 1 }} style={{ position: 'absolute', top: '25%', right: '15%', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
                        <Sparkles size={32} color="#C084FC" />
                    </motion.div>
                    <motion.div animate={floatingAnim} transition={{ delay: 0.5 }} style={{ position: 'absolute', bottom: '30%', left: '20%', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
                        <Users size={32} color="#34D399" />
                    </motion.div>

                    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <div style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                                background: 'rgba(99, 102, 241, 0.1)', padding: '8px 20px', 
                                borderRadius: '100px', border: '1px solid rgba(99, 102, 241, 0.2)',
                                marginBottom: '32px', fontSize: '13px', fontWeight: 800, color: '#818CF8',
                                letterSpacing: '1px', textTransform: 'uppercase'
                            }}>
                                <Rocket size={14} /> The Future of Booking Systems
                            </div>
                            
                            <h1 style={{ fontSize: '72px', fontWeight: 950, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-2px' }}>
                                Book Services <br />
                                <span className="gradient-text">Anytime, Anywhere.</span>
                            </h1>
                            
                            <p style={{ fontSize: '20px', color: '#94A3B8', maxWidth: '600px', margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 500 }}>
                                Seamlessly manage appointments, staff, and clients with our premium AI-driven scheduling platform built for modern businesses.
                            </p>
                            
                             <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                <Link to="/register" style={{ 
                                    background: 'white', color: '#0F172A', 
                                    height: '56px', padding: '0 32px', borderRadius: '16px', fontWeight: 900,
                                    fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
                                    transition: 'all 0.2s'
                                }} onMouseEnter={(e)=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={(e)=>e.currentTarget.style.transform='scale(1)'}>
                                    Get Started for Free <ArrowRight size={18} />
                                </Link>

                                <a href="#demo" style={{ 
                                    height: '56px', background: 'rgba(255,255,255,0.05)', color: 'white', 
                                    padding: '0 32px', borderRadius: '16px', fontWeight: 800,
                                    fontSize: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(10px)',
                                    textDecoration: 'none', transition: 'all 0.2s'
                                }} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                                    <Play size={18} /> Try Live Demo
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Dashboard Preview Image overlaying bottom */}
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.4, duration: 1, type: "spring" }}
                        style={{ marginTop: '80px', width: '100%', maxWidth: '1100px', position: 'relative' }}
                    >
                        <div style={{ position: 'absolute', inset: '-20px', background: 'linear-gradient(180deg, rgba(79, 70, 229, 0.4) 0%, transparent 100%)', filter: 'blur(50px)', borderRadius: '40px', zIndex: -1 }} />
                        <div className="glass-card" style={{ borderRadius: '24px', padding: '8px', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" alt="Dashboard Preview" style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block', opacity: 0.8 }} />
                            {/* Overlay mock UI elements to make it look like our dash */}
                            <div style={{ position: 'absolute', top: '40px', left: '40px', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', background: '#4F46E5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Calendar size={24} color="white" />
                                </div>
                                <div>
                                    <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 800 }}>UPCOMING</div>
                                    <div style={{ color: 'white', fontSize: '16px', fontWeight: 900 }}>Client Meeting at 2:00 PM</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </section>

                {/* 3. REAL-TIME STATS COUNTER */}
                <section style={{ padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '40px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', fontWeight: 950, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                {stats.appointments} <span style={{ color: '#4F46E5' }}>+</span>
                            </div>
                            <div style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Appointments Booked</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', fontWeight: 950, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                {stats.clients} <span style={{ color: '#10B981' }}>+</span>
                            </div>
                            <div style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Businesses</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', fontWeight: 950, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                {stats.services} <span style={{ color: '#F59E0B' }}>+</span>
                            </div>
                            <div style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Services Listed</div>
                        </div>
                    </div>
                </section>

                {/* 4. SMART BOOKING WIDGET (Live Demo) */}
                <section id="demo" style={{ padding: '120px 24px', position: 'relative' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2 style={{ fontSize: '42px', fontWeight: 950, color: 'white', marginBottom: '16px' }}>Experience the Magic</h2>
                            <p style={{ color: '#94A3B8', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Try our seamless booking flow right here. No login required.</p>
                        </div>

                        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', borderRadius: '32px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                                <div style={{ height: '100%', background: '#4F46E5', width: `${(bookingStep / 3) * 100}%`, transition: 'width 0.3s ease' }} />
                            </div>

                            <AnimatePresence mode="wait">
                                {bookingStep === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', background: '#4F46E5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>1</div>
                                            Select Your Sector
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                                            {heroSectors.slice(0, 8).map((sector, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => { setSelectedWidgetSector(sector); setBookingStep(2); }}
                                                    style={{ 
                                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                                                        padding: '20px', borderRadius: '16px', color: 'white', cursor: 'pointer',
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e)=>e.currentTarget.style.background='rgba(99, 102, 241, 0.2)'}
                                                    onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                                                >
                                                    <div style={{ color: '#818CF8' }}>{sector.icon}</div>
                                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{sector.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {bookingStep === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', background: '#4F46E5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>2</div>
                                            Pick a Service for {selectedWidgetSector?.label}
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                            {['Premium Consultation', 'Standard Service', 'Emergency Support'].map((service, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => { setSelectedWidgetService(service); setBookingStep(3); }}
                                                    style={{ 
                                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                                                        padding: '24px', borderRadius: '16px', color: 'white', cursor: 'pointer',
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e)=>e.currentTarget.style.background='rgba(99, 102, 241, 0.2)'}
                                                    onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                                                >
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>{service}</div>
                                                        <div style={{ fontSize: '13px', color: '#94A3B8' }}>30 mins • Highly Rated</div>
                                                    </div>
                                                    <ArrowRight size={20} color="#818CF8" />
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => setBookingStep(1)} style={{ marginTop: '24px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
                                    </motion.div>
                                )}

                                {bookingStep === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10B981' }}>
                                            <Check size={40} />
                                        </div>
                                        <h3 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>Preview Complete!</h3>
                                        <p style={{ color: '#94A3B8', fontSize: '16px', maxWidth: '400px', margin: '0 auto 32px' }}>
                                            You just experienced how fast your customers can book {selectedWidgetService} using our platform.
                                        </p>
                                        <Link to="/register" style={{ 
                                            background: '#4F46E5', color: 'white', padding: '16px 32px', 
                                            borderRadius: '16px', fontWeight: 900, textDecoration: 'none', display: 'inline-block'
                                        }}>
                                            Create Your Own System Now
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* 5. HOVER SECTOR CARDS */}
                <section id="industries" style={{ padding: '100px 24px', position: 'relative' }}>
                    <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <h2 style={{ fontSize: '48px', fontWeight: 950, color: 'white', marginBottom: '16px' }}>Built For Every Industry</h2>
                            <p style={{ color: '#94A3B8', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Select your sector to instantly generate a tailor-made scheduling portal and mini-website.</p>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            {heroSectors.map((sector, i) => (
                                <div key={i} className="glass-card sector-card" style={{ 
                                    position: 'relative', height: '350px', borderRadius: '24px', overflow: 'hidden', 
                                    cursor: 'pointer', transition: 'all 0.4s ease', display: 'flex', flexDirection: 'column',
                                    justifyContent: 'flex-end', padding: '32px'
                                }} onClick={() => navigate(`/register?sector=${sector.label.toLowerCase()}`)}>
                                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                                        <img src={sector.image} alt={sector.label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, transition: '0.4s' }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(2,6,23,1) 0%, rgba(2,6,23,0.2) 100%)' }} />
                                    </div>
                                    
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', width: 'fit-content', padding: '12px', borderRadius: '16px', marginBottom: '20px' }}>
                                            {sector.icon}
                                        </div>
                                        <h3 style={{ fontWeight: 900, fontSize: '28px', color: 'white', marginBottom: '12px' }}>{sector.label}</h3>
                                        <div className="explore-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818CF8', fontSize: '15px', fontWeight: 800 }}>
                                            Explore Sector <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. MINI WEBSITE PREVIEW */}
                <section style={{ padding: '120px 24px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '8px 16px', borderRadius: '100px', fontWeight: 800, fontSize: '13px', marginBottom: '24px', textTransform: 'uppercase' }}>
                                <Monitor size={16} /> Public Presence included
                            </div>
                            <h2 style={{ fontSize: '48px', fontWeight: 950, marginBottom: '24px', lineHeight: 1.1 }}>Free SEO-Optimized <br/> Mini Website</h2>
                            <p style={{ color: '#94A3B8', fontSize: '18px', lineHeight: 1.6, marginBottom: '32px' }}>
                                Every account comes with a stunning, sector-specific public portal. Your customers can view your services, meet your staff, and book appointments directly from your unique link.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                                {['Dynamic Hero Sliders based on your Sector', 'Integrated Live Chat & Support', 'Fully mobile responsive design'].map((f, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#CBD5E1', fontWeight: 600 }}>
                                        <div style={{ background: '#4F46E5', borderRadius: '50%', padding: '4px' }}><Check size={14} color="white" /></div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register" style={{ background: 'white', color: '#0F172A', padding: '16px 32px', borderRadius: '16px', fontWeight: 900, textDecoration: 'none', display: 'inline-block' }}>
                                Claim Your Website Now
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: '-20px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
                            <div className="glass-card" style={{ padding: '20px', borderRadius: '32px', position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
                                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Mini Website Preview" style={{ width: '100%', borderRadius: '20px', display: 'block' }} />
                                {/* Overlay mock mobile */}
                                <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', background: '#0F172A', padding: '12px', borderRadius: '32px', border: '8px solid #1E293B', width: '160px', height: '320px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                    <div style={{ width: '100%', height: '100%', background: '#4F46E5', borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
                                        <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80" alt="Mobile View" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
                                            <div style={{ color: 'white', fontWeight: 900, fontSize: '14px' }}>Book Now</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* FLOATING QUICK ACTIONS */}
            <div style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 100 }}>
                <a href="mailto:support@smartsched.com" style={{ 
                    width: '60px', height: '60px', borderRadius: '30px', background: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', transition: 'all 0.3s'
                }} onMouseEnter={(e)=>e.currentTarget.style.background='#4F46E5'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
                    <MessageCircle size={24} />
                </a>
            </div>

            <footer style={{ background: '#020617', padding: '80px 24px 40px', color: 'white', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px' }}>Ready to transform your business?</h2>
                    <Link to="/register" style={{ 
                        background: 'white', color: '#0F172A', padding: '16px 40px', 
                        borderRadius: '16px', fontWeight: 900, textDecoration: 'none', display: 'inline-block',
                        marginBottom: '60px'
                    }}>
                        Start Your Free Trial
                    </Link>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px', color: '#64748B', fontSize: '14px', fontWeight: 600 }}>
                        &copy; {new Date().getFullYear()} SmartScheduler. Built for modern businesses.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
