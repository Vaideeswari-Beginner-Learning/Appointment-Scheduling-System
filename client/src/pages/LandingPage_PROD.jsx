import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { 
    Calendar, Users, Shield, BarChart3, Clock, 
    Bell, CreditCard, ArrowRight, Play, Activity,
    Building2, Briefcase, Scissors, ShoppingBag, Star, Settings,
    Zap, Globe, Sparkles, Rocket, Heart, GraduationCap, Hotel as HotelIcon, 
    Car, Dumbbell, Gavel, Home as HomeIcon, Wrench, 
    Music, ShoppingCart, MessageCircle, Smartphone, User, Check, Monitor, Layout, Moon,
    ChevronRight, Menu, X, Instagram, Twitter, Linkedin, Github, ExternalLink,
    PieChart, ClipboardList, ShieldAlert, User as UserIcon, Megaphone,
    Laptop, Cpu, Scale, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LottieWrapper } from '../components';

const Counter = ({ value, duration = 2 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value.toString().replace(/,/g, ''));
        if (start === end) return;
        let totalMilisecondsCount = duration * 1000;
        let incrementTime = (totalMilisecondsCount / end);
        let timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);
        return () => clearInterval(timer);
    }, [value, duration]);
    return <span>{count.toLocaleString()}</span>;
};


