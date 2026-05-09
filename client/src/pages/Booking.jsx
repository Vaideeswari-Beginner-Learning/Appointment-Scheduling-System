import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, 
    Briefcase, Search, FileText, Upload, User, ArrowLeft,
    Monitor, ShieldCheck, MapPin, Zap, ExternalLink, Building2, X, Smartphone, Users
} from 'lucide-react';
import { API_BASE_URL, UPI_ID, UPI_NAME } from '../config/api';
import { getSectorConfig } from '../config/sectorConfig';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';

/**
 * REFINED UNIVERSAL BOOKING ENGINE
 * Landing Page Style Overhaul
 */

const Booking = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const socket = useSocket();
    const showToast = useToast();

    // Step management: 1=select service, 2=fill form, 3=pick slot & confirm
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState(getSectorConfig(user?.sector || 'general'));
    
    // ... rest of state ...
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [formData, setFormData] = useState({});
    const [fileUploads, setFileUploads] = useState({});
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [fetchingServices, setFetchingServices] = useState(true);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    
    // Appointment details
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [manualTime, setManualTime] = useState('');
    const [selectedSlotObj, setSelectedSlotObj] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [organization, setOrganization] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [staff, setStaff] = useState([]);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [staffLoading, setStaffLoading] = useState(false);
    const [staffModalServiceId, setStaffModalServiceId] = useState(null);

    // Real-time slot listener
    useEffect(() => {
        if (!socket) return;

        socket.on('slot_booked', ({ slotId }) => {
            console.log(`📡 Slot booked in real-time: ${slotId}`);
            // Remove the booked slot from the available list if it matches
            setAvailableSlots(prev => {
                const updated = prev.filter(s => s._id !== slotId);
                if (updated.length < prev.length) {
                    showToast('Someone else just booked a slot! Updating availability...', 'info');
                }
                return updated;
            });
        });

        return () => socket.off('slot_booked');
    }, [socket, showToast]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const clientIdParam = params.get('clientId');

        const fetchServices = async () => {
            setFetchingServices(true);
            try {
                const token = localStorage.getItem('token');
                
                let res;
                if (clientIdParam) {
                    res = await axios.get(`${API_BASE_URL}/services/public/${clientIdParam}`);
                } else if (token) {
                    res = await axios.get(`${API_BASE_URL}/services`, { headers: { 'x-auth-token': token } });
                }
                if (res) setServices(res.data);
            } catch (err) { console.error(err); } finally { setFetchingServices(false); }
        };

        const fetchOrganization = async () => {
            if (!clientIdParam) return;

            try {
                const res = await axios.get(`${API_BASE_URL}/users/public/tenant-info/${clientIdParam}`);
                setOrganization(res.data);
            } catch (err) {
                console.error('Failed to fetch organization info:', err);
            }
        };

        fetchServices();
        fetchOrganization();

        if (user && user.role === 'user') {
            setPatientName(user.name || '');
            setPatientEmail(user.email || '');
            setPatientPhone(user.phone || '');
        }

        if (clientIdParam) fetchStaff(clientIdParam);
    }, [user]);

    const fetchStaff = async (cid, serviceId = null) => {
        setStaffLoading(true);
        try {
            const url = serviceId 
                ? `${API_BASE_URL}/users/public/staff/${cid}?serviceId=${serviceId}`
                : `${API_BASE_URL}/users/public/staff/${cid}`;
            const res = await axios.get(url);
            setStaff(res.data);
        } catch (err) {
            console.error('Failed to fetch staff:', err);
        } finally {
            setStaffLoading(false);
        }
    };

    // Fetch slots when date or service changes
    useEffect(() => {
        if (organization?.sector) {
            const sectorData = getSectorConfig(organization.sector);
            if (sectorData) {
                setConfig(sectorData);
            }
        }
    }, [organization]);

    // Fetch slots when date or service changes
    useEffect(() => {
        if (selectedService && selectedDate) {
            fetchSlots();
        }
    }, [selectedDate, selectedService]);

    const fetchSlots = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/slots/available`, {
                params: { 
                    date: selectedDate, 
                    clientId: selectedService.clientId,
                    serviceId: selectedService._id 
                }
            });
            setAvailableSlots(res.data);
        } catch (err) { console.error('Slots fetch error:', err); }
    };


    const handleSelectService = (service) => {
        setSelectedService(service);
        setFormData({});
        setFileUploads({});
        setStep(2);
    };

    const handleFieldChange = (fieldKey, value) => {
        setFormData(prev => ({ ...prev, [fieldKey]: value }));
    };

    const handleFileChange = (fieldKey, file) => {
        setFileUploads(prev => ({ ...prev, [fieldKey]: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!manualTime) return alert('Please select a time slot.');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('serviceId', selectedService._id);
            data.append('formData', JSON.stringify(formData));
            data.append('manualDate', selectedDate);
            data.append('manualTime', manualTime);
            data.append('city', city);
            data.append('address', address);

            if (selectedSlotObj && selectedSlotObj._id) {
                data.append('slotId', selectedSlotObj._id);
                if (selectedSlotObj.professionalId) {
                    const profId = selectedSlotObj.professionalId._id || selectedSlotObj.professionalId;
                    if (profId && profId !== 'null' && profId !== 'undefined') {
                        data.append('doctorId', profId);
                    }
                }
            }

            data.append('notes', notes);
            data.append('patientName', patientName);
            data.append('patientPhone', patientPhone);
            data.append('patientEmail', patientEmail);
            data.append('type', selectedService.category === 'medical' ? 'medical' : 'general');
            data.append('purposeType', selectedService.category === 'medical' ? 'doctor' : 'service');

            // Always include clientId — from service object or from URL param
            const urlClientId = new URLSearchParams(window.location.search).get('clientId');
            const resolvedClientId = selectedService.clientId || urlClientId;

            if (!resolvedClientId || resolvedClientId === 'null' || resolvedClientId === 'undefined') {
                setLoading(false);
                return alert('Tenant error: Organization ID is missing. Please use a valid booking link.');
            }
            data.append('clientId', resolvedClientId);

            Object.entries(fileUploads).forEach(([key, file]) => {
                if (file) data.append(key, file);
            });

            const headers = { 'Content-Type': 'multipart/form-data' };
            if (token) headers['x-auth-token'] = token;

            const res = await axios.post(`${API_BASE_URL}/appointments/book`, data, { headers });
            setBookingComplete(true);
            setShowConfirmModal(false);
            
            // SHOW THANK YOU POPUP AND REDIRECT
            // The success screen itself acts as the 'Thank You' popup now
            setTimeout(() => {
                navigate('/dashboard');
            }, 2500);
        } catch (error) {
            alert('Booking failed: ' + (error.response?.data?.message || error.message));
        } finally { setLoading(false); }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Visual Helpers
    const suggestedTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

    const formatUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    return (
        <div className="booking-v3" style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '80px' }}>
            {bookingComplete ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', padding: '20px' }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ 
                            background: 'white', 
                            padding: '60px 40px', 
                            borderRadius: '40px', 
                            textAlign: 'center', 
                            maxWidth: '600px', 
                            width: '100%', 
                            boxShadow: '0 40px 100px rgba(0,0,0,0.1)',
                            border: '1px solid #F1F5F9'
                        }}
                    >
                        <div style={{ width: '100px', height: '100px', background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', margin: '0 auto 32px', boxShadow: '0 10px 20px rgba(22, 101, 52, 0.1)' }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ duration: 0.6 }}
                            >
                                <CheckCircle2 size={60} />
                            </motion.div>
                        </div>
                        <h2 style={{ fontSize: '42px', fontWeight: 950, color: '#0F172A', marginBottom: '16px', background: 'linear-gradient(to right, #0F172A, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Thank You!</h2>
                        <p style={{ color: '#64748B', fontWeight: 700, fontSize: '18px', lineHeight: 1.6, marginBottom: '32px' }}>
                            Your appointment has been successfully scheduled.
                        </p>

                        <div style={{ background: '#F8FAFC', padding: '12px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '13px', fontWeight: 700, marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', background: '#4F46E5', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
                            Redirecting to dashboard automatically...
                        </div>

                        {/* ═══ PREMIUM UPI PAYMENT SECTION ═══ */}
                        {selectedService?.price > 0 && (
                                <div style={{ background: '#1A1A2E', borderRadius: '32px', padding: '32px', marginBottom: '32px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#5E239D', color: 'white', padding: '10px 20px', borderRadius: '100px', width: 'fit-content', margin: '0 auto 24px', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <Smartphone size={16} /> Pay Securely via PhonePe
                                    </div>
                                    
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Amount to Pay</div>
                                        <div style={{ fontSize: '42px', fontWeight: 950, color: '#10B981', textShadow: '0 0 20px rgba(16,185,129,0.3)' }}>Rs. {selectedService.price}</div>
                                    </div>

                                    <div style={{ position: 'relative', display: 'inline-block', padding: '20px', background: '#FFFFFF', borderRadius: '24px', marginBottom: '20px' }}>
                                    <img 
                                        src="/phonepe-qr.jpeg" 
                                        alt="UPI QR Code" 
                                        style={{ width: '180px', height: '180px', display: 'block', objectFit: 'contain' }}
                                        onError={(e) => {
                                            if (e.target.src.includes('phonepe-qr.jpeg')) {
                                                e.target.src = '/qr-payment-v2.png';
                                            } else {
                                                e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${selectedService.price}&cu=INR`;
                                            }
                                        }}
                                    />
                                    {/* Decorative corner accents */}
                                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderTop: '2px solid rgba(0,0,0,0.1)', borderLeft: '2px solid rgba(0,0,0,0.1)', borderRadius: '6px 0 0 0' }}></div>
                                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderBottom: '2px solid rgba(0,0,0,0.1)', borderRight: '2px solid rgba(0,0,0,0.1)', borderRadius: '0 0 6px 0' }}></div>
                                </div>
                                
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>Scan with any UPI App</div>
                                <div style={{ color: 'white', fontSize: '18px', fontWeight: 950, letterSpacing: '0.5px' }}>{UPI_ID}</div>
                                
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 16px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#10B981', fontWeight: 800, marginTop: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                                    Secure Verification Active
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <button 
                                onClick={() => navigate('/dashboard')} 
                                className="btn btn-primary" 
                                style={{ height: '60px', fontSize: '18px', borderRadius: '16px', background: '#10B981', border: 'none', fontWeight: 900 }}
                            >
                                I Have Paid - Go to Dashboard
                            </button>
                            <button 
                                onClick={() => {
                                    setBookingComplete(false);
                                    setStep(1);
                                    setSelectedService(null);
                                    setManualTime('');
                                }} 
                                style={{ background: '#F1F5F9', border: 'none', color: '#64748B', fontWeight: 700, cursor: 'pointer', fontSize: '14px', height: '50px', borderRadius: '12px' }}
                            >
                                Book Another Appointment
                            </button>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <>
                <style>{`
                .stepper { display: flex; gap: 40px; margin-bottom: 40px; justify-content: center; background: white; padding: 24px; border-radius: 20px; border: 1px solid #E2E8F0; }
                .step-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; alignItems: center; justify-content: center; font-weight: 900; font-size: 14px; transition: 0.3s; }
                .step-dot.active { background: var(--primary); color: white; box-shadow: 0 8px 15px rgba(59, 130, 246, 0.3); }
                .step-dot.pending { background: #E2E8F0; color: #94A3B8; }
                .glass-card { background: white; border-radius: 32px; border: 1px solid #E2E8F0; padding: 40px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
                .slot-card { border: 2px solid #F1F5F9; border-radius: 16px; padding: 16px; text-align: center; cursor: pointer; transition: 0.2s; background: #F8FAFC; }
                .slot-card:hover { border-color: var(--primary); transform: translateY(-3px); }
                .slot-card.selected { background: var(--primary); border-color: var(--primary); color: white; box-shadow: 0 8px 15px rgba(59, 130, 246, 0.4); }
                .service-btn { background: white; border: 1px solid #E2E8F0; border-radius: 24px; padding: 32px; text-align: left; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
                .service-btn:hover { border-color: var(--primary); transform: translateY(-5px); box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1); }
            `}</style>

            <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '24px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {organization?.organizationLogo ? (
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', background: 'white' }}>
                            <img src={organization.organizationLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    ) : (
                        <div style={{ background: 'var(--primary)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', color: 'white' }}>
                            <Building2 size={24} />
                        </div>
                    )}
                    <h1 style={{ fontSize: '20px', fontWeight: 900 }}>
                        {organization?.organizationName || organization?.name || `${config.label} Portal`} - {config.dashboard.bookingLabel}
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {organization?.organizationWebsite && (
                        <a 
                            href={formatUrl(organization.organizationWebsite)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: '#F1F5F9', 
                                padding: '10px 20px', 
                                borderRadius: '12px', 
                                textDecoration: 'none', 
                                color: '#475569', 
                                fontSize: '14px', 
                                fontWeight: 800,
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#E2E8F0'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#F1F5F9'}
                        >
                            <ExternalLink size={16} /> Visit Website
                        </a>
                    )}
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', fontWeight: 800, color: 'var(--text-gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={18} /> Cancel
                    </button>
                </div>
            </header>

            <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 40px' }}>
                {/* Visual Stepper */}
                <div className="stepper">
                    {[1, 2, 3].map(n => (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className={`step-dot ${step >= n ? 'active' : 'pending'}`}>{n}</div>
                            <span style={{ fontWeight: 800, color: step >= n ? 'var(--text-dark)' : '#94A3B8', fontSize: '14px' }}>
                                {n === 1 ? 'Service' : n === 2 ? 'Details' : 'Schedule'}
                            </span>
                            {n < 3 && <div style={{ width: '40px', height: '2px', background: step > n ? 'var(--primary)' : '#E2E8F0' }} />}
                        </div>
                    ))}
                </div>

                {/* STEP 1: Select Service */}
                {step === 1 && (
                    <div style={{ animation: 'fadeIn 0.4s ease' }}>
                        {/* SECTOR HERO IMAGE */}
                        <div style={{ width: '100%', height: '240px', borderRadius: '24px', overflow: 'hidden', marginBottom: '32px', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                            <img src={config.userSide?.image || `https://picsum.photos/seed/${config.label}/1200/400`} alt={config.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', display: 'flex', alignItems: 'flex-end', padding: '32px' }}>
                                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', width: '100%' }}>
                                    {organization?.organizationLogo && (
                                        <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '20px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                                            <img src={organization.organizationLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                            <h2 style={{ color: 'white', fontSize: '32px', margin: 0, fontWeight: 900 }}>
                                                {organization?.organizationName || organization?.name || `${config.label} Portal`}
                                            </h2>
                                            {organization?.organizationWebsite && (
                                                <a 
                                                    href={formatUrl(organization.organizationWebsite)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ 
                                                        display: 'inline-flex', 
                                                        alignItems: 'center', 
                                                        gap: '6px', 
                                                        background: 'rgba(255,255,255,0.2)', 
                                                        backdropFilter: 'blur(10px)',
                                                        padding: '6px 14px', 
                                                        borderRadius: '30px', 
                                                        textDecoration: 'none', 
                                                        color: 'white', 
                                                        fontSize: '12px', 
                                                        fontWeight: 800,
                                                        border: '1px solid rgba(255,255,255,0.3)'
                                                    }}
                                                >
                                                    <ExternalLink size={14} /> Website
                                                </a>
                                            )}
                                        </div>
                                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: '8px 0 0', fontWeight: 600, fontSize: '15px', maxWidth: '600px', lineHeight: 1.5 }}>
                                            {organization?.organizationDescription || `${config.userSide?.button} in just a few steps. Welcome to our professional scheduling portal.`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>What can we help you with today?</h2>
                            <p style={{ color: '#64748B', fontWeight: 600 }}>Browse our {config.dashboard.serviceLabel.toLowerCase()} or use the search bar to find what you need.</p>
                        </div>
                        
                        <div style={{ position: 'relative', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                            <Search size={22} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                className="input-field" 
                                placeholder="Search 'Doctor', 'Technical', 'HR'..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                style={{ width: '100%', height: '64px', borderRadius: '20px', fontSize: '16px', paddingLeft: '56px', background: 'white' }} 
                            />
                        </div>

                        {filteredServices.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
                                {(fetchingServices ? [1, 2, 3, 4] : filteredServices).map((s, idx) => (
                                    fetchingServices ? (
                                        <div key={idx} className="glass-card" style={{ height: '280px', background: '#F1F5F9', border: 'none', animation: 'pulse 1.5s infinite' }} />
                                    ) : (
                                        <motion.div 
                                            key={s._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ y: -8, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' }}
                                            style={{ 
                                                background: 'white', 
                                                borderRadius: '32px', 
                                                padding: '40px', 
                                                border: '1px solid #E2E8F0', 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                            onClick={() => handleSelectService(s)}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px', alignItems: 'center' }}>
                                                    <div style={{ padding: '12px', background: '#EEF2FF', color: 'var(--primary)', borderRadius: '16px' }}>
                                                        <Zap size={24} />
                                                    </div>
                                                    <div style={{ 
                                                        background: '#DCFCE7', 
                                                        padding: '6px 14px', 
                                                        borderRadius: '30px', 
                                                        color: '#166534', 
                                                        fontSize: '11px', 
                                                        fontWeight: 900, 
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        Slot Available
                                                    </div>
                                                </div>
                                                
                                                <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                                    {s.category || organization?.sector || 'Professional Category'}
                                                </div>
                                                <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px' }}>{s.name}</h3>
                                                
                                                {/* ASSIGNED STAFF NAMES DISPLAY */}
                                                {s.assignedStaff && s.assignedStaff.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                                                        {s.assignedStaff.map((staff, sidx) => (
                                                            <div key={sidx} style={{ 
                                                                fontSize: '12px', 
                                                                fontWeight: 800, 
                                                                color: 'var(--primary)', 
                                                                background: '#EFF6FF', 
                                                                padding: '4px 12px', 
                                                                borderRadius: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                border: '1px solid #DBEAFE'
                                                            }}>
                                                                <User size={12} /> {staff.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: '0 0 32px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {s.description || 'Secure your slot with our expert team today. Professional service guaranteed.'}
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
                                                <div style={{ display: 'flex', gap: '16px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={14} /> {s.duration}m
                                                    </div>
                                                    {s.price > 0 && <div style={{ fontSize: '13px', fontWeight: 800, color: '#3B82F6' }}>Rs. {s.price}</div>}
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const params = new URLSearchParams(window.location.search);
                                                        const cid = params.get('clientId');
                                                        if (cid) {
                                                            setStaffModalServiceId(s._id);
                                                            fetchStaff(cid, s._id);
                                                            setShowStaffModal(true);
                                                        }
                                                    }}
                                                    style={{ 
                                                        background: 'none', 
                                                        border: 'none', 
                                                        color: 'var(--primary)', 
                                                        fontSize: '13px', 
                                                        fontWeight: 900, 
                                                        textDecoration: 'underline', 
                                                        cursor: 'pointer',
                                                        padding: '0'
                                                    }}
                                                >
                                                    View {config.dashboard.employeeRole}s
                                                </button>
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </div>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.4s ease' }}>
                                <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
                                    <div style={{ width: '64px', height: '64px', background: '#F1F5F9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#94A3B8' }}>
                                        <Users size={32} />
                                    </div>
                                    <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>Meet Our Professional {config.dashboard.employeeRole}s</h3>
                                    <p style={{ color: '#64748B', fontWeight: 600, maxWidth: '500px', margin: '0 auto 32px' }}>While we don't have specific services listed yet, you can browse our team members below and book a consultation directly.</p>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', textAlign: 'left' }}>
                                        {staff.length > 0 ? staff.map(member => (
                                            <div key={member._id} style={{ background: '#F8FAFC', padding: '24px', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
                                                        {member.avatar ? (
                                                            <img src={member.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <User size={24} color="var(--primary)" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 900, fontSize: '16px' }}>{member.name}</div>
                                                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>{member.specialty || member.role}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => navigate(`/mini/${organization?._id || organization?.id}`)}
                                                    style={{ width: '100%', background: 'white', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    View Profile & Bio
                                                </button>
                                            </div>
                                        )) : (
                                            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94A3B8', fontSize: '14px', fontWeight: 600 }}>
                                                No team members found for this organization.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: Your Info */}
                {step === 2 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="glass-card">
                            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <User color="var(--primary)" /> Complete Your Profile
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 900, marginBottom: '8px', color: '#94A3B8', textTransform: 'uppercase' }}>Phone Number</label>
                                    <input className="input-field" type="tel" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} required style={{ paddingLeft: '20px', height: '56px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 900, marginBottom: '8px', color: '#94A3B8', textTransform: 'uppercase' }}>Email Address</label>
                                    <input className="input-field" type="email" value={patientEmail} onChange={e => setPatientEmail(e.target.value)} style={{ paddingLeft: '20px', height: '56px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 900, marginBottom: '8px', color: '#94A3B8', textTransform: 'uppercase' }}>City / Location</label>
                                    <input className="input-field" type="text" placeholder="e.g. Mumbai" value={city} onChange={e => setCity(e.target.value)} required style={{ paddingLeft: '20px', height: '56px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 900, marginBottom: '8px', color: '#94A3B8', textTransform: 'uppercase' }}>Full Address</label>
                                    <input className="input-field" type="text" placeholder="Street, Area..." value={address} onChange={e => setAddress(e.target.value)} style={{ paddingLeft: '20px', height: '56px' }} />
                                </div>
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px', borderTop: '1px solid #F1F5F9', paddingTop: '32px' }}>{config.label} Information</h3>
                            {config.userSide?.fields?.map((field, i) => (
                                <div key={`cfg-${i}`} style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>{field.label} {field.required && '*'}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea className="input-field" placeholder={field.placeholder} style={{ paddingLeft: '20px', height: '100px', paddingTop: '16px' }} onChange={e => {
                                            if (field.fieldKey === 'name') setPatientName(e.target.value);
                                            handleFieldChange(field.fieldKey, e.target.value);
                                        }}></textarea>
                                    ) : (
                                        <input className="input-field" type={field.type} placeholder={field.placeholder} style={{ paddingLeft: '20px', height: '56px' }} onChange={e => {
                                            if (field.fieldKey === 'name') setPatientName(e.target.value);
                                            handleFieldChange(field.fieldKey, e.target.value);
                                        }} />
                                    )}
                                </div>
                            ))}
                            
                            {selectedService?.customFields?.length > 0 && (
                                <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px', borderTop: '1px solid #F1F5F9', paddingTop: '32px' }}>Service-Specific Details</h3>
                            )}
                            {selectedService?.customFields?.map((field, i) => (
                                <div key={`svc-${i}`} style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>{field.label} {field.required && '*'}</label>
                                    <input className="input-field" placeholder={field.placeholder} style={{ paddingLeft: '20px', height: '56px' }} onChange={e => handleFieldChange(field.fieldKey, e.target.value)} />
                                </div>
                            ))}

                            <button onClick={() => setStep(3)} className="btn btn-primary" style={{ width: '100%', height: '60px', fontSize: '16px', marginTop: '20px' }}>
                                {config.userSide?.button || 'Choose Time Slot'} <ArrowLeft style={{ transform: 'rotate(180deg)', marginLeft: '8px' }} size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Slot Picking */}
                {step === 3 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="glass-card">
                            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '32px' }}>Pick a Date & Time</h2>
                            
                            <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', marginBottom: '40px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 900, color: '#94A3B8', marginBottom: '12px', textTransform: 'uppercase' }}>Select Calendar Day</label>
                                <input 
                                    type="date" 
                                    min={new Date().toISOString().split('T')[0]} 
                                    value={selectedDate} 
                                    onChange={e => setSelectedDate(e.target.value)}
                                    style={{ width: '100%', height: '56px', borderRadius: '12px', border: '1px solid #CBD5E1', padding: '0 20px', fontSize: '16px', fontWeight: 700 }}
                                />
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Available Slots for {selectedDate}</h3>
                            
                            {availableSlots.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
                                    {availableSlots.map(s => (
                                        <div 
                                            key={s._id} 
                                            className={`slot-card ${manualTime === s.startTime ? 'selected' : ''}`}
                                            onClick={() => {
                                                setManualTime(s.startTime);
                                                setSelectedSlotObj(s);
                                                setShowConfirmModal(true);
                                            }}
                                        >
                                            <Clock size={16} style={{ marginBottom: '4px' }} />
                                            <div style={{ fontWeight: 900 }}>{s.startTime}</div>
                                            <div style={{ fontSize: '10px', opacity: 0.8 }}>{selectedService.duration} min</div>
                                            <div style={{ fontSize: '11px', color: manualTime === s.startTime ? 'white' : 'var(--primary)', fontWeight: 800, marginTop: '8px', padding: '4px', borderRadius: '4px', background: manualTime === s.startTime ? 'rgba(255,255,255,0.2)' : 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {`${config.dashboard.employeeRole}: ${s.professionalName || s.professionalId?.name || 'Staff'}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ marginBottom: '40px' }}>
                                    <p style={{ fontSize: '14px', color: '#64748B', background: '#FFF7ED', padding: '16px', borderRadius: '12px', border: '1px solid #FFEDD5', marginBottom: '20px' }}>
                                        No slots specifically assigned for <b>{selectedService.name}</b> on this day. Please check another date or choose a flexible suggested time below.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                        {suggestedTimes.map(t => (
                                            <div 
                                                key={t} 
                                                className={`slot-card ${manualTime === t ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setManualTime(t);
                                                    setShowConfirmModal(true);
                                                }}
                                            >
                                                <div style={{ fontWeight: 900 }}>{t}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ PREMIUM PAYMENT AND ROCKET ANIMATIONS ═══ */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            position: 'fixed', 
                            inset: 0, 
                            background: 'rgba(15, 23, 42, 0.7)', 
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}
                        onClick={() => setShowConfirmModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{ 
                                background: 'white', 
                                width: '100%', 
                                maxWidth: '500px', 
                                borderRadius: '32px', 
                                padding: '40px', 
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Accent */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'var(--primary)' }} />
                            
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{ width: '64px', height: '64px', background: '#EEF2FF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary)' }}>
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Confirm Your Booking</h2>
                                <p style={{ color: '#64748B', marginTop: '8px', fontWeight: 600 }}>Please review your appointment details below.</p>
                            </div>

                            <div style={{ background: '#F8FAFC', borderRadius: '24px', padding: '24px', border: '1px solid #E2E8F0', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 700 }}>Organization (HR)</span>
                                        <span style={{ fontWeight: 800, textAlign: 'right' }}>{organization?.organizationName || organization?.name || 'Admin'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 700 }}>Sector</span>
                                        <span style={{ fontWeight: 800, textAlign: 'right', textTransform: 'capitalize' }}>{organization?.sector || config.label}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 700 }}>Service</span>
                                        <span style={{ fontWeight: 800, textAlign: 'right' }}>{selectedService?.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 700 }}>Date</span>
                                        <span style={{ fontWeight: 800 }}>{selectedDate}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 700 }}>Time</span>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{manualTime}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 700 }}>{config.dashboard.employeeRole || 'Employee'}</span>
                                        <span style={{ fontWeight: 800 }}>{selectedSlotObj ? (selectedSlotObj.professionalName || selectedSlotObj.professionalId?.name || 'Staff') : 'To be assigned'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ═══ PREMIUM UPI PAYMENT SECTION ═══ */}
                            {selectedService?.price > 0 && (
                                <div style={{ background: '#1A1A2E', borderRadius: '24px', padding: '24px', marginBottom: '32px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#5E239D', color: 'white', padding: '8px 16px', borderRadius: '100px', width: 'fit-content', margin: '0 auto 20px', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <Smartphone size={14} /> Pay via PhonePe
                                    </div>
                                    
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Amount Due</div>
                                        <div style={{ fontSize: '32px', fontWeight: 950, color: '#10B981' }}>Rs. {selectedService.price}</div>
                                    </div>

                                    <div style={{ position: 'relative', display: 'inline-block', padding: '15px', background: '#FFFFFF', borderRadius: '20px', marginBottom: '16px' }}>
                                        <img 
                                            src="/phonepe-qr.jpeg" 
                                            alt="UPI QR Code" 
                                            style={{ width: '160px', height: '160px', display: 'block', objectFit: 'contain' }}
                                            onError={(e) => {
                                                if (e.target.src.includes('phonepe-qr.jpeg')) {
                                                    e.target.src = '/qr-payment-v2.png';
                                                } else {
                                                    e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${selectedService.price}&cu=INR`;
                                                }
                                            }}
                                        />
                                        <div style={{ position: 'absolute', top: '8px', left: '8px', width: '16px', height: '16px', borderTop: '2px solid rgba(0,0,0,0.1)', borderLeft: '2px solid rgba(0,0,0,0.1)', borderRadius: '4px 0 0 0' }}></div>
                                        <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '16px', height: '16px', borderBottom: '2px solid rgba(0,0,0,0.1)', borderRight: '2px solid rgba(0,0,0,0.1)', borderRadius: '0 0 4px 0' }}></div>
                                    </div>
                                    
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>SCAN TO PAY SECURELY</div>
                                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 800 }}>{UPI_ID}</div>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={loading} 
                                    style={{ 
                                        width: '100%', 
                                        height: '64px', 
                                        background: 'var(--primary)', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '18px', 
                                        fontSize: '18px', 
                                        fontWeight: 800, 
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    {loading ? 'Processing...' : 'Confirm Appointment'}
                                    <ChevronRight size={20} />
                                </button>
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    style={{ 
                                        width: '100%', 
                                        height: '56px', 
                                        background: 'none', 
                                        color: '#64748B', 
                                        border: 'none', 
                                        fontSize: '15px', 
                                        fontWeight: 800, 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    Go Back & Edit
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STAFF MODAL */}
            <AnimatePresence>
                {showStaffModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowStaffModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="modal-card"
                            style={{ maxWidth: '700px', width: '90%', padding: '40px' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{ width: '48px', height: '48px', background: 'var(--bg-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
                                    <User size={24} />
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Meet Your {config.dashboard.employeeRole}</h2>
                                <p style={{ color: '#64748B', fontWeight: 600, marginTop: '4px' }}>Qualified professional assigned to this service</p>
                            </div>

                            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {staffLoading ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="spinner" style={{ margin: '0 auto 16px', borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
                                        <p style={{ fontWeight: 700, color: '#64748B' }}>Loading profile...</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                                        {staff.length > 0 ? staff.map((s, idx) => (
                                            <div key={idx} style={{ 
                                                background: '#F8FAFC', 
                                                padding: '32px', 
                                                borderRadius: '32px', 
                                                border: '1px solid #E2E8F0',
                                                width: '100%',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ 
                                                    width: '96px', 
                                                    height: '96px', 
                                                    borderRadius: '50%', 
                                                    background: 'linear-gradient(135deg, var(--primary), #6366F1)', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    color: 'white',
                                                    fontSize: '32px',
                                                    fontWeight: 900,
                                                    margin: '0 auto 20px',
                                                    overflow: 'hidden',
                                                    border: '4px solid white',
                                                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
                                                }}>
                                                    {s.avatar ? <img src={s.avatar} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : s.name.charAt(0)}
                                                </div>
                                                
                                                <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>{s.name}</h3>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 900, background: 'white', color: 'var(--primary)', padding: '6px 16px', borderRadius: '99px', border: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                                                        {s.specialty || s.role || config.dashboard.employeeRole}
                                                    </span>
                                                </div>
                                                
                                                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 24px' }}>
                                                    {s.bio || `Expert ${config.dashboard.employeeRole.toLowerCase()} with extensive experience in the ${organization?.sector} sector.`}
                                                </p>

                                                <div style={{ background: 'white', padding: '16px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                                                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Upcoming Slots</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                                        {s.availableSlots?.length > 0 ? s.availableSlots.slice(0, 3).map((slot, sidx) => (
                                                            <span key={sidx} style={{ fontSize: '11px', fontWeight: 800, color: '#475569', background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px' }}>
                                                                {slot.startTime}
                                                            </span>
                                                        )) : (
                                                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>Consult availability below</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                                <p style={{ fontWeight: 700, color: '#64748B' }}>No specific specialist profile available.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => setShowStaffModal(false)} 
                                className="btn btn-primary" 
                                style={{ width: '100%', height: '56px', marginTop: '32px', borderRadius: '16px' }}
                            >
                                Continue to Booking
                            </button>
                        </motion.div>
                    </motion.div>
                )}
                </AnimatePresence>
                </>
            )}
        </div>
    );
};

export default Booking;
