import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Calendar, Users, Shield, BarChart3, Clock, 
    Bell, CreditCard, ArrowRight, Play, Hospital,
    Building2, Briefcase, Scissors, ShoppingBag, Star, Settings,
    ChevronDown, CheckCircle, Zap, Globe, Sparkles, Rocket,
    Heart, GraduationCap, Hotel as HotelIcon, 
    Car, Dumbbell, Gavel, Home, Wrench, 
    Music, ShoppingCart, MessageCircle, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isYearly, setIsYearly] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);
    const [currentSectorIndex, setCurrentSectorIndex] = useState(0);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const heroSectors = [
        { label: 'Healthcare', icon: <Heart size={16} />, image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Education', icon: <GraduationCap size={16} />, image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Salon & Beauty', icon: <Sparkles size={16} />, image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Hospitality', icon: <HotelIcon size={16} />, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Corporate', icon: <Briefcase size={16} />, image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Automobile', icon: <Car size={16} />, image: 'https://images.unsplash.com/photo-1562426509-5044a121aa49?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Fitness', icon: <Dumbbell size={16} />, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Legal', icon: <Gavel size={16} />, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Property', icon: <Home size={16} />, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Repair Services', icon: <Wrench size={16} />, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Events', icon: <Music size={16} />, image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Retail', icon: <ShoppingCart size={16} />, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' },
        { label: 'Consultancy', icon: <Briefcase size={16} />, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80' }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSectorIndex(prev => (prev + 1) % heroSectors.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [heroSectors.length]);

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
            
            <style>{`
                @media (max-width: 968px) {
                    .nav-links-desktop { display: none !important; }
                    .hero-title { font-size: 36px !important; }
                    .hero-sub { font-size: 16px !important; }
                    .navbar-inner { padding: 0 20px !important; height: 70px !important; }
                    .hero-section { padding-top: 60px !important; }
                    .hero-image-container { min-height: 300px !important; height: auto !important; }
                    .hero-image-container img { height: 350px !important; }
                }
            `}</style>
            
            {/* 1. NAVBAR (Ultra Modern) */}
            <header style={{ 
                position: 'fixed', top: 0, width: '100%', zIndex: 1000, 
                background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div className="container navbar-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '90px', padding: '0 40px', maxWidth: '1400px', margin: '0 auto' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
                        <div style={{ background: 'white', padding: '6px', borderRadius: '12px', display: 'flex' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '32px' }} />
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: 950, color: 'white', letterSpacing: '-0.5px' }}>Smart<span style={{ color: '#818CF8' }}>Scheduler</span></span>
                    </Link>

                    <nav className="nav-links-desktop" style={{ display: 'flex', gap: '40px', alignItems: 'center', fontWeight: 600, color: '#94A3B8' }}>
                        <a href="#features" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}>Features</a>
                        <a href="#industries" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}>Industries</a>
                        <a href="#pricing" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}>Pricing</a>
                        <a href="#faq" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}>FAQ</a>
                    </nav>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <Link className="nav-links-desktop" to="/login" style={{ color: 'white', fontWeight: 700, textDecoration: 'none', padding: '12px 24px', fontSize: '15px' }}>Sign In</Link>
                        <Link to="/register" style={{ 
                            background: 'white', color: '#0F172A', 
                            borderRadius: '14px', padding: '12px 28px', fontWeight: 800, textDecoration: 'none',
                            fontSize: '15px', transition: 'transform 0.2s, box-shadow 0.2s'
                        }}>Get Started</Link>
                    </div>
                </div>
            </header>

            <main style={{ paddingTop: '90px' }}>
                
                {/* 2. HERO SECTION (Parallax & Premium) */}
                <section className="hero-section" style={{ position: 'relative', padding: '100px 24px 120px', overflow: 'hidden' }}>
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
                            
                            <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: 950, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1.5px' }}>
                                The Operating System for <br/>
                                <span style={{ background: 'linear-gradient(to right, #818CF8, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Modern Service Economy</span>
                            </h1>
                            
                            <p className="hero-sub" style={{ fontSize: '20px', color: '#94A3B8', maxWidth: '800px', margin: '0 auto 48px', lineHeight: 1.6 }}>
                                Automate your entire booking lifecycle, manage global teams, and scale your operations with AI-driven scheduling intelligence.
                            </p>
                            
                             <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '80px', flexWrap: 'wrap' }}>
                                <Link to="/register" style={{ 
                                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', 
                                    height: '60px', padding: '0 40px', borderRadius: '18px', fontWeight: 900,
                                    fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
                                    boxShadow: '0 20px 40px -10px rgba(79,70,229,0.5)', transition: 'transform 0.2s'
                                }}>
                                    Launch Your Portal <ArrowRight size={20} />
                                </Link>

                                <div style={{ position: 'relative', height: '60px' }}>
                                    <button 
                                        onClick={() => setIsMoreOpen(!isMoreOpen)}
                                        style={{ 
                                            height: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', 
                                            padding: '0 30px', borderRadius: '18px', fontWeight: 800,
                                            fontSize: '17px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '15px', backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ background: 'white', color: '#4F46E5', padding: '4px', borderRadius: '6px', display: 'flex' }}>
                                                {heroSectors[currentSectorIndex].icon}
                                            </span>
                                            <span>{heroSectors[currentSectorIndex].label}</span>
                                        </div>
                                        <ChevronDown size={18} style={{ transform: isMoreOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                                    </button>
                                    <AnimatePresence>
                                        {isMoreOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                exit={{ opacity: 0, y: 10 }}
                                                style={{ 
                                                    position: 'absolute', top: 'calc(100% + 10px)', left: 0, width: '280px',
                                                    background: '#1E293B', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
                                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)', padding: '10px', zIndex: 50,
                                                    maxHeight: '300px', overflowY: 'auto'
                                                }}
                                            >
                                                {heroSectors.map((s, i) => (
                                                    <button 
                                                        key={i}
                                                        onClick={() => { setCurrentSectorIndex(i); setIsMoreOpen(false); }}
                                                        style={{ 
                                                            width: '100%', padding: '12px 15px', borderRadius: '12px', 
                                                            background: currentSectorIndex === i ? 'rgba(255,255,255,0.05)' : 'transparent', 
                                                            color: 'white', border: 'none', cursor: 'pointer', textAlign: 'left',
                                                            display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600
                                                        }}
                                                    >
                                                        {s.icon} {s.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>

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
                                    <div className="hero-image-container" style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.6)' }}>
                                        <img 
                                            src={heroSectors[currentSectorIndex].image} 
                                            alt={heroSectors[currentSectorIndex].label} 
                                            style={{ width: '100%', height: '600px', objectFit: 'cover', display: 'block' }} 
                                        />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 40%)' }}></div>
                                        
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
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" style={{ padding: '100px 24px', background: '#0F172A' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <h2 style={{ fontSize: '48px', fontWeight: 950, color: 'white', marginBottom: '20px' }}>Powerful Features</h2>
                            <p style={{ color: '#94A3B8', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Everything you need to manage appointments and grow your business in one place.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                            {[
                                { title: 'Smart Scheduling', desc: 'AI-powered booking system that eliminates double bookings.', icon: <Calendar size={32} /> },
                                { title: 'Global Payments', desc: 'Accept payments from clients worldwide with secure integrations.', icon: <CreditCard size={32} /> },
                                { title: 'Real-time Analytics', desc: 'Deep insights into your business performance and growth.', icon: <BarChart3 size={32} /> },
                                { title: 'Instant Notifications', desc: 'Automated SMS and Email alerts for staff and customers.', icon: <Bell size={32} /> },
                                { title: 'Custom Branding', desc: 'Make the platform yours with your logo and brand colors.', icon: <Sparkles size={32} /> },
                                { title: 'Multi-device Sync', desc: 'Manage your business from anywhere—mobile, tablet, or PC.', icon: <Smartphone size={32} /> }
                            ].map((f, i) => (
                                <motion.div 
                                    key={i}
                                    whileHover={{ y: -10, background: 'rgba(255,255,255,0.05)' }}
                                    style={{ padding: '40px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}
                                >
                                    <div style={{ color: '#818CF8', marginBottom: '24px' }}>{f.icon}</div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>{f.title}</h3>
                                    <p style={{ color: '#64748B', lineHeight: 1.6, fontSize: '15px' }}>{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" style={{ padding: '100px 24px', background: '#F8FAFC', color: '#0F172A' }}>
                    <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2 style={{ fontSize: '42px', fontWeight: 950, marginBottom: '16px' }}>Got Questions?</h2>
                            <p style={{ color: '#64748B' }}>Find answers to common queries about our platform.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { q: "How long does the setup take?", a: "You can be live and accepting bookings in less than 5 minutes. Our onboarding wizard guides you through every step." },
                                { q: "Can I use my own domain?", a: "Yes, our Enterprise plan allows you to use your custom domain for a fully white-labeled experience." },
                                { q: "Is my data secure?", a: "Absolutely. We use 256-bit encryption and industry-standard security protocols to keep your data safe." },
                                { q: "Do you offer customer support?", a: "Yes, we provide 24/7 support via chat and email to all our users." }
                            ].map((item, i) => (
                                <div key={i} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                    <button 
                                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                        style={{ width: '100%', padding: '24px', textAlign: 'left', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                    >
                                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B' }}>{item.q}</span>
                                        <ChevronDown size={20} style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                                    </button>
                                    <AnimatePresence>
                                        {activeFaq === i && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} 
                                                animate={{ height: 'auto', opacity: 1 }} 
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ padding: '0 24px 24px', color: '#64748B', lineHeight: 1.6 }}
                                            >
                                                {item.a}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Industries Section */}
                <section id="industries" style={{ padding: '100px 24px', background: 'white', color: '#0F172A' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '42px', fontWeight: 950, color: '#3B82F6', marginBottom: '64px' }}>Tailored for Your Sector</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                            {heroSectors.map((sector, i) => (
                                <motion.div 
                                    key={i} 
                                    whileHover={{ y: -10 }}
                                    style={{ padding: '40px', borderRadius: '24px', background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center', cursor: 'pointer' }}
                                    onClick={() => navigate(`/register?sector=${sector.label.toLowerCase()}`)}
                                >
                                    <div style={{ color: '#4F46E5', marginBottom: '20px' }}>{sector.icon}</div>
                                    <h3 style={{ fontWeight: 900, fontSize: '20px' }}>{sector.label}</h3>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" style={{ padding: '100px 24px' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '48px', fontWeight: 950, marginBottom: '48px' }}>Pricing Plans</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                            {[
                                { name: 'Free', price: '0', features: ['50 Bookings/mo', 'Basic Support'] },
                                { name: 'Pro', price: '299', features: ['Unlimited Bookings', 'WhatsApp Integration', 'Priority Support'] },
                                { name: 'Enterprise', price: '799', features: ['Custom Features', 'Dedicated Manager', 'API Access'] }
                            ].map((plan, i) => (
                                <div key={i} style={{ padding: '48px', borderRadius: '32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h3 style={{ fontSize: '24px', fontWeight: 900 }}>{plan.name}</h3>
                                    <div style={{ fontSize: '48px', fontWeight: 950, margin: '24px 0' }}>Rs. {plan.price}<span style={{ fontSize: '16px', opacity: 0.6 }}>/mo</span></div>
                                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px', textAlign: 'left' }}>
                                        {plan.features.map((f, j) => (
                                            <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#94A3B8' }}>
                                                <CheckCircle size={18} color="#10B981" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to="/register" style={{ display: 'block', background: i === 1 ? '#4F46E5' : 'white', color: i === 1 ? 'white' : '#0F172A', padding: '16px', borderRadius: '16px', fontWeight: 900, textDecoration: 'none' }}>Get Started</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            <footer style={{ padding: '80px 24px', background: '#020617', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <p style={{ color: '#64748B' }}>&copy; 2026 SmartScheduler. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
