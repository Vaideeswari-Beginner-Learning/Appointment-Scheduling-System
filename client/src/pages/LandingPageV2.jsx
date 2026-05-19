import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Calendar, Users, Shield, BarChart3, Clock, 
    Bell, CreditCard, ArrowRight, Star, CheckCircle, 
    Zap, Globe, Sparkles, Rocket, Heart, GraduationCap, 
    Hotel, Car, Dumbbell, Gavel, Home, Wrench, Music, 
    ShoppingCart, ChevronRight, Play, Layout, MapPin,
    ArrowUpRight, Mail, Phone, Instagram, Twitter, Linkedin, Building2,
    Smartphone, Lock, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Animated counter component
const CountUp = ({ end, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started) setStarted(true);
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [started]);

    useEffect(() => {
        if (!started) return;
        let start = 0;
        const step = Math.ceil(end / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(start);
        }, 16);
        return () => clearInterval(timer);
    }, [started, end, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
};

const LandingPageV2 = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sectors = [
        { id: 'health', name: 'Healthcare', icon: <Heart />, color: '#EF4444', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80' },
        { id: 'edu', name: 'Education', icon: <GraduationCap />, color: '#8B5CF6', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80' },
        { id: 'beauty', name: 'Salon & Beauty', icon: <Sparkles />, color: '#EC4899', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' },
        { id: 'hotel', name: 'Hospitality', icon: <Hotel />, color: '#F59E0B', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
        { id: 'corp', name: 'Corporate', icon: <Users />, color: '#3B82F6', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
        { id: 'auto', name: 'Automobile', icon: <Car />, color: '#6366F1', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80' }
    ];

    const stats = [
        { label: 'Active Users', value: '50K+', icon: <Users size={20} /> },
        { label: 'Bookings Today', value: '12K+', icon: <Calendar size={20} /> },
        { label: 'Top Rated', value: '4.9/5', icon: <Star size={20} /> },
        { label: 'Global Reach', value: '150+', icon: <Globe size={20} /> }
    ];

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
            {/* 🌟 NAVIGATION */}
            <nav style={{ 
                position: 'fixed', top: 0, width: '100%', zIndex: 1000, 
                padding: scrolled ? '15px 40px' : '25px 40px',
                background: scrolled ? 'rgba(15, 23, 42, 0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'white', padding: '6px 12px', borderRadius: '10px', display: 'flex', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        <img src="/logo.png" alt="Forge India Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 950, color: 'white', letterSpacing: '-0.5px' }}>Forge India Connect</span>
                </div>

                <div style={{ display: 'flex', gap: '32px', fontWeight: 700, color: '#94A3B8', fontSize: '15px' }}>
                    {['Solutions', 'Features', 'Pricing', 'Resources'].map(item => (
                        <a key={item} href={`#${item.toLowerCase()}`} style={{ textDecoration: 'none', color: 'inherit', transition: '0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = '#94A3B8'}>{item}</a>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {user ? (
                        <button onClick={() => navigate('/dashboard')} style={{ background: 'white', color: '#0F172A', padding: '10px 24px', borderRadius: '14px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Dashboard</button>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', padding: '10px 24px', borderRadius: '14px', backdropFilter: 'blur(10px)' }}>Login</button>
                            <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: 'white', padding: '12px 28px', borderRadius: '14px', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(99,102,241,0.3)' }}>Register Free</button>
                        </>
                    )}
                </div>
            </nav>

            {/* 🚀 HERO SECTION */}
            <header style={{ position: 'relative', paddingTop: '180px', paddingBottom: '120px', textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '1200px', height: '600px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }}></div>
                
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 20px', borderRadius: '100px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '32px', fontSize: '14px', fontWeight: 800, color: '#6EE7B7' }}>
                            <Sparkles size={16} fill="#6EE7B7" /> <span>🎉 1 DAY FREE TRIAL — No Credit Card Required</span>
                        </div>
                        <h1 style={{ fontSize: '72px', fontWeight: 950, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-3px' }}>
                            Smart Appointment <br/>
                            <span style={{ background: 'linear-gradient(to right, #818CF8, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scheduling System</span>
                        </h1>
                        <p style={{ fontSize: '22px', color: '#94A3B8', maxWidth: '750px', margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 500 }}>
                            The ultimate operating system for modern clinics, salons, and corporate offices. Automate bookings, manage staff, and grow 10x faster.
                        </p>

                        {/* CTA BUTTONS */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: 'white', padding: '0 48px', height: '64px', borderRadius: '20px', fontWeight: 900, fontSize: '18px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 40px -10px rgba(99,102,241,0.5)' }}>
                                Get Started Free <ArrowRight size={20} />
                            </button>
                            <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0 40px', height: '64px', borderRadius: '20px', fontWeight: 800, fontSize: '18px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                Login <ArrowRight size={20} />
                            </button>
                        </div>
                        <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 700, marginBottom: '60px' }}>✅ 1 Day Free Trial • No Credit Card • Cancel Anytime</p>

                        {/* SEARCH BAR */}
                        <div style={{ maxWidth: '700px', margin: '0 auto 60px', position: 'relative' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                                <div style={{ padding: '0 20px', color: '#64748B' }}><Search size={24} /></div>
                                <input type="text" placeholder="Search for clinics, salons, or services..." style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '18px', fontWeight: 600, padding: '15px 0', outline: 'none' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                <button style={{ background: '#6366F1', color: 'white', padding: '15px 35px', borderRadius: '18px', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>Search <ArrowRight size={20} /></button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* 🏢 POPULAR SECTORS */}
            <section id="solutions" style={{ padding: '100px 40px', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                    <div>
                        <div style={{ color: '#6366F1', fontWeight: 900, fontSize: '14px', letterSpacing: '2px', marginBottom: '16px' }}>TAILORED SOLUTIONS</div>
                        <h2 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-2px' }}>Popular Industry Sectors</h2>
                    </div>
                    <button style={{ color: '#818CF8', background: 'transparent', border: 'none', fontSize: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>View All Sectors <ArrowUpRight size={18} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '30px' }}>
                    {sectors.map((s, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -15 }}
                            style={{ position: 'relative', height: '450px', borderRadius: '40px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
                            onClick={() => navigate(`/register?role=client&sector=${s.id}`)}
                        >
                            <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.6s' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.4) 40%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px' }}>
                                <div style={{ background: s.color, color: 'white', width: 'fit-content', padding: '12px', borderRadius: '16px', marginBottom: '20px', boxShadow: `0 10px 20px ${s.color}40` }}>{s.icon}</div>
                                <h3 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '10px' }}>{s.name}</h3>
                                <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>Custom-built scheduling logic for {s.name.toLowerCase()} providers.</p>
                                
                                {/* NEW: Role Labels */}
                                <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
                                    <span style={{ fontSize:'11px', fontWeight:900, background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:'6px', color:'#A5B4FC' }}>
                                        {s.id === 'health' ? 'Doctor / Nurse' : s.id === 'edu' ? 'Faculty / Admin' : s.id === 'beauty' ? 'Stylist / Therapist' : 'Manager / Staff'}
                                    </span>
                                    <span style={{ fontSize:'11px', fontWeight:900, background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:'6px', color:'#818CF8' }}>
                                        HR & Admin Panel
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 800 }}>Explore Solution <ChevronRight size={18} /></div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 🛠 HOW IT WORKS */}
            <section style={{ padding: '120px 40px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ color: '#6366F1', fontWeight: 900, fontSize: '14px', letterSpacing: '2px', marginBottom: '16px' }}>PROCESS FLOW</div>
                    <h2 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '80px', letterSpacing: '-2px' }}>How it Works in 3 Simple Steps</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                        {[
                            { title: 'Choose Service', desc: 'Browse our curated list of services across healthcare, beauty, corporate and more.', icon: <Search size={32} /> },
                            { title: 'Select Time Slot', desc: 'Pick a convenient date and time from real-time available slots.', icon: <Clock size={32} /> },
                            { title: 'Confirm Booking', desc: 'Complete your booking with secure payment and get instant confirmation.', icon: <CheckCircle size={32} /> }
                        ].map((step, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                                <div style={{ width: '100px', height: '100px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                    {step.icon}
                                    <div style={{ position: 'absolute', top: '-10px', right: '50px', background: '#6366F1', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900 }}>{i+1}</div>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>{step.title}</h3>
                                <p style={{ color: '#94A3B8', lineHeight: 1.8, fontSize: '16px' }}>{step.desc}</p>
                                {i < 2 && <div style={{ position: 'absolute', top: '50px', right: '-40px', width: '80px', height: '2px', background: 'linear-gradient(to right, #6366F1, transparent)', opacity: 0.3 }}></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ✨ FEATURES SECTION */}
            <section id="features" style={{ padding: '120px 40px', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <div style={{ color: '#6366F1', fontWeight: 900, fontSize: '14px', letterSpacing: '2px', marginBottom: '16px' }}>POWERFUL FEATURES</div>
                    <h2 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-2px' }}>Everything You Need</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                    {[
                        { title: 'Real-time Availability', desc: 'See live slot availability across all providers. Booked slots disappear instantly for everyone.', icon: <Zap size={28} />, color: '#6366F1' },
                        { title: 'Easy Appointment Booking', desc: 'Book appointments in just 3 clicks. No complex forms, no confusion.', icon: <Calendar size={28} />, color: '#10B981' },
                        { title: 'Secure Payment', desc: 'Integrated UPI and QR code payments with instant confirmation and receipts.', icon: <Lock size={28} />, color: '#F59E0B' },
                        { title: 'Smart Notifications', desc: 'Automated SMS and email reminders for both staff and customers.', icon: <Bell size={28} />, color: '#EF4444' },
                        { title: 'Multi-role Dashboard', desc: 'Dedicated dashboards for admins, staff, HR, and customers with role-based access.', icon: <LayoutDashboard size={28} />, color: '#8B5CF6' },
                        { title: 'Mobile Optimized', desc: 'Fully responsive design that works beautifully on any device, anywhere.', icon: <Smartphone size={28} />, color: '#EC4899' }
                    ].map((f, i) => (
                        <motion.div key={i} whileHover={{ y: -10 }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '48px 36px', borderRadius: '32px', transition: '0.3s' }}>
                            <div style={{ background: f.color + '15', color: f.color, width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>{f.icon}</div>
                            <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '12px' }}>{f.title}</h3>
                            <p style={{ color: '#94A3B8', lineHeight: 1.7, fontSize: '15px' }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 📊 STATS SECTION */}
            <section style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', textAlign: 'center' }}>
                    {[
                        { label: 'Clients', end: 100, suffix: '+' },
                        { label: 'Bookings', end: 500, suffix: '+' },
                        { label: 'Services', end: 50, suffix: '+' }
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} style={{ padding: '48px', borderRadius: '32px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                            <div style={{ fontSize: '56px', fontWeight: 950, background: 'linear-gradient(135deg, #818CF8, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}><CountUp end={s.end} suffix={s.suffix} /></div>
                            <div style={{ fontSize: '16px', color: '#94A3B8', fontWeight: 800, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 💎 PRICING */}
            <section id="pricing" style={{ padding: '120px 40px', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 20px', borderRadius: '100px', color: '#6EE7B7', fontSize: '14px', fontWeight: 900, marginBottom: '24px' }}>🎁 1 DAY FREE TRIAL ON ALL PLANS</div>
                    <h2 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px', letterSpacing: '-2px' }}>Pick Your Scaling Plan</h2>
                    <p style={{ color: '#94A3B8', fontSize: '18px' }}>Start with a 1-day free trial. Upgrade when you're ready to dominate your industry.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                    {[
                        { name: 'Starter', price: 'Free', trial: '1 Day Trial', features: ['50 Bookings / mo', '1 Team Member', 'Standard Support', 'Public Profile'], active: false },
                        { name: 'Pro Business', price: '₹2,499', trial: '1 Day Free Trial', features: ['Unlimited Bookings', '10 Team Members', 'Real-Time Notifications', 'Advanced Analytics', 'Priority Support'], active: true },
                        { name: 'Enterprise', price: 'Custom', trial: '1 Day Free Trial', features: ['Global Presence', 'Unlimited Staff', 'Dedicated Manager', 'API Access', 'Custom Branding'], active: false }
                    ].map((plan, i) => (
                        <div key={i} style={{ 
                            background: plan.active ? 'linear-gradient(135deg, #1E293B, #0F172A)' : 'rgba(255,255,255,0.03)', 
                            padding: '60px 40px', borderRadius: '48px', 
                            border: plan.active ? '2px solid #6366F1' : '1px solid rgba(255,255,255,0.05)',
                            position: 'relative', transition: '0.3s'
                        }}>
                            {plan.active && <div style={{ position: 'absolute', top: '24px', right: '40px', background: '#6366F1', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 900 }}>MOST POPULAR</div>}
                            <div style={{ background: 'rgba(16,185,129,0.15)', color: '#6EE7B7', padding: '6px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 900, display: 'inline-block', marginBottom: '16px' }}>{plan.trial}</div>
                            <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>{plan.name}</h3>
                            <div style={{ fontSize: '48px', fontWeight: 950, marginBottom: '40px' }}>{plan.price}<span style={{ fontSize: '16px', color: '#64748B' }}>/mo</span></div>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
                                {plan.features.map((f, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#94A3B8' }}>
                                        <CheckCircle size={18} color={plan.active ? '#6366F1' : '#10B981'} /> {f}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => navigate('/register')} style={{ 
                                width: '100%', height: '64px', borderRadius: '20px', 
                                background: plan.active ? '#6366F1' : 'white', 
                                color: plan.active ? 'white' : '#0F172A', 
                                border: 'none', fontWeight: 900, fontSize: '18px', cursor: 'pointer',
                                boxShadow: plan.active ? '0 20px 40px -10px rgba(99,102,241,0.5)' : 'none'
                            }}>Get Started Now</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 💬 TESTIMONIALS */}
            <section style={{ padding: '120px 40px', background: '#020617' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '56px', fontWeight: 900, marginBottom: '32px', letterSpacing: '-2px' }}>Real Stories from Real Businesses</h2>
                            <p style={{ fontSize: '20px', color: '#64748B', lineHeight: 1.6, marginBottom: '48px' }}>See how ForgeIndia is transforming scheduling for clinics, salons, and offices across the country.</p>
                            <div style={{ display: 'flex', gap: '40px' }}>
                                <div>
                                    <div style={{ fontSize: '40px', fontWeight: 900 }}>99.9%</div>
                                    <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 800 }}>UPTIME</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '40px', fontWeight: 900 }}>12M+</div>
                                    <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 800 }}>BOOKINGS</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '30px' }}>
                            {[
                                { name: 'Dr. Anita Desai', role: 'Medical Director', text: 'ForgeIndia transformed our clinic operations. No more double bookings, and patients love the reminder alerts!' },
                                { name: 'Rohan Sharma', role: 'Salon Owner', text: 'The QR payment system is a game changer. Clients pay even before they arrive!' }
                            ].map((t, i) => (
                                <div key={i} style={{ background: '#0F172A', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', color: '#F59E0B', gap: '4px', marginBottom: '20px' }}>
                                        {[1,2,3,4,5].map(j => <Star key={j} size={16} fill="#F59E0B" />)}
                                    </div>
                                    <p style={{ fontSize: '18px', lineHeight: 1.6, color: '#E2E8F0', marginBottom: '32px', fontStyle: 'italic' }}>"{t.text}"</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#6366F1' }}></div>
                                        <div>
                                            <div style={{ fontWeight: 900 }}>{t.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 800 }}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 📍 FOOTER */}
            <footer style={{ padding: '100px 40px 60px', background: '#020617', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '80px', marginBottom: '80px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ background: 'white', padding: '6px 12px', borderRadius: '10px', display: 'flex' }}>
                                    <img src="/logo.png" alt="Forge India Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                                </div>
                            </div>
                            <p style={{ color: '#64748B', lineHeight: 1.8, fontSize: '16px', maxWidth: '400px' }}>The world's most advanced scheduling engine for clinics, salons, and offices. Join 50,000+ businesses growing with ForgeIndia.</p>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 900, marginBottom: '32px', color: '#818CF8' }}>PRODUCT</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px', color: '#94A3B8', fontWeight: 700 }}>
                                <li>Features</li>
                                <li>Real-Time Engine</li>
                                <li>Mobile App</li>
                                <li>Payment Gateway</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 900, marginBottom: '32px', color: '#818CF8' }}>COMPANY</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px', color: '#94A3B8', fontWeight: 700 }}>
                                <li>About Us</li>
                                <li>Careers</li>
                                <li>Press Kit</li>
                                <li>Contact</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 900, marginBottom: '32px', color: '#818CF8' }}>SUPPORT</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px', color: '#94A3B8', fontWeight: 700 }}>
                                <li>Help Center</li>
                                <li>API Docs</li>
                                <li>System Status</li>
                                <li>Privacy</li>
                            </ul>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: '#475569', fontSize: '14px', fontWeight: 700 }}>&copy; 2026 ForgeIndia SAAS. All Rights Reserved.</div>
                        <div style={{ display: 'flex', gap: '20px', color: '#64748B' }}>
                            <Instagram size={20} />
                            <Twitter size={20} />
                            <Linkedin size={20} />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPageV2;
