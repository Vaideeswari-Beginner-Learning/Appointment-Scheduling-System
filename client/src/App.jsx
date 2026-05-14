import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
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
import InfoPage from './pages/info/InfoPage';
import { Zap, Building2, User, Briefcase, CreditCard, Clock } from 'lucide-react';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    const location = window.location.pathname;
    
    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-main)' }}>
            <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ color: '#4F46E5', marginBottom: '24px' }}
            >
                <Zap size={64} fill="currentColor" />
            </motion.div>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 8px' }}>SmartScheduler</h2>
                <p style={{ color: 'var(--text-gray)', fontWeight: 600 }}>Setting up your workspace...</p>
            </div>
        </div>
    );
    
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
    
    if (location === '/onboarding') return <>{children}</>;
    
    return <MainLayout>{children}</MainLayout>;
};

const DashboardRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) return null;
 
 
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'super-admin' || user.role === 'admin') return <AdminDashboard />;
    if (user.role === 'client') return <ClientDashboard />;
    if (user.role === 'hr') return <HRDashboard />;
    if (['doctor', 'employee', 'staff', 'interviewer', 'service'].includes(user.role)) return <ProfessionalDashboard />;
    return <UserDashboard />;
};

// Client Approval & Payment Check Wrapper
const ClientApprovalCheck = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Bypass for super-admin or admin
    if (user?.role === 'super-admin' || user?.role === 'admin') {
        return children;
    }

    // Real approval state from backend (with simulation fallback for dev testing)
    const isApproved = user?.isApproved !== false; 
    const isPendingPayment = sessionStorage.getItem('pendingPayment') === 'true';

    if (isPendingPayment) {
        return (
            <div style={{ background: '#FDFBF7', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#B76E79', textAlign: 'center', padding: '40px' }}>
                <CreditCard size={80} style={{ marginBottom: '24px' }} />
                <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '16px' }}>Payment Required</h1>
                <p style={{ fontSize: '20px', maxWidth: '600px', marginBottom: '40px', color: '#64748B' }}>Your request has been accepted! Please complete the payment to activate your professional dashboard.</p>
                <button onClick={() => { sessionStorage.removeItem('pendingPayment'); window.location.reload(); }} style={{ background: '#B76E79', color: 'white', padding: '18px 48px', borderRadius: '16px', border: 'none', fontWeight: 900, fontSize: '18px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(183,110,121,0.3)' }}>
                    Pay & Activate Now
                </button>
            </div>
        );
    }

    if (!isApproved) {
        return (
            <div style={{ background: '#FDFBF7', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#B76E79', textAlign: 'center', padding: '40px' }}>
                <Clock size={80} style={{ marginBottom: '24px' }} />
                <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '16px' }}>Waiting for Approval</h1>
                <p style={{ fontSize: '20px', maxWidth: '600px', marginBottom: '40px', color: '#64748B' }}>Your organization request has been sent to our administrators. We will verify your details and notify you once accepted.</p>
                <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'transparent', color: '#B76E79', border: '2px solid #B76E79', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                    Log Out
                </button>
            </div>
        );
    }

    return children;
};

function App() {

    return (
        <ThemeProvider>
            <AuthProvider>
                <ToastProvider>
                    <SocketProvider>
                        <Router>
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/landing-v2" element={<LandingPageV2 />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/client-register" element={<ClientRegister />} />
                                <Route path="/book" element={<Booking />} />
                                <Route path="/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />
                                <Route path="/professional/:id" element={<StaffProfile />} />
                                <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                        <ClientApprovalCheck>
                                            <DashboardRedirect />
                                        </ClientApprovalCheck>
                                    </ProtectedRoute>
                                } />
                                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                                <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
                                <Route path="/client/:id" element={<MiniWebsite />} />

                                <Route path="/blog" element={<InfoPage type="blog" />} />
                                <Route path="/press" element={<InfoPage type="press" />} />
                                <Route path="/contact" element={<InfoPage type="contact" />} />
                                <Route path="/help" element={<InfoPage type="help" />} />
                                <Route path="/privacy" element={<InfoPage type="privacy" />} />
                                <Route path="/terms" element={<InfoPage type="terms" />} />
                                <Route path="/cookies" element={<InfoPage type="cookies" />} />
                                <Route path="/status" element={<InfoPage type="status" />} />

                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </Router>
                    </SocketProvider>
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
