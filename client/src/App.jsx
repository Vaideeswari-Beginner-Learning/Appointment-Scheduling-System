import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import LandingPageV2 from './pages/LandingPageV2';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientRegister from './pages/ClientRegister';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import HRDashboard from './pages/HRDashboard';
import StaffProfile from './pages/StaffProfile';
import Booking from './pages/Booking';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import MyAppointments from './pages/MyAppointments';
import MainLayout from './components/MainLayout';
import ClientPicker from './pages/ClientPicker';
import OnboardingWizard from './pages/OnboardingWizard';
import MiniWebsite from './pages/MiniWebsite';
import { Zap, Building2, User, Briefcase } from 'lucide-react';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    const location = window.location.pathname;
    
    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-main)' }}>
            <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ background: 'white', padding: '12px 24px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', marginBottom: '24px' }}
            >
                <img src="/logo.png" alt="Forge India Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
            </motion.div>
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-gray)', fontWeight: 600 }}>Setting up your workspace...</p>
            </div>
        </div>
    );
    
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
    
    const manualLayoutRoles = ['admin', 'super-admin', 'hr', 'client'];
    if (manualLayoutRoles.includes(user.role)) return <>{children}</>;
    if (location === '/onboarding') return <>{children}</>;
    
    return <MainLayout>{children}</MainLayout>;
};

const DashboardRedirect = () => {
    const { user, loading } = useAuth();
    const [identifying, setIdentifying] = React.useState(true);

    React.useEffect(() => {
        if (!loading && user) {
            const timer = setTimeout(() => setIdentifying(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [loading, user]);

    if (loading || (user && identifying)) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-main)', transition: 'background 0.3s' }}>
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.8 }}
                    style={{ color: user?.role === 'client' ? '#4F46E5' : (user?.role === 'hr' ? '#6366F1' : '#10B981'), marginBottom: '24px' }}
                >
                    {user?.role === 'client' ? <Building2 size={80} /> : (user?.role === 'hr' ? <Briefcase size={80} /> : <User size={80} />)}
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                            background: user?.role === 'client' ? '#4F46E5' : (user?.role === 'hr' ? '#6366F1' : '#10B981'), 
                            color: 'white', padding: '10px 24px', borderRadius: '99px', 
                            fontSize: '14px', fontWeight: 900, textTransform: 'uppercase',
                            letterSpacing: '2px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }}>
                            Role: {user?.role === 'client' ? 'Business Owner' : (user?.role === 'hr' ? 'HR Manager' : (['doctor', 'employee', 'staff'].includes(user?.role) ? 'Professional' : 'Verified Customer'))}
                        </span>
                        {user?.sector && (
                            <span style={{ color: 'var(--text-gray)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Sector: {user.sector}
                            </span>
                        )}
                    </div>
                </motion.div>

                <h1 style={{ fontSize: '32px', fontWeight: 950, color: 'var(--text-dark)', marginTop: '32px' }}>
                    {user?.role === 'client' ? 'Management Mode' : (user?.role === 'hr' ? 'HR Control Center' : 'System Dashboard')}
                </h1>
                
                <p style={{ color: 'var(--text-gray)', fontWeight: 600, marginTop: '12px' }}>
                    Setting up your personalized {user?.sector || 'service'} portal...
                </p>
            </div>
        );
    }
 
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'super-admin' || user.role === 'admin') return <AdminDashboard />;
    if (user.role === 'client') return <ClientDashboard />;
    if (user.role === 'hr') return <HRDashboard />;
    if (['doctor', 'employee', 'staff', 'interviewer', 'service'].includes(user.role)) return <ProfessionalDashboard />;
    return <UserDashboard />;
};

function App() {
    const [darkMode, setDarkMode] = React.useState(() => localStorage.getItem('darkMode') === 'true');

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    return (
        <AuthProvider>
            <ToastProvider>
                <SocketProvider>
                    <Router>
                        <div style={{ minHeight: '100vh', background: darkMode ? '#0F172A' : '#F8FAFC', fontFamily: "'Inter', sans-serif", transition: 'background 0.3s' }}>
                            <Routes>
                                <Route path="/" element={<LandingPageV2 />} />
                                <Route path="/old-home" element={<LandingPage />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/client-register" element={<ClientRegister />} />
                                <Route path="/dashboard" element={<DashboardRedirect />} />
                                <Route path="/book" element={<Booking />} />
                                <Route path="/select-organization" element={<ProtectedRoute><ClientPicker /></ProtectedRoute>} />
                                <Route path="/staff/:id" element={<StaffProfile />} />
                                <Route path="/admin" element={<ProtectedRoute roles={['super-admin']}><AdminDashboard /></ProtectedRoute>} />
                                <Route path="/onboarding" element={<ProtectedRoute roles={['client']}><OnboardingWizard /></ProtectedRoute>} />
                                <Route path="/track" element={<UserDashboard />} />
                                <Route path="/my-appointments" element={<MyAppointments />} />
                                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                                <Route path="/professional-dashboard" element={<ProtectedRoute roles={['doctor', 'interviewer', 'service', 'admin']}><ProfessionalDashboard /></ProtectedRoute>} />
                                <Route path="/org/:id" element={<MiniWebsite />} />
                                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </div>
                    </Router>
                </SocketProvider>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
