import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Rocket, CheckCircle, Mail, Phone, MapPin, 
    Shield, Zap, Globe, Star, Activity, CreditCard, Settings, Clock 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const InfoPage = ({ type: propsType }) => {
    const { type: paramsType } = useParams();
    const type = propsType || paramsType;
    const { theme, isDarkMode } = useTheme();
    const navigate = useNavigate();

    const content = {
        about: {
            title: "About SmartScheduler",
            subtitle: "Redefining how the world books appointments.",
            sections: [
                { title: "Our Mission", text: "To empower businesses of all sizes with enterprise-grade scheduling technology.", icon: <Rocket /> },
                { title: "Our Vision", text: "A world where waiting is a choice, not a requirement.", icon: <Zap /> },
                { title: "Platform Purpose", text: "Built for modern clinics, salons, and offices.", icon: <Globe /> }
            ]
        },
        careers: {
            title: "Join Our Team",
            subtitle: "Help us build the future of time management.",
            sections: [
                { title: "Engineering", text: "Build robust, scalable systems.", icon: <Zap /> },
                { title: "Design", text: "Create intuitive experiences.", icon: <Star /> },
                { title: "Internships", text: "We offer 6-month paid internships.", icon: <Rocket /> }
            ]
        },
        blog: {
            title: "Insights & Updates",
            subtitle: "Expert advice on growing your business through smart scheduling.",
            sections: [
                { 
                    title: "1. How Online Appointment Systems Save Time", 
                    text: "Online appointment systems help businesses and customers save valuable time by automating the entire booking process. Instead of making phone calls or waiting in long queues, users can quickly schedule appointments anytime and anywhere.", 
                    icon: <Rocket />,
                    customContent: (
                        <p style={{ color: theme.gray, fontSize: '14px', marginTop: '10px' }}>
                            Businesses can manage bookings, employee schedules, and customer appointments efficiently through a centralized platform. Automated reminders and real-time updates also reduce missed appointments and scheduling conflicts, improving overall productivity and customer satisfaction.
                        </p>
                    )
                },
                { 
                    title: "2. Benefits of Real-Time Booking", 
                    text: "Real-time booking systems allow customers to instantly view available slots and confirm appointments without delays. This improves convenience and provides a faster booking experience.", 
                    icon: <Zap />,
                    customContent: (
                        <p style={{ color: theme.gray, fontSize: '14px', marginTop: '10px' }}>
                            Businesses benefit from accurate scheduling, reduced manual work, and better resource management. Real-time updates also help prevent double bookings and ensure smooth appointment handling for both customers and employees.
                        </p>
                    )
                },
                { 
                    title: "3. Why Businesses Need Smart Scheduling", 
                    text: "Smart scheduling systems help businesses organize appointments, manage employees, and improve customer experience through automation and intelligent booking management.", 
                    icon: <Star />,
                    customContent: (
                        <p style={{ color: theme.gray, fontSize: '14px', marginTop: '10px' }}>
                            With features like real-time availability, automated notifications, and centralized dashboards, businesses can increase efficiency, reduce operational errors, and provide seamless appointment services across multiple sectors.
                        </p>
                    )
                }
            ]
        },
        terms: {
            title: "Terms of Service",
            subtitle: "The legal foundation of our platform.",
            sections: [
                { title: "Website Rules", text: "Users must provide accurate information and respect other members of the platform. Unauthorized access or scraping is strictly prohibited.", icon: <Globe /> },
                { title: "Booking Conditions", text: "All bookings are subject to availability. Confirmations are sent via email and must be presented at the time of service.", icon: <CheckCircle /> },
                { title: "Cancellation Policy", text: "Cancellations must be made at least 24 hours in advance to be eligible for a refund or rescheduling without penalty.", icon: <Clock /> }
            ]
        },
        status: {
            title: "System Status",
            subtitle: "Real-time updates on our platform's health.",
            sections: [
                { title: "Booking System", text: "🟢 All systems operational. Average response time: 120ms.", icon: <Activity /> },
                { title: "Payment Gateway", text: "🟢 Active. All transactions are processing normally.", icon: <CreditCard /> },
                { title: "Maintenance", text: "🟡 Scheduled maintenance on May 20th at 2:00 AM UTC.", icon: <Settings /> }
            ]
        },
        privacy: {
            title: "Privacy Policy",
            subtitle: "We value your privacy and are committed to protecting your personal information.",
            sections: [
                { 
                    title: "Data Security", 
                    text: "Our platform securely stores user data such as names, contact details, and appointment information to provide seamless scheduling services.", 
                    icon: <Shield />,
                    customContent: (
                        <p style={{ color: theme.gray, fontSize: '14px', marginTop: '10px' }}>
                            We do not share personal information with unauthorized third parties. All user data is protected using industry-standard security measures to ensure privacy and confidentiality.
                        </p>
                    )
                }
            ]
        },
        cookies: {
            title: "Cookie Policy",
            subtitle: "Transparent usage of tracking technologies.",
            sections: [
                { 
                    title: "How we use Cookies", 
                    text: "Our platform uses cookies to improve user experience, analyze website traffic, and maintain secure login sessions. Cookies help us remember user preferences and provide personalized services.", 
                    icon: <Globe />,
                    customContent: (
                        <p style={{ color: theme.gray, fontSize: '14px', marginTop: '10px' }}>
                            By using our website, you agree to the use of cookies for functionality, analytics, and performance improvement.
                        </p>
                    )
                }
            ]
        },
        press: {
            title: "Press Kit",
            subtitle: "Everything you need to share the SmartScheduler story.",
            sections: [
                { 
                    title: "Brand Assets", 
                    text: "Download our official logos and brand marks in high-resolution PNG and SVG formats.", 
                    icon: <Globe />,
                    customContent: (
                        <div style={{ marginTop: '20px' }}>
                            <button style={{ 
                                background: theme.accent, color: '#2D3748', border: 'none', 
                                padding: '12px 24px', borderRadius: '12px', fontWeight: 700, 
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
                            }}>
                                <Rocket size={18} /> Download Logo Pack (.ZIP)
                            </button>
                        </div>
                    )
                },
                { 
                    title: "Brand Identity", 
                    text: "Our core colors define our energy and professionalism.", 
                    icon: <Star />,
                    customContent: (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            {[
                                { hex: '#4F46E5', label: 'Primary Indigo' },
                                { hex: '#9333EA', label: 'Vibrant Purple' },
                                { hex: '#FFFFFF', label: 'Deep Slate' }
                            ].map(c => (
                                <div key={c.hex} style={{ textAlign: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', background: c.hex, borderRadius: '8px', border: '2px solid rgba(90, 49, 93, 0.1)', margin: '0 auto 8px' }} />
                                    <span style={{ fontSize: '10px', fontWeight: 800, color: theme.gray }}>{c.hex}</span>
                                </div>
                            ))}
                        </div>
                    )
                },
                { 
                    title: "Media Contact", 
                    text: "For press inquiries, interviews, or event speaking requests.", 
                    icon: <Mail />,
                    customContent: (
                        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid ' + theme.border }}>
                            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>Press Relations Team</div>
                            <div style={{ color: theme.accent, fontWeight: 700, fontSize: '13px' }}>press@smartsched.com</div>
                        </div>
                    )
                }
            ],
            extraContent: (
                <div style={{ marginTop: '80px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '32px' }}>Platform Screenshots</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        {['/hero_dashboard_mockup.png', '/services.png', '/healthcare.png'].map((img, i) => (
                            <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid ' + theme.border, background: theme.card }}>
                                <img src={img} alt={`Screenshot ${i+1}`} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                                <div style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: theme.gray }}>
                                    Dashboard View - {i === 0 ? 'Admin' : (i === 1 ? 'Services' : 'Client')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        contact: {
            title: "Get in Touch",
            subtitle: "We're here to help you succeed.",
            sections: [
                { title: "Email Support", text: "support@smartsched.com (24/7 Response)", icon: <Mail /> },
                { title: "Phone", text: "+91 80000 00000 (Mon-Fri, 9AM-6PM)", icon: <Phone /> },
                { title: "Headquarters", text: "Forge India HQ, Innovation Park, Bengaluru", icon: <MapPin /> }
            ]
        }
    };

    const activeContent = content[type] || {
        title: type.toUpperCase().replace('-', ' '),
        subtitle: "Comprehensive information about our " + type + ".",
        sections: [
            { title: "Coming Soon", text: "Detailed content for this section is being prepared.", icon: <Zap /> }
        ]
    };

    return (
        <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text, fontFamily: "'Outfit', sans-serif", transition: 'all 0.3s' }}>
            <nav style={{ padding: '30px 40px', borderBottom: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <ArrowLeft size={24} />
                    <span style={{ fontWeight: 800, fontSize: '18px' }}>Back to Home</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '28px', objectFit: 'contain' }} />
                    <div style={{ fontWeight: 900, fontSize: '22px' }}>
                        Forge India <span style={{ color: theme.accent }}>Connect</span>
                    </div>
                </div>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '100px 20px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 style={{ fontSize: '64px', fontWeight: 950, marginBottom: '20px', letterSpacing: '-2px' }}>{activeContent.title}</h1>
                    <p style={{ fontSize: '22px', color: theme.gray, marginBottom: '80px', maxWidth: '700px' }}>{activeContent.subtitle}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        {activeContent.sections.map((s, i) => (
                            <div key={i} style={{ background: theme.card, border: '1px solid ' + theme.border, padding: '40px', borderRadius: '32px' }}>
                                <div style={{ color: theme.accent, marginBottom: '24px' }}>{s.icon}</div>
                                <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>{s.title}</h3>
                                <div style={{ color: theme.gray, lineHeight: 1.7, fontSize: '16px' }}>{s.text}</div>
                                {s.customContent}
                            </div>
                        ))}
                    </div>

                    {activeContent.extraContent}
                </motion.div>
            </div>

            <footer style={{ padding: '80px 40px', borderTop: '1px solid ' + theme.border, textAlign: 'center' }}>
                <p style={{ color: theme.gray, fontWeight: 700 }}>&copy; 2026 Forge India Connect Pvt Ltd. Shaping the future of business.</p>
            </footer>
        </div>
    );
};

export default InfoPage;