const LandingPage = () => {
    const { user } = useAuth();
    const { isDarkMode, toggleTheme, theme } = useTheme();
    const navigate = useNavigate();
    const logoRef = useRef(null);

    const handleLogoClick = () => {
        const tl = gsap.timeline();
        tl.to(logoRef.current, { 
            scale: 0.8, 
            rotation: -10, 
            duration: 0.1 
        })
        .to(logoRef.current, { 
            scale: 1.5, 
            rotation: 15, 
            duration: 0.4, 
            ease: "back.out(2)" 
        })
        .to(logoRef.current, { 
            scale: 1, 
            rotation: 0, 
            duration: 0.5, 
            ease: "elastic.out(1, 0.3)" 
        });
    };

    // Dribbble-style Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 40, opacity: 0 },
        visible: { 
            y: 0, opacity: 1,
            transition: { type: 'spring', stiffness: 100, damping: 20 }
        }
    };

    const floatVariants = {
        animate: {
            y: [0, -20, 0],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
    };
    const [currentSectorIndex, setCurrentSectorIndex] = useState(0);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    
    // Smart Booking Widget State
    const [bookingStep, setBookingStep] = useState(1);
    const [selectedWidgetSector, setSelectedWidgetSector] = useState(null);
    const [selectedWidgetService, setSelectedWidgetService] = useState(null);

    const heroSectors = [
        { label: 'Healthcare', icon: <Heart size={16} />, image: '/healthcare.png' },
        { label: 'Education', icon: <GraduationCap size={16} />, image: 'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { label: 'Salon & Beauty', icon: <Sparkles size={16} />, image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { label: 'Hospitality', icon: <HotelIcon size={16} />, image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { label: 'Corporate', icon: <Briefcase size={16} />, image: '/corporate.png' },
        { label: 'Automobile', icon: <Car size={16} />, image: 'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { label: 'Fitness', icon: <Dumbbell size={16} />, image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { label: 'Legal', icon: <Gavel size={16} />, image: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { label: 'Property', icon: <HomeIcon size={16} />, image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { label: 'Repair Services', icon: <Wrench size={16} />, image: 'https://images.pexels.com/photos/4116713/pexels-photo-4116713.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { label: 'Events', icon: <Music size={16} />, image: '/sector_venues_real.png' },
        { label: 'Retail', icon: <ShoppingCart size={16} />, image: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { label: 'Consultancy', icon: <Briefcase size={16} />, image: '/sector_freelancer_real.png' }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSectorIndex(prev => (prev + 1) % heroSectors.length);
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [heroSectors.length]);

    // Removed Live Stats Counter Effect scroll forcing to prevent layout trashing

    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Jellyfish Splash Screen Timeout
        const timer = setTimeout(() => setShowSplash(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!showSplash) {
            // Jellyfish GSAP Entrance Animation (Blobs)
            gsap.to("#jelly-1", {
                x: "random(-100, 100)",
                y: "random(-100, 100)",
                scale: "random(0.8, 1.2)",
                duration: 10,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
            gsap.to("#jelly-2", {
                x: "random(-150, 150)",
                y: "random(-150, 150)",
                scale: "random(0.7, 1.3)",
                duration: 15,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
            gsap.to("#jelly-3", {
                x: "random(-120, 120)",
                y: "random(-120, 120)",
                scale: "random(0.9, 1.1)",
                duration: 12,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Shooting Lines Animation
            [0,1,2,3,4,5].forEach(i => {
                const animateLine = () => {
                    gsap.fromTo(`#line-${i}`, 
                        { x: -500, opacity: 0 },
                        { 
                            x: window.innerWidth + 500, 
                            opacity: 0.8, 
                            duration: Math.random() * 3 + 2, 
                            delay: Math.random() * 5,
                            ease: "none",
                            onComplete: animateLine 
                        }
                    );
                };
                animateLine();
            });

            // Entrance Stagger for Cards (Removed GSAP to avoid conflict with Framer Motion)
        }
    }, [showSplash]);


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
        <>
            {/* Removed AnimatePresence for scroll stability */}

            <div style={{ 
                background: theme.bgSecondary, 
                minHeight: '100vh', 
                color: theme.text, 
                fontFamily: "'Outfit', sans-serif",
                position: 'relative',
                transition: 'background 0.5s ease, color 0.5s ease'
            }}>
            {/* 🌌 DYNAMIC BACKGROUND BLOBS */}
            {/* Dynamic Blobs removed for performance and scroll reliability */}
            
            <style>{`
                ::selection { background: rgba(217, 119, 6, 0.3); color: white; }
                .glass-nav {
                    background: ${isDarkMode ? 'rgba(16, 36, 27, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid ${theme.cardBorder};
                }
                .feature-card {
                    background: ${theme.card};
                    border: 1px solid ${theme.cardBorder};
                    border-radius: 40px;
                    padding: 56px 48px;
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    text-align: left;
                }
                .feature-card:hover {
                    background: ${theme.cardHover};
                    transform: translateY(-12px);
                    box-shadow: 0 30px 60px ${theme.cardGlow};
                    border-color: ${theme.accent};
                }
                .icon-box {
                    background: ${theme.iconBg};
                    color: ${theme.iconColor};
                    width: 72px;
                    height: 72px;
                    border-radius: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 32px;
                    transition: all 0.4s ease;
                    border: 1px solid ${theme.cardBorder};
                }
                .feature-card:hover .icon-box {
                    transform: scale(1.1) rotate(-5deg);
                    background: ${theme.accent};
                    color: #000;
                }
                .jelly-blob {
                    position: absolute;
                    filter: blur(80px);
                    border-radius: 50%;
                    opacity: 0.4;
                    pointer-events: none;
                }
                .gradient-text {
                    background: linear-gradient(to right, #B76E79, #5A315D);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                @keyframes shine {
                    to { background-position: 200% center; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animated-bg {
                    position: absolute;
                    width: 100%;
                    height: 100%;
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
                .shooting-line {
                    position: absolute;
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
                    height: 1px;
                    pointer-events: none;
                    z-index: 1;
                }
            `}</style>
            
            {/* Neutral Background Blobs */}
            <div className="animated-bg">
                <div className="jelly-blob" id="jelly-1" style={{ background: 'rgba(90, 49, 93, 0.2)', width: '600px', height: '600px', top: '-200px', left: '-200px' }} />
                <div className="jelly-blob" id="jelly-2" style={{ background: 'rgba(183, 110, 121, 0.15)', width: '400px', height: '400px', top: '10%', right: '-100px' }} />
                <div className="jelly-blob" id="jelly-3" style={{ background: 'rgba(255, 255, 255, 0.05)', width: '500px', height: '500px', bottom: '-150px', left: '20%' }} />
                
                {/* Shooting Lines */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="shooting-line" id={`line-${i}`} style={{ width: Math.random() * 200 + 100 + 'px', top: Math.random() * 100 + '%', left: '-20%' }} />
                ))}
            </div>

            {/* 1. NAVBAR (Glassmorphism) */}
            <header className="glass-nav" style={{ position: 'absolute', top: 0, width: '100%', zIndex: 1000, transition: 'all 0.3s' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '80px', padding: '0 40px', maxWidth: '1400px', margin: '0 auto' }}>
                    <Link to="/" onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', flexShrink: 0 }}>
                        <div ref={logoRef} style={{ padding: '4px', borderRadius: '12px', display: 'flex', background: 'white' }}>
                             <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1' }}>
                            <span style={{ fontSize: '20px', fontWeight: 950, color: theme.text, letterSpacing: '-0.5px', textTransform: 'uppercase', marginBottom: '2px', display: 'block', whiteSpace: 'nowrap' }}>Forge India</span>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#D97706', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', whiteSpace: 'nowrap' }}>Connect Pvt Ltd</span>
                        </div>
                    </Link>

                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <nav className="nav-links-desktop" style={{ display: 'flex', gap: '32px', alignItems: 'center', fontWeight: 600, color: theme.gray }}>
                            {['Solutions', 'Features', 'Pricing', 'Resources'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s', fontSize: '15px' }} onMouseEnter={(e)=>e.target.style.color=theme.text} onMouseLeave={(e)=>e.target.style.color=theme.gray}>{item}</a>
                            ))}
                        </nav>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '8px' }}>
                            {user ? (
                                <Link to="/dashboard" style={{ 
                                    background: theme.accent, color: theme.bg, 
                                    borderRadius: '14px', padding: '12px 28px', fontWeight: 800, textDecoration: 'none',
                                    fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                                    transition: 'all 0.3s', boxShadow: isDarkMode ? 'none' : '0 10px 20px rgba(0,0,0,0.1)'
                                }}>
                                    Dashboard <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" style={{ 
                                        color: theme.text, fontWeight: 700, textDecoration: 'none', 
                                        padding: '10px 16px', fontSize: '14px', transition: 'opacity 0.2s'
                                    }}>Log In</Link>
                                    <Link to="/register" style={{ 
                                        background: theme.accent, color: theme.bg, 
                                        borderRadius: '14px', padding: '12px 28px', fontWeight: 800, textDecoration: 'none',
                                        fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                                        transition: 'all 0.3s', boxShadow: isDarkMode ? 'none' : '0 10px 20px rgba(0,0,0,0.1)'
                                    }} onMouseEnter={(e)=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={(e)=>e.currentTarget.style.transform='translateY(0)'}>
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ paddingTop: '80px', position: 'relative', zIndex: 1 }}>
                
                {/* 2. ANIMATED HERO SECTION */}
                <section style={{ padding: '140px 24px 80px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    
                    {/* Floating Icons Background */}
                    <motion.div animate={floatingAnim} style={{ position: 'absolute', top: '15%', left: '10%', background: 'rgba(253, 251, 247, 0.3)', padding: '16px', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(90, 49, 93, 0.2)' }}>
                        <Calendar size={32} color="#B76E79" />
                    </motion.div>
                    <motion.div animate={floatingAnim} transition={{ delay: 1 }} style={{ position: 'absolute', top: '20%', right: '10%', background: 'rgba(253, 251, 247, 0.3)', padding: '16px', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(90, 49, 93, 0.2)' }}>
                        <Sparkles size={32} color="#B76E79" />
                    </motion.div>
                    <motion.div animate={floatingAnim} transition={{ delay: 0.5 }} style={{ position: 'absolute', bottom: '15%', left: '45%', background: 'rgba(253, 251, 247, 0.3)', padding: '16px', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(90, 49, 93, 0.2)' }}>
                        <Users size={32} color="#5A315D" />
                    </motion.div>

                    <div className="container" style={{ 
                        maxWidth: '1400px', 
                        margin: '0 auto', 
                        position: 'relative', 
                        zIndex: 10, 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: '60px', 
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        
                        {/* Left Side: Heading */}
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ textAlign: 'left', flex: '1 1 500px', minWidth: '300px' }}
                        >
                            <div style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                                background: 'rgba(90, 49, 93, 0.1)', padding: '8px 24px', 
                                borderRadius: '100px', border: '1px solid rgba(90, 49, 93, 0.2)',
                                marginBottom: '40px', fontSize: '13px', fontWeight: 900, color: '#B76E79',
                                letterSpacing: '2px', textTransform: 'uppercase'
                            }}>
                                <Rocket size={14} /> The Future of Booking Systems
                            </div>
                            
                            <h1 style={{ fontSize: '72px', fontWeight: 950, lineHeight: 1.05, marginBottom: '28px', letterSpacing: '-3px' }}>
                                Book Services <br />
                                <span style={{ color: theme.secondary }}>Anytime, Anywhere.</span>
                            </h1>
                            
                            <p style={{ fontSize: '20px', color: theme.textMuted, maxWidth: '600px', marginBottom: '56px', lineHeight: 1.6, fontWeight: 500 }}>
                                Seamlessly manage appointments, staff, and clients with our premium AI-driven scheduling platform built for modern businesses.
                            </p>
                            
                             <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                <Link to="/register" style={{ 
                                    background: 'linear-gradient(135deg, #5A315D 0%, #B76E79 100%)', 
                                    color: '#FFFFFF', 
                                    height: '64px', padding: '0 40px', borderRadius: '20px', fontWeight: 900,
                                    fontSize: '18px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 20px 40px -10px rgba(90, 49, 93, 0.4)'
                                }} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 25px 50px -12px rgba(90, 49, 93, 0.5)';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 20px 40px -10px rgba(90, 49, 93, 0.4)';}}>
                                    Get Started for Free <ArrowRight size={20} />
                                </Link>

                                <a href="#demo" style={{ 
                                    height: '64px', background: 'rgba(253, 251, 247, 0.4)', color: theme.text, 
                                    padding: '0 40px', borderRadius: '20px', fontWeight: 800,
                                    fontSize: '18px', border: '1px solid rgba(90, 49, 93, 0.3)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '12px', backdropFilter: 'blur(10px)',
                                    textDecoration: 'none', transition: 'all 0.3s'
                                }} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(253, 251, 247, 0.6)'} onMouseLeave={(e)=>e.currentTarget.style.background='rgba(253, 251, 247, 0.4)'}>
                                    <Play size={20} /> Try Live Demo
                                </a>
                            </div>
                        </motion.div>

                        {/* Right Side: Animated Image */}
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: 0.4, duration: 1, type: "spring" }}
                            style={{ position: 'relative', flex: '1 1 400px', minWidth: '300px' }}
                        >
                            <motion.div 
                                animate={{ y: [0, -20, 0] }} 
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ position: 'relative' }}
                            >
                                <div style={{ position: 'absolute', inset: '-20px', background: 'linear-gradient(180deg, rgba(90, 49, 93, 0.2) 0%, rgba(183, 110, 121, 0.2) 100%)', filter: 'blur(50px)', borderRadius: '40px', zIndex: -1 }} />
                                <div style={{ 
                                    background: theme.card, borderRadius: '48px', padding: '40px', 
                                    border: `2px solid ${theme.cardBorder}`, boxShadow: `0 30px 60px rgba(0,0,0,0.4)`,
                                    position: 'relative'
                                }}>
                                <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(217, 119, 6, 0.05)', borderRadius: '24px' }}>
                                    <Calendar size={120} color={theme.primary} opacity={0.2} />
                                </div>
                                    
                                    {/* Overlay elements */}
                                    <motion.div 
                                        animate={{ x: [0, 10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        style={{ position: 'absolute', top: '40px', right: '40px', background: theme.bgSecondary, padding: '16px 24px', borderRadius: '20px', border: `1px solid ${theme.cardBorder}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '10px', height: '10px', background: '#22C55E', borderRadius: '50%' }} />
                                            <div style={{ fontWeight: 800, fontSize: '14px', color: theme.text }}>Live Appointment</div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* 1.5 MOBILE APP SECTION */}
                <section style={{ padding: '120px 24px', background: theme.bgSecondary, borderTop: '1px solid rgba(90, 49, 93,0.2)' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '60px' }}>
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            style={{ flex: 1, minWidth: '400px' }}
                        >
                            <h2 style={{ fontSize: '56px', fontWeight: 950, color: theme.text, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-2px' }}>
                                Manage appointments <br />
                                <span style={{ color: theme.secondary }}>on the go</span>
                            </h2>
                            <p style={{ color: theme.textMuted, fontSize: '20px', lineHeight: 1.6, marginBottom: '40px', maxWidth: '480px' }}>
                                Gain complete control of your schedule, all just a click away. Access your dashboard from anywhere.
                            </p>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: theme.text, cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={(e)=>e.currentTarget.style.borderColor=theme.primary} onMouseLeave={(e)=>e.currentTarget.style.borderColor=theme.cardBorder}>
                                    <div style={{ fontSize: '24px' }}>🍎</div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '10px', color: theme.textMuted }}>Download on the</div>
                                        <div style={{ fontSize: '16px', fontWeight: 700 }}>App Store</div>
                                    </div>
                                </button>
                                <button style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: theme.text, cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={(e)=>e.currentTarget.style.borderColor=theme.primary} onMouseLeave={(e)=>e.currentTarget.style.borderColor=theme.cardBorder}>
                                    <div style={{ fontSize: '24px' }}>▶️</div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '10px', color: theme.textMuted }}>GET IT ON</div>
                                        <div style={{ fontSize: '16px', fontWeight: 700 }}>Google Play</div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, type: 'spring' }}
                            style={{ flex: 1, minWidth: '400px', position: 'relative' }}
                        >
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0, opacity: 0.2 }}>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0, opacity: 0.1 }}>
                                <Smartphone size={400} color={theme.secondary} />
                            </div>
                            </div>
                            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ background: theme.card, padding: '24px', borderRadius: '48px', border: `8px solid ${theme.cardBorder}`, boxShadow: `0 30px 60px ${theme.cardGlow}`, maxWidth: '320px', margin: '0 auto', position: 'relative' }}>
                                    {/* Mockup screen */}
                                    <div style={{ background: theme.card, borderRadius: '32px', height: '600px', overflow: 'hidden', position: 'relative' }}>
                                        <div style={{ background: theme.bgSecondary, padding: '40px 20px 20px', color: theme.text }}>
                                            <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>November 2026</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                                {[27, 28, 29, 30, 1].map((d, i) => (
                                                    <div key={i} style={{ textAlign: 'center', padding: '8px', background: i === 2 ? theme.secondary : 'transparent', borderRadius: '12px' }}>
                                                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{['M','T','W','T','F'][i]}</div>
                                                        <div style={{ fontSize: '16px', fontWeight: 700 }}>{d}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 800, color: theme.text, marginBottom: '16px' }}>My Appointments</div>
                                            <div style={{ background: theme.bgSecondary, padding: '16px', borderRadius: '16px', marginBottom: '12px' }}>
                                                <div style={{ color: theme.primary, fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>10:30 AM - 11:00 AM</div>
                                                <div style={{ color: theme.text, fontWeight: 700 }}>John Smith</div>
                                                <div style={{ color: theme.textMuted, fontSize: '12px' }}>Tax Planning</div>
                                            </div>
                                            <div style={{ background: theme.bgSecondary, padding: '16px', borderRadius: '16px' }}>
                                                <div style={{ color: theme.secondary, fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>11:00 AM - 11:45 AM</div>
                                                <div style={{ color: theme.text, fontWeight: 700 }}>Isabella</div>
                                                <div style={{ color: theme.textMuted, fontSize: '12px' }}>Introductory Call</div>
                                            </div>
                                        </div>
                                        <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: theme.secondary, width: '56px', height: '56px', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '24px', boxShadow: `0 10px 20px ${theme.cardGlow}` }}>+</div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                    </div>
                </section>

                {/* 1.75 BANNER SECTION */}
                <section style={{ padding: '80px 24px', background: theme.card, textAlign: 'center', borderTop: `1px solid ${theme.cardBorder}`, borderBottom: `1px solid ${theme.cardBorder}` }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 style={{ fontSize: '48px', fontWeight: 950, color: theme.text, letterSpacing: '-1px', maxWidth: '800px', margin: '0 auto', lineHeight: 1.2 }}>
                            A scheduling app that works <br/>
                            <span style={{ color: theme.secondary }}>24/7 for your business!</span>
                        </h2>
                    </motion.div>
                </section>
                {/* 2. FEATURES GRID */}
                <section id="features" style={{ padding: '120px 24px', background: '#0A0E0C', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(90, 49, 93, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}
                    >
                        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <h2 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: theme.secondary, marginBottom: '20px' }}>Our Core Pillars</h2>
                            <h3 style={{ fontSize: '64px', fontWeight: 950, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-3px', marginBottom: '24px' }}>Built for <span style={{ color: theme.primary }}>Excellence.</span></h3>
                            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '20px', maxWidth: '600px', margin: '0 auto' }}>Everything you need to scale your business in one unified, high-performance ecosystem.</p>
                        </motion.div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                            {[
                                { icon: <Clock size={32} />, title: "Instant Booking", desc: "Automate your schedule 24/7. Let clients book from anywhere, anytime." },
                                { icon: <Users size={32} />, title: "Team Control", desc: "Manage staff shifts, availability, and performance in one sleek dashboard." },
                                { icon: <Shield size={32} />, title: "Secure Payments", desc: "Process transactions safely with integrated global payment gateways." },
                                { icon: <BarChart3 size={32} />, title: "Live Analytics", desc: "Track growth and trends with real-time data visualization." },
                                { icon: <Bell size={32} />, title: "Smart Alerts", desc: "Automated SMS & Email reminders to eliminate missed slots." },
                                { icon: <CreditCard size={32} />, title: "Invoice Automation", desc: "Generate professional invoices instantly after every appointment." }
                            ].map((feature, i) => (
                                <div key={i} className="feature-card">
                                    <div className="icon-box">
                                        {feature.icon}
                                    </div>
                                    <h4 style={{ fontSize: '24px', fontWeight: 900, color: theme.text, marginBottom: '16px', letterSpacing: '-0.5px' }}>{feature.title}</h4>
                                    <p style={{ color: theme.textMuted, fontSize: '16px', lineHeight: 1.7, fontWeight: 500 }}>{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* 2.5 LAPTOP DASHBOARD SECTION */}
                <section style={{ padding: '120px 24px', background: theme.bgSecondary, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(90, 49, 93,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ marginBottom: '60px' }}
                        >
                            <h2 style={{ fontSize: '48px', fontWeight: 950, color: theme.text, marginBottom: '16px', letterSpacing: '-1px' }}>
                                Next Level <span style={{ color: theme.primary }}>Synergy Dashboard</span>
                            </h2>
                            <p style={{ color: theme.textMuted, fontSize: '20px', maxWidth: '700px', margin: '0 auto' }}>
                                A stunning, intuitive interface that gives you full visibility into your revenue, traffic, and upcoming appointments.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 50 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
                            style={{ position: 'relative', display: 'inline-block' }}
                        >
                            {/* Replace the image source with a local or fallback image */}
                            <img src="/laptop_mockup.jpg" onError={(e) => { e.target.src = 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200'; }} alt="Laptop Dashboard" style={{ width: '100%', maxWidth: '1000px', borderRadius: '24px', boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }} />
                            
                            {/* Floating Card Animation overlay on the laptop */}
                            <motion.div 
                                animate={{ y: [-10, 10, -10] }} 
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ position: 'absolute', top: '10%', left: '-5%', background: theme.bg, padding: '20px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(90, 49, 93,0.3)', display: 'flex', alignItems: 'center', gap: '16px' }}
                            >
                                <div style={{ width: '48px', height: '48px', background: theme.secondary, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Calendar size={24} color="white" />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ color: theme.text, fontWeight: 800 }}>Meeting Scheduled</div>
                                    <div style={{ color: '#A7F3D0', fontSize: '12px' }}>Today, 2:00 PM</div>
                                </div>
                            </motion.div>

                            <motion.div 
                                animate={{ y: [10, -10, 10] }} 
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ position: 'absolute', bottom: '10%', right: '-5%', background: theme.text, padding: '20px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(90, 49, 93, 0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}
                            >
                                <div style={{ width: '48px', height: '48px', background: theme.border, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Activity size={24} color="#5A315D" />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ color: theme.text, fontWeight: 800 }}>Revenue Spike</div>
                                    <div style={{ color: theme.primary, fontSize: '12px' }}>+19% this week</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* 2.75 AI SCHEDULING SECTION */}
                <section style={{ padding: '120px 24px', background: theme.bgSecondary }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ background: theme.bgSecondary, borderRadius: '32px', border: '1px solid rgba(90, 49, 93,0.2)', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* Left Text */}
                            <div style={{ flex: '1 1 400px', padding: '60px', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: theme.secondary }} />
                                <h3 style={{ fontSize: '36px', fontWeight: 950, color: theme.text, marginBottom: '16px', lineHeight: 1.2 }}>
                                    Enhance appointment scheduling with <span style={{ color: theme.primary }}>AI</span>
                                </h3>
                                <h4 style={{ fontSize: '20px', fontWeight: 800, color: theme.secondary, marginBottom: '24px' }}>AI-powered setup</h4>
                                <p style={{ color: theme.textMuted, fontSize: '18px', lineHeight: 1.6, marginBottom: '40px' }}>
                                    Our AI makes it even easier to start scheduling meetings. It contextually customizes your labels for staff, resources, and meeting types in your appointment booking dashboard so that the details align with your business. Customize this content as needed for a booking setup that works the way you need it to.
                                </p>
                                <button style={{ background: theme.primary, color: theme.text, border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e)=>e.currentTarget.style.background=theme.primary} onMouseLeave={(e)=>e.currentTarget.style.background=theme.primary}>
                                    LEARN MORE &rarr;
                                </button>
                            </div>
                            
                            {/* Right Video */}
                            <div style={{ flex: '1 1 500px', padding: '40px', background: 'rgba(253, 251, 247, 0.1)', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ borderRadius: '24px', overflow: 'hidden', border: '4px solid #1E293B', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: '100%' }}>
                                    <img 
                                        src="https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200" 
                                        alt="AI Scheduling Interface"
                                        style={{ width: '100%', display: 'block' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. REAL-TIME STATS COUNTER */}
                <section style={{ 
                    padding: '120px 24px', 
                    background: theme.bgSecondary,
                    borderTop: '1px solid rgba(90, 49, 93,0.2)', 
                    borderBottom: '1px solid rgba(90, 49, 93,0.2)'
                }}>
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '60px' }}
                    >
                        {[
                            { label: "Appointments", value: stats.appointments, color: theme.secondary },
                            { label: "Businesses", value: stats.clients, color: theme.primary },
                            { label: "Services", value: stats.services, color: theme.accent }
                        ].map((stat, i) => (
                            <motion.div key={i} variants={itemVariants} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '80px', fontWeight: 950, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '-4px', lineHeight: 1 }}>
                                    <Counter value={stat.value} /> <span style={{ color: stat.color }}>+</span>
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', marginTop: '24px' }}>{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* 4. SMART BOOKING WIDGET (Live Demo) */}
                <section id="demo" style={{ padding: '120px 24px', position: 'relative' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2 style={{ fontSize: '42px', fontWeight: 950, color: theme.text, marginBottom: '16px' }}>Experience the Magic</h2>
                            <p style={{ color: theme.textMuted, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Try our seamless booking flow right here. No login required.</p>
                        </div>

                        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', borderRadius: '32px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: theme.border }}>
                                <div style={{ height: '100%', background: theme.secondary, width: `${(bookingStep / 3) * 100}%`, transition: 'width 0.3s ease' }} />
                            </div>

                            <AnimatePresence mode="wait">
                                {bookingStep === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', background: theme.secondary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>1</div>
                                            Select Your Sector
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                                            {heroSectors.slice(0, 8).map((sector, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => { setSelectedWidgetSector(sector); setBookingStep(2); }}
                                                    style={{ 
                                                        background: theme.card, border: `1px solid ${theme.cardBorder}`, 
                                                        padding: '20px', borderRadius: '16px', color: theme.text, cursor: 'pointer',
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                                                        transition: 'all 0.2s',
                                                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                                                    }}
                                                    onMouseEnter={(e)=>{e.currentTarget.style.background=theme.cardHover; e.currentTarget.style.boxShadow=`0 10px 20px ${theme.cardGlow}`;}}
                                                    onMouseLeave={(e)=>{e.currentTarget.style.background=theme.card; e.currentTarget.style.boxShadow='0 4px 6px rgba(0,0,0,0.05)';}}
                                                >
                                                    <div style={{ color: theme.iconColor }}>{sector.icon}</div>
                                                    <span style={{ fontWeight: 600, fontSize: '14px', color: theme.text }}>{sector.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {bookingStep === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', background: theme.secondary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>2</div>
                                            Select Service
                                        </h3>
                                        
                                        {/* Healthcare Specific Animation */}
                                        {(selectedWidgetSector?.title?.toLowerCase() === 'healthcare' || selectedWidgetSector?.title?.toLowerCase() === 'hospital') && (
                                            <div style={{ height: '150px', background: '#F8FAFC', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                                            <div style={{ height: '150px', background: 'rgba(90, 49, 93, 0.05)', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Activity size={60} color={theme.secondary} opacity={0.3} />
                                            </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                            {selectedWidgetSector?.demoServices.map((service, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => setBookingStep(3)}
                                                    style={{ 
                                                        background: theme.card, border: `1px solid ${theme.cardBorder}`, 
                                                        padding: '20px', borderRadius: '16px', color: theme.text, cursor: 'pointer',
                                                        textAlign: 'left', transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = theme.cardHover; e.currentTarget.style.borderColor = theme.iconColor; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = theme.card; e.currentTarget.style.borderColor = theme.cardBorder; }}
                                                >
                                                    <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px', color: theme.text }}>{service}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: theme.textMuted, fontWeight: 600 }}>
                                                        <Clock size={14} /> 45 Mins
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => setBookingStep(1)} style={{ marginTop: '24px', background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontWeight: 600 }}>← Back</button>
                                    </motion.div>
                                )}

                                {bookingStep === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <div style={{ width: '80px', height: '80px', background: theme.border, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: theme.primary }}>
                                            <Check size={40} />
                                        </div>
                                        <h3 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>Preview Complete!</h3>
                                        <p style={{ color: theme.textMuted, fontSize: '16px', maxWidth: '400px', margin: '0 auto 32px' }}>
                                            You just experienced how fast your customers can book {selectedWidgetService} using our platform.
                                        </p>
                                        <Link to="/register" style={{ 
                                            background: theme.secondary, color: theme.text, padding: '16px 32px', 
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

                {/* 5. INDUSTRY SECTORS SECTION */}
                <section id="industries" style={{ padding: '120px 24px', background: theme.bgSecondary }}>
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}
                    >
                        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <h2 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '3px', color: theme.primary, marginBottom: '16px' }}>Industries</h2>
                            <h3 style={{ fontSize: '56px', fontWeight: 950, color: theme.text, lineHeight: 1, letterSpacing: '-2px' }}>Versatile <br /> <span style={{ color: theme.secondary }}>Excellence.</span></h3>
                        </motion.div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                            {[
                                { icon: <Building2 />, name: "Corporate", img: "/corporate.png" },
                                { icon: <Heart />, name: "Healthcare", img: "/healthcare.png" },
                                { icon: <GraduationCap />, name: "Education", img: "/hero_office_desk_real.png" },
                                { icon: <Scissors />, name: "Beauty & Spa", img: "/services.png" },
                                { icon: <Dumbbell />, name: "Fitness", img: "/sector_freelancer_real.png" },
                                { icon: <HotelIcon />, name: "Hospitality", img: "/sector_venues_real.png" }
                            ].map((sector, i) => (
                                <motion.div 
                                    key={i} 
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, borderColor: theme.iconColor, boxShadow: `0 10px 30px ${theme.cardGlow}` }}
                                    style={{ 
                                        position: 'relative', height: '400px', borderRadius: '32px', overflow: 'hidden', 
                                        cursor: 'pointer', border: `1px solid ${theme.cardBorder}`,
                                        background: theme.card,
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <img src={sector.img} alt={sector.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px', background: `linear-gradient(to top, ${theme.card}, transparent)` }}>
                                        <div style={{ color: theme.iconColor, marginBottom: '12px' }}>{sector.icon}</div>
                                        <h4 style={{ color: theme.text, fontSize: '24px', fontWeight: 900 }}>{sector.name}</h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* 5.5 GLOBAL MAP SECTION */}
                <section style={{ padding: '120px 24px', background: theme.bgSecondary, position: 'relative', overflow: 'hidden' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
                            <motion.div 
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 style={{ fontSize: '56px', fontWeight: 950, color: theme.text, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-2px' }}>
                                    <span style={{ color: theme.secondary }}>16M+</span> appointments scheduled around the world
                                </h2>
                                <p style={{ color: theme.textMuted, fontSize: '20px', lineHeight: 1.6, marginBottom: '40px' }}>
                                    With a new appointment scheduled every <span style={{ color: theme.primary, fontWeight: 700 }}>4 seconds</span>.
                                </p>
                                <Link to="/register" style={{ 
                                    background: theme.primary, color: theme.text, padding: '16px 32px', borderRadius: '12px', 
                                    fontSize: '16px', fontWeight: 800, textDecoration: 'none', display: 'inline-block',
                                    transition: 'all 0.3s', boxShadow: '0 10px 20px rgba(90, 49, 93, 0.3)'
                                }} onMouseEnter={(e)=>e.currentTarget.style.background=theme.primary} onMouseLeave={(e)=>e.currentTarget.style.background=theme.primary}>
                                    REQUEST A DEMO &rarr;
                                </Link>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                style={{ position: 'relative', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {/* Dotted Map Background */}
                                <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(90, 49, 93,0.2) 0%, transparent 60%)' }} />
                                <Globe size={300} color="rgba(90, 49, 93,0.1)" strokeWidth={1} style={{ position: 'absolute' }} />
                                
                                {/* Floating Pins */}
                                <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '30%', left: '20%' }}>
                                    <div style={{ width: '20px', height: '20px', background: theme.secondary, borderRadius: '50%', boxShadow: '0 0 20px #B76E79' }} />
                                </motion.div>
                                <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '60%', left: '40%' }}>
                                    <div style={{ width: '16px', height: '16px', background: theme.primary, borderRadius: '50%', boxShadow: '0 0 20px #5A315D' }} />
                                </motion.div>
                                <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '40%', right: '20%' }}>
                                    <div style={{ width: '24px', height: '24px', background: theme.primary, borderRadius: '50%', boxShadow: '0 0 20px #5A315D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '8px', height: '8px', background: theme.card, borderRadius: '50%' }} />
                                    </div>
                                    <div style={{ background: theme.card, color: 'black', padding: '8px 12px', borderRadius: '8px', position: 'absolute', top: '-50px', left: '-50px', whiteSpace: 'nowrap', fontWeight: 800, fontSize: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                                        <span style={{ color: theme.secondary }}>Tom Banks</span> <br/>
                                        <span style={{ fontSize: '10px', color: theme.textMuted }}>Product Consultation</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 5.75 PRICING SECTION */}
                <section id="pricing" style={{ padding: '120px 24px', background: theme.bgSecondary }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: '80px' }}
                        >
                            <h2 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '3px', color: theme.secondary, marginBottom: '16px' }}>Pricing Plans</h2>
                            <h3 style={{ fontSize: '56px', fontWeight: 950, color: theme.text, lineHeight: 1, letterSpacing: '-2px' }}>Choose Your <br /> <span style={{ color: theme.primary }}>Growth.</span></h3>
                        </motion.div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
                            {[
                                { name: 'Starter', price: '$0', desc: 'Perfect for small side-hustles.', features: ['1 Day Free Trial', '5 Appointments / Day', 'Single User', 'Basic Dashboard'] },
                                { name: 'Professional', price: '$29', desc: 'Best for growing businesses.', features: ['Unlimited Appointments', 'Team Management', 'Custom Branding', 'Advanced Analytics'], popular: true },
                                { name: 'Enterprise', price: '$99', desc: 'For high-end large scale ops.', features: ['Full Automation', 'AI Scheduling', 'Priority Support', 'Dedicated Manager'] }
                            ].map((plan, i) => (
                                <motion.div 
                                    key={i}
                                    variants={itemVariants}
                                    whileHover={{ y: -10, boxShadow: `0 30px 60px ${theme.cardGlow}` }}
                                    style={{ 
                                        background: theme.card, padding: '48px', borderRadius: '32px', 
                                        border: plan.popular ? `2px solid ${theme.secondary}` : `1px solid ${theme.cardBorder}`,
                                        position: 'relative', transition: 'all 0.3s'
                                    }}
                                >
                                    {plan.popular && <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: theme.secondary, color: '#FFFFFF', padding: '8px 24px', borderRadius: '99px', fontSize: '12px', fontWeight: 900, letterSpacing: '1px' }}>MOST POPULAR</div>}
                                    <h4 style={{ fontSize: '24px', fontWeight: 900, color: theme.text, marginBottom: '12px' }}>{plan.name}</h4>
                                    <div style={{ fontSize: '48px', fontWeight: 950, color: theme.text, marginBottom: '24px' }}>{plan.price}<span style={{ fontSize: '16px', color: theme.textMuted, fontWeight: 500 }}>/mo</span></div>
                                    <p style={{ color: theme.textMuted, marginBottom: '32px' }}>{plan.desc}</p>
                                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
                                        {plan.features.map((f, j) => (
                                            <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: theme.text, fontSize: '15px', fontWeight: 600 }}>
                                                <div style={{ color: theme.secondary }}><Check size={18}/></div> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to="/register" style={{ 
                                        display: 'block', textAlign: 'center', padding: '16px', borderRadius: '16px', 
                                        background: plan.popular ? theme.secondary : theme.bgSecondary, 
                                        color: plan.popular ? '#FFFFFF' : theme.text, 
                                        fontWeight: 900, textDecoration: 'none', transition: '0.3s'
                                    }}>Get Started</Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. CALL TO ACTION */}
                <section style={{ padding: '120px 24px', background: theme.bgSecondary, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div className="jelly-blob" style={{ background: theme.primary, width: '600px', height: '600px', top: '-300px', right: '-300px', opacity: 0.1 }} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="container" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}
                    >
                        <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(56px, 10vw, 120px)', fontWeight: 950, color: theme.text, lineHeight: 0.85, letterSpacing: '-6px', marginBottom: '40px', fontFamily: "'Playfair Display', serif" }}>
                            Book Services <br />
                            <span style={{ color: theme.primary }}>Anytime, Anywhere.</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} style={{ fontSize: '24px', color: theme.textMuted, maxWidth: '800px', margin: '0 auto 56px', lineHeight: 1.5, fontWeight: 500 }}>
                            Book appointments, manage schedules, and grow your business with our all-in-one smart booking platform.
                        </motion.p>

                        <motion.div variants={itemVariants} style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" style={{ 
                                background: theme.primary, color: '#FFFFFF', padding: '24px 56px', borderRadius: '20px', 
                                fontSize: '20px', fontWeight: 950, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px',
                                transition: 'all 0.3s', boxShadow: `0 20px 40px ${theme.cardGlow}`
                            }}>
                                Get Started Free <ArrowRight size={20} />
                            </Link>
                            <button style={{ 
                                background: theme.card, color: theme.text, padding: '24px 56px', borderRadius: '20px', 
                                border: `2px solid ${theme.cardBorder}`, fontSize: '20px', fontWeight: 950, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s'
                            }}>
                                Explore Features
                            </button>
                        </motion.div>
                    </motion.div>
                </section>
            </main>

            {/* FLOATING THEME TOGGLE (Bottom Left) */}
            <div style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 1000 }}>
                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    style={{ 
                        width: '60px', height: '60px', borderRadius: '20px', 
                        background: theme.card, backdropFilter: 'blur(15px)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid ' + theme.border, color: theme.text, 
                        cursor: 'pointer', transition: 'all 0.3s',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}
                >
                    {isDarkMode ? <Sparkles size={24} /> : <Moon size={24} />}
                </motion.button>
            </div>

            {/* ───────────────── FAQ SECTION ───────────────── */}
            <section style={{ padding: '120px 24px', background: theme.card }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '48px', fontWeight: 950, color: theme.text, marginBottom: '48px', textAlign: 'left', letterSpacing: '-1px' }}>FAQ</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            {
                                q: "1. How do I book an appointment?",
                                a: "You can easily book an appointment by selecting your preferred service, choosing an available time slot, and confirming your booking through the platform."
                            },
                            {
                                q: "🔹 2. Can I reschedule my appointment?",
                                a: "Yes, users can reschedule appointments based on service availability through the dashboard."
                            },
                            {
                                q: "🔹 3. Will I receive booking notifications?",
                                a: "Yes, the system sends appointment confirmations, reminders, and status updates through notifications."
                            },
                            {
                                q: "🔹 4. Is online payment available?",
                                a: "Yes, secure online payment options including QR payment support are available for selected services."
                            }
                        ].map((faq, i) => (
                            <div key={i} style={{ 
                                background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '16px', padding: '24px 32px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                            }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: theme.text, marginBottom: '12px' }}>{faq.q}</h3>
                                <p style={{ color: theme.textMuted, fontSize: '15px', lineHeight: 1.6 }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────── FOOTER ───────────────── */}
            <footer style={{ background: theme.bgSecondary, color: theme.text, position: 'relative', zIndex: 1 }}>

                {/* Main Footer Grid */}
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '72px 40px 48px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '64px' }}>

                        {/* Brand Column */}
                        <div>
                            <Link to="/" onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '20px' }}>
                                <div style={{ background: theme.primary, padding: '4px', borderRadius: '12px', display: 'flex' }}>
                                    <img src="/logo.png" alt="Logo" style={{ height: '30px', objectFit: 'contain' }} />
                                </div>
                                <span style={{ fontSize: '20px', fontWeight: 900, color: theme.text, letterSpacing: '-0.5px' }}>
                                    Forge India <span style={{ color: theme.secondary }}>Connect Pvt Ltd</span>
                                </span>
                            </Link>
                            <p style={{ color: theme.gray, fontSize: '15px', lineHeight: 1.75, maxWidth: '320px', marginBottom: '28px' }}>
                                Forge India Connect Pvt Ltd — The all-in-one scheduling platform built for every industry. Shaping the future of business management.
                            </p>
                            {/* Social Links */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {[
                                    { label: 'Twitter / X', href: '#', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                                    { label: 'LinkedIn', href: '#', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                                    { label: 'GitHub', href: '#', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
                                    { label: 'Instagram', href: '#', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> }
                                ].map(({ label, href, svg }) => (
                                    <a key={label} href={href} aria-label={label} style={{
                                        width: '42px', height: '42px', borderRadius: '12px',
                                        background: theme.cardHover, border: '1px solid rgba(90, 49, 93, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: theme.textMuted, textDecoration: 'none', transition: 'all 0.2s'
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = theme.secondary; e.currentTarget.style.color = theme.card; e.currentTarget.style.borderColor = theme.secondary; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = theme.cardHover; e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.border; }}
                                    >
                                        {svg}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: theme.secondary, marginBottom: '24px' }}>Product</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {[
                                    { label: 'Features', href: '#features' },
                                    { label: 'Live Demo', href: '#demo' },
                                    { label: 'Pricing', href: '#pricing' },
                                    { label: 'Industries', href: '#industries' },
                                    { label: 'Mini Website', href: '#mini-website' },
                                ].map(({ label, href }) => (
                                    <li key={label}>
                                        <a href={href} style={{ color: theme.textMuted, textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.target.style.color = theme.text}
                                            onMouseLeave={e => e.target.style.color = theme.textMuted}
                                        >{label}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: theme.secondary, marginBottom: '24px' }}>Company</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {[
                                    { label: 'About Us', to: '/about', desc: 'Company details, mission, vision, platform purpose' },
                                    { label: 'Careers', to: '/careers', desc: 'Job openings, internship, apply form' },
                                    { label: 'Blog', to: '/blog', desc: 'Appointment tips, product updates, business articles' },
                                    { label: 'Press Kit', to: '/press', desc: 'Logo, brand colors, company profile, screenshots' },
                                    { label: 'Contact', to: '/contact', desc: 'Contact form, email, phone, address' },
                                ].map(({ label, to, desc }) => (
                                    <li key={label} title={desc}>
                                        <Link to={to} style={{ color: theme.gray, textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.target.style.color = theme.accent}
                                            onMouseLeave={e => e.target.style.color = theme.gray}
                                        >{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact & Legal */}
                        <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: theme.secondary, marginBottom: '24px' }}>Support & Legal</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {[
                                    { label: 'Help Center', to: '/help', desc: 'FAQ, how to book, payment help, dashboard guide' },
                                    { label: 'Privacy Policy', to: '/privacy', desc: 'User data safety, security, privacy details' },
                                    { label: 'Terms of Service', to: '/terms', desc: 'Website rules, booking rules, payment/cancel policy' },
                                    { label: 'Cookie Policy', to: '/cookies', desc: 'Cookie usage and user tracking details' },
                                    { label: 'Status Page', to: '/status', desc: 'Server status, payment status, booking system status' },
                                ].map(({ label, to, desc }) => (
                                    <li key={label} title={desc}>
                                        <Link to={to} style={{ color: theme.gray, textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.target.style.color = theme.accent}
                                            onMouseLeave={e => e.target.style.color = theme.gray}
                                        >{label}</Link>
                                    </li>
                                ))}
                            </ul>

                            {/* Contact Info */}
                            <div style={{ marginTop: '32px', padding: '20px', background: theme.cardHover, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                                <div style={{ color: theme.textMuted, fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>📧 Email us</div>
                                <a href="mailto:support@smartsched.com" style={{ color: theme.secondary, fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                                    support@smartsched.com
                                </a>
                                <div style={{ color: theme.textMuted, fontSize: '13px', fontWeight: 600, marginTop: '12px', marginBottom: '8px' }}>📞 Call us</div>
                                <a href="tel:+918000000000" style={{ color: theme.secondary, fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                                    +91 80000 00000
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div style={{ borderTop: '1px solid ' + theme.border, paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
                        <div style={{ color: theme.gray, fontSize: '15px', fontWeight: 600 }}>
                            &copy; {new Date().getFullYear()} <span style={{ color: theme.text, fontWeight: 800 }}>Forge India Connect Pvt Ltd</span>. Built for the future.
                        </div>
                        <div style={{ display: 'flex', gap: '32px' }}>
                            {['Privacy', 'Terms', 'Cookies'].map(t => (
                                <Link key={t} to={`/${t.toLowerCase()}`} style={{ color: theme.gray, textDecoration: 'none', fontSize: '14px', fontWeight: 700, transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.target.style.color = theme.accent}
                                    onMouseLeave={e => e.target.style.color = theme.gray}
                                >{t}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
            </div>
        </>
    );
};

export default LandingPage;
