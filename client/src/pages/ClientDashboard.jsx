import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, Plus, LayoutDashboard, Briefcase, Calendar, ClipboardList, ShieldAlert, 
    Settings, PieChart, Activity, Bell, User as UserIcon, Trash2, StopCircle, 
    Video, CheckCircle, Clock, Building, Scissors, GripVertical, ChevronDown, X, XCircle, 
    ArrowRight, CreditCard, QrCode, Sparkles, ShieldCheck, Building2, ExternalLink, Play, MapPin,
    Wrench, BookOpen, Zap, ShoppingBag, Car, GraduationCap, Music, Dumbbell, Gavel, Heart, Home,
    Laptop, Cpu, Scale, Camera, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import { API_BASE_URL, UPI_ID, UPI_NAME } from '../config/api';
import { getSectorConfig } from '../config/sectorConfig';
import FloatingSupport from '../components/FloatingSupport';
import ChatWidget from '../components/ChatWidget';

const StatusBadge = ({ status }) => {
    const map = {
        pending:   { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
        confirmed: { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
        approved:  { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
        accepted:  { bg: '#E0F2FE', color: '#0284C7', label: 'Confirmed' },
        ongoing:   { bg: '#EDE9FE', color: '#7C3AED', label: 'Live' },
        completed: { bg: '#D1FAE5', color: '#059669', label: 'Completed' },
        rejected:  { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
    };
    const s = map[status] || { bg: '#F3F4F6', color: '#6B7280', label: status };
    return (
        <span style={{ padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {s.label}
        </span>
    );
};

const LockOverlay = ({ onUpgrade }) => (
    <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, borderRadius: '24px', textAlign: 'center', padding: '24px', animation: 'fadeIn 0.5s ease'
    }}>
        <div style={{ 
            background: 'white', padding: '32px', borderRadius: '24px', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)', maxWidth: '400px', border: '1px solid #E2E8F0' 
        }}>
            <div style={{ 
                background: '#FEE2E2', color: '#EF4444', width: '64px', height: '64px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' 
            }}>
                <ShieldAlert size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Feature Locked</h3>
            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px', fontWeight: 600 }}>
                Your 24-Hour Free Trial has ended. Please upgrade to unlock full access to staff, slots, and bookings.
            </p>
            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px' }} onClick={onUpgrade}>
                Upgrade Now
            </button>
        </div>
    </div>
);

const ClientDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const config = getSectorConfig(user?.sector || 'general');
    
    // Check for Plan Expiry
    const isExpired = user.plan?.expiryDate && new Date(user.plan.expiryDate) < new Date();
    const daysRemaining = user.plan?.expiryDate 
        ? Math.ceil((new Date(user.plan.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    console.log('DEBUG_EXPIRY:', { 
        email: user.email,
        plan: user.plan, 
        expiryDate: user.plan?.expiryDate, 
        now: new Date().toISOString(),
        isExpired 
    });

    
    // Data States
    const [employees, setEmployees] = useState([]);
    const [services, setServices] = useState([]);
    const [slots, setSlots] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [metrics, setMetrics] = useState({
        totalBookings: 0, 
        todayBookings: 0, 
        availableSlots: 0, 
        totalEmployees: 0,
        pendingRequests: 0,
        employeeAvailability: 0
    });
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showTutorialModal, setShowTutorialModal] = useState(false);
    const [tutorialScene, setTutorialScene] = useState(1);
    
    // Forms
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'employee', department: '' });
    const [serviceForm, setServiceForm] = useState({ 
        name: '', description: '', price: 0, duration: 30, category: '',
        customFields: [] 
    });
    const [allSectors, setAllSectors] = useState([]);
    const [onboardingSector, setOnboardingSector] = useState(null);
    const [onboardingSubSector, setOnboardingSubSector] = useState('');
    const [onboardingStep, setOnboardingStep] = useState(1); // 1: Category, 2: Sub-sector, 3: Success
    const [onboardingLoading, setOnboardingLoading] = useState(false);
    const [slotForm, setSlotForm] = useState({ date: '', startTime: '', endTime: '', type: 'general', bufferTime: 15, professionalId: '', serviceId: '' });
    const [bookingForm, setBookingForm] = useState({ 
        patientName: '', patientPhone: '', patientEmail: '',
        manualDate: new Date().toISOString().split('T')[0], manualTime: '', 
        professionalId: '', notes: '', type: '', purpose: '' 
    });
    const [selectedService, setSelectedService] = useState(null); // for viewing service details
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showSaaSRequestSuccess, setShowSaaSRequestSuccess] = useState(false);
    const [showTrainingPayment, setShowTrainingPayment] = useState(false);
    const [selectedTrainingPackage, setSelectedTrainingPackage] = useState(null);
    const [showUpgradeFlow, setShowUpgradeFlow] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [organizationForm, setOrganizationForm] = useState({
        organizationName: '',
        organizationWebsite: '',
        organizationLogo: '',
        organizationImages: '',
        organizationDescription: ''
    });
    const [paymentStage, setPaymentStage] = useState('idle'); // idle, processing, rocket, completed
    const [paymentData, setPaymentData] = useState({ amount: 'Rs. 1', title: 'Plan Upgrade' });
    const [isServiceEdit, setIsServiceEdit] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState(null);

    const staticSectors = [
        { id: 'healthcare', label: 'Healthcare', icon: <Building2 />, color: '#EF4444' },
        { id: 'education', label: 'Education', icon: <Building2 />, color: '#3B82F6' },
        { id: 'salon', label: 'Salon & Beauty', icon: <Scissors />, color: '#EC4899' },
        { id: 'hospitality', label: 'Hospitality', icon: <Building2 />, color: '#F59E0B' },
        { id: 'corporate', label: 'Corporate', icon: <Briefcase />, color: '#6366F1' },
        { id: 'automobile', label: 'Automobile', icon: <Building2 />, color: '#F97316' },
        { id: 'fitness', label: 'Fitness', icon: <Zap />, color: '#10B981' },
        { id: 'legal', label: 'Legal', icon: <Building2 />, color: '#64748B' },
        { id: 'property', label: 'Property', icon: <Building2 />, color: '#8B5CF6' },
        { id: 'repair', label: 'Repair Services', icon: <Wrench />, color: '#F97316' },
        { id: 'events', label: 'Events', icon: <Building2 />, color: '#D946EF' },
        { id: 'retail', label: 'Retail', icon: <ShoppingBag />, color: '#06B6D4' },
        { id: 'consultancy', label: 'Consultancy', icon: <Briefcase />, color: '#94A3B8' }
    ];

    // ═══ PAYMENT ANIMATION OVERLAY ═══
    const PaymentAnimationOverlay = () => {
        if (paymentStage === 'idle') return null;

        return (
            <div className="payment-overlay">
                <div className="glow-circle"></div>
                
                {paymentStage === 'processing' && (
                    <div className="processing-container" style={{ animation: 'fadeIn 0.8s ease-out' }}>
                        <div style={{ position: 'relative' }}>
                            <img 
                                src="/images/payment_processing.png" 
                                className="processing-image" 
                                alt="Processing" 
                                style={{ borderRadius: '32px', border: '8px solid rgba(255,255,255,0.1)' }}
                            />
                            <div style={{ 
                                position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)',
                                background: 'white', color: '#0F172A', padding: '12px 24px', borderRadius: '16px',
                                fontWeight: 900, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                                <div className="spinner" style={{ width: '16px', height: '16px', border: '3px solid #E2E8F0', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                SECURE VERIFICATION
                            </div>
                        </div>
                        <div className="success-text" style={{ marginTop: '40px' }}>
                            Verifying Transaction...
                        </div>
                        <p style={{ opacity: 0.6, fontSize: '14px', maxWidth: '300px', textAlign: 'center' }}>
                            Our AI is synchronizing your premium workstation assets. This usually takes a few seconds.
                        </p>
                    </div>
                )}

                {paymentStage === 'rocket' && (
                    <>
                        <img 
                            src="/images/payment_success_rocket.png" 
                            className="rocket-element" 
                            alt="Rocket" 
                        />
                        <div className="processing-container">
                            <div className="success-text" style={{ fontSize: '48px', letterSpacing: '-2px' }}>LIFT OFF!</div>
                            <p style={{ fontSize: '20px', opacity: 0.9, fontWeight: 700 }}>Activating Premium Infrastructure...</p>
                        </div>
                        {/* Star particles with random directions */}
                        {[...Array(30)].map((_, i) => {
                            const angle = Math.random() * Math.PI * 2;
                            const dist = 100 + Math.random() * 200;
                            const x = Math.cos(angle) * dist;
                            const y = Math.sin(angle) * dist;
                            return (
                                <div 
                                    key={i} 
                                    className="stars-particle" 
                                    style={{ 
                                        left: '50%', 
                                        top: '50%',
                                        '--tw-translate-x': `${x}px`,
                                        '--tw-translate-y': `${y}px`,
                                        animationDelay: `${Math.random() * 0.5}s`,
                                        opacity: 0
                                    }}
                                ></div>
                            );
                        })}
                    </>
                )}

                {paymentStage === 'completed' && (
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="processing-container"
                    >
                        <div style={{ 
                            width: '120px', height: '120px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            boxShadow: '0 0 60px rgba(16, 185, 129, 0.6)', border: '4px solid white'
                        }}>
                            <CheckCircle size={70} color="white" />
                        </div>
                        <div className="success-text" style={{ background: 'linear-gradient(to right, #10B981, #34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            MISSION ACCOMPLISHED
                        </div>
                        <p style={{ opacity: 0.8, fontWeight: 700 }}>Your workspace is now upgraded to Premium.</p>
                    </motion.div>
                )}
            </div>
        );
    };

    // 🤖 AI INDUSTRY TEMPLATES — auto-suggest fields based on category
    const industryTemplates = {
        'Hospital': {
            icon: <Building2 />,
            suggestedFields: [
                { label: 'Patient Name', fieldKey: 'patient_name', fieldType: 'text', required: true, options: [], placeholder: 'Full name of the patient' },
                { label: 'Age', fieldKey: 'age', fieldType: 'number', required: true, options: [], placeholder: 'Patient age' },
                { label: 'Phone', fieldKey: 'phone', fieldType: 'phone', required: true, options: [], placeholder: '+91 98765 43210' },
                { label: 'Symptoms / Reason', fieldKey: 'symptoms', fieldType: 'textarea', required: true, options: [], placeholder: 'Describe symptoms or reason for visit' },
                { label: 'Blood Group', fieldKey: 'blood_group', fieldType: 'dropdown', required: false, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], placeholder: '' },
                { label: 'Previous Reports', fieldKey: 'reports', fieldType: 'file', required: false, options: [], placeholder: '' },
            ]
        },
        'School': {
            icon: <Building2 />,
            suggestedFields: [
                { label: 'Student Name', fieldKey: 'student_name', fieldType: 'text', required: true, options: [], placeholder: 'Full name of student' },
                { label: 'Parent Name', fieldKey: 'parent_name', fieldType: 'text', required: true, options: [], placeholder: 'Father / Mother name' },
                { label: 'Class / Grade', fieldKey: 'class_grade', fieldType: 'dropdown', required: true, options: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'], placeholder: '' },
                { label: 'Phone', fieldKey: 'phone', fieldType: 'phone', required: true, options: [], placeholder: '+91 98765 43210' },
                { label: 'Purpose of Visit', fieldKey: 'purpose', fieldType: 'dropdown', required: true, options: ['Admission', 'PTM', 'Counseling', 'Fee Discussion', 'Other'], placeholder: '' },
            ]
        },
        'College': {
            icon: <Building2 />,
            suggestedFields: [
                { label: 'Student Name', fieldKey: 'student_name', fieldType: 'text', required: true, options: [], placeholder: 'Full name' },
                { label: 'Email', fieldKey: 'email', fieldType: 'email', required: true, options: [], placeholder: 'student@email.com' },
                { label: 'Course Interested', fieldKey: 'course', fieldType: 'text', required: true, options: [], placeholder: 'B.Tech, MBA, BCA...' },
                { label: 'Previous Marks (%)', fieldKey: 'marks', fieldType: 'number', required: true, options: [], placeholder: '85' },
                { label: 'Phone', fieldKey: 'phone', fieldType: 'phone', required: true, options: [], placeholder: '+91 98765 43210' },
                { label: 'Certificates', fieldKey: 'certificates', fieldType: 'file', required: false, options: [], placeholder: '' },
            ]
        },
        'Company': {
            icon: <Briefcase />,
            suggestedFields: [
                { label: 'Candidate Name', fieldKey: 'candidate_name', fieldType: 'text', required: true, options: [], placeholder: 'Full name' },
                { label: 'Email', fieldKey: 'email', fieldType: 'email', required: true, options: [], placeholder: 'candidate@email.com' },
                { label: 'Phone', fieldKey: 'phone', fieldType: 'phone', required: true, options: [], placeholder: '+91 98765 43210' },
                { label: 'Position Applied', fieldKey: 'position', fieldType: 'text', required: true, options: [], placeholder: 'e.g. Frontend Developer' },
                { label: 'Experience (years)', fieldKey: 'experience', fieldType: 'number', required: true, options: [], placeholder: '3' },
                { label: 'Resume', fieldKey: 'resume', fieldType: 'file', required: true, options: [], placeholder: '' },
            ]
        },
        'Salon': {
            icon: <Scissors />,
            suggestedFields: [
                { label: 'Customer Name', fieldKey: 'customer_name', fieldType: 'text', required: true, options: [], placeholder: 'Full name' },
                { label: 'Phone', fieldKey: 'phone', fieldType: 'phone', required: true, options: [], placeholder: '+91 98765 43210' },
                { label: 'Service Type', fieldKey: 'service_type', fieldType: 'dropdown', required: true, options: ['Haircut', 'Facial', 'Spa', 'Manicure', 'Pedicure', 'Hair Color', 'Other'], placeholder: '' },
                { label: 'Special Requests', fieldKey: 'special_requests', fieldType: 'textarea', required: false, options: [], placeholder: 'Any specific requests...' },
            ]
        },
        'Automobile': {
            icon: <Building2 />,
            suggestedFields: [
                { label: 'Customer Name', fieldKey: 'customer_name', fieldType: 'text', required: true, options: [], placeholder: 'Full name' },
                { label: 'Phone', fieldKey: 'phone', fieldType: 'phone', required: true, options: [], placeholder: '+91 98765 43210' },
                { label: 'Vehicle Number', fieldKey: 'vehicle_number', fieldType: 'text', required: true, options: [], placeholder: 'TN 01 AB 1234' },
                { label: 'Vehicle Type', fieldKey: 'vehicle_type', fieldType: 'dropdown', required: true, options: ['Two Wheeler', 'Car', 'SUV', 'Truck', 'Other'], placeholder: '' },
                { label: 'Service Required', fieldKey: 'service_required', fieldType: 'dropdown', required: true, options: ['General Service', 'Oil Change', 'Brake Repair', 'Engine Check', 'Denting & Painting', 'Full Service'], placeholder: '' },
                { label: 'Problem Description', fieldKey: 'problem', fieldType: 'textarea', required: false, options: [], placeholder: 'Describe the issue...' },
            ]
        },
        'Restaurant': {
            icon: <ShoppingBag />,
            suggestedFields: [
                { label: 'Guest Name', fieldKey: 'guest_name', fieldType: 'text', required: true, options: [], placeholder: 'Reservation name' },
                { label: 'Phone', fieldKey: 'phone', fieldType: 'phone', required: true, options: [], placeholder: '+91 98765 43210' },
                { label: 'Number of Guests', fieldKey: 'guests', fieldType: 'number', required: true, options: [], placeholder: '4' },
                { label: 'Seating Preference', fieldKey: 'seating', fieldType: 'dropdown', required: false, options: ['Indoor', 'Outdoor', 'Private Room', 'No Preference'], placeholder: '' },
                { label: 'Special Occasion', fieldKey: 'occasion', fieldType: 'text', required: false, options: [], placeholder: 'Birthday, Anniversary...' },
            ]
        },
        'Gym / Fitness': {
            icon: <Zap />,
            suggestedFields: [
                { label: 'Member Name', fieldKey: 'member_name', fieldType: 'text', required: true, options: [], placeholder: 'Full name' },
                { label: 'Phone', fieldKey: 'phone', fieldType: 'phone', required: true, options: [], placeholder: '+91 98765 43210' },
                { label: 'Fitness Goal', fieldKey: 'fitness_goal', fieldType: 'dropdown', required: true, options: ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Yoga', 'CrossFit', 'Cardio'], placeholder: '' },
                { label: 'Medical Conditions', fieldKey: 'medical', fieldType: 'textarea', required: false, options: [], placeholder: 'Any injuries or conditions...' },
            ]
        },
        'Legal / Consultant': {
            icon: <Briefcase />,
            suggestedFields: [
                { label: 'Client Name', fieldKey: 'client_name', fieldType: 'text', required: true, options: [], placeholder: 'Full name' },
                { label: 'Email', fieldKey: 'email', fieldType: 'email', required: true, options: [], placeholder: 'client@email.com' },
                { label: 'Phone', fieldKey: 'phone', fieldType: 'phone', required: true, options: [], placeholder: '+91 98765 43210' },
                { label: 'Consultation Type', fieldKey: 'consult_type', fieldType: 'dropdown', required: true, options: ['Legal Advice', 'Tax Filing', 'Business Registration', 'Property', 'Family Law', 'Other'], placeholder: '' },
                { label: 'Brief Description', fieldKey: 'description', fieldType: 'textarea', required: true, options: [], placeholder: 'Briefly describe your case...' },
                { label: 'Relevant Documents', fieldKey: 'documents', fieldType: 'file', required: false, options: [], placeholder: '' },
            ]
        },
        'Repair Services': {
            icon: <Wrench />,
            suggestedFields: [
                { label: 'Customer Name', fieldKey: 'customer_name', fieldType: 'text', required: true, options: [], placeholder: 'Full name' },
                { label: 'Issue Description', fieldKey: 'issue', fieldType: 'textarea', required: true, options: [], placeholder: 'What needs to be fixed?' },
                { label: 'Device / Appliance', fieldKey: 'device', fieldType: 'text', required: true, options: [], placeholder: 'e.g. AC, Washing Machine, Phone' },
                { label: 'Address', fieldKey: 'address', fieldType: 'textarea', required: true, options: [], placeholder: 'Service location' },
                { label: 'Photo of Issue', fieldKey: 'photo', fieldType: 'file', required: false, options: [], placeholder: '' },
            ]
        },
        'Events & Media': {
            icon: <Building2 />,
            suggestedFields: [
                { label: 'Client Name', fieldKey: 'client_name', fieldType: 'text', required: true, options: [], placeholder: 'Full name' },
                { label: 'Event Type', fieldKey: 'event_type', fieldType: 'dropdown', required: true, options: ['Wedding', 'Corporate Event', 'Birthday', 'Concert / Show', 'Photography', 'Other'], placeholder: '' },
                { label: 'Event Date', fieldKey: 'event_date', fieldType: 'date', required: true, options: [], placeholder: '' },
                { label: 'Venue / Location', fieldKey: 'venue', fieldType: 'text', required: true, options: [], placeholder: 'Where is the event?' },
                { label: 'Expected Guest Count', fieldKey: 'guests', fieldType: 'number', required: false, options: [], placeholder: 'e.g. 200' },
                { label: 'Special Requirements', fieldKey: 'requirements', fieldType: 'textarea', required: false, options: [], placeholder: 'Theme, equipment, etc.' },
            ]
        },
        'Other': {
            icon: <Building2 />,
            suggestedFields: [
                { label: 'Full Name', fieldKey: 'full_name', fieldType: 'text', required: true, options: [], placeholder: 'Customer full name' },
                { label: 'Phone', fieldKey: 'phone', fieldType: 'phone', required: true, options: [], placeholder: '+91 98765 43210' },
                { label: 'Email', fieldKey: 'email', fieldType: 'email', required: false, options: [], placeholder: 'email@example.com' },
                { label: 'Requirement', fieldKey: 'requirement', fieldType: 'textarea', required: true, options: [], placeholder: 'Describe what you need...' },
            ]
        },
    };

    // 🗺️ Map User Sector to allowed Industry Templates
    const sectorToTemplateMap = {
        'healthcare': [{ id: 'healthcare', label: 'Healthcare', icon: <Building2 />, color: '#EF4444' },],
        'education': [{ id: 'education', label: 'Education', icon: <Building2 />, color: '#3B82F6' },],
        'salon': [{ id: 'salon', label: 'Salon & Beauty', icon: <Scissors />, color: '#EC4899' },],
        'hospitality': [{ id: 'hospitality', label: 'Hospitality', icon: <Building2 />, color: '#F59E0B' },],
        'corporate': [{ id: 'corporate', label: 'Corporate', icon: <Briefcase />, color: '#6366F1' },],
        'automobile': [{ id: 'automobile', label: 'Automobile', icon: <Building2 />, color: '#F97316' },],
        'fitness': [{ id: 'fitness', label: 'Fitness', icon: <Zap />, color: '#10B981' },],
        'legal': [{ id: 'legal', label: 'Legal', icon: <Building2 />, color: '#64748B' },],
        'property': [{ id: 'property', label: 'Property', icon: <Building2 />, color: '#8B5CF6' },],
        'repair': [{ id: 'repair', label: 'Repair Services', icon: <Wrench />, color: '#F97316' },],
        'events': [{ id: 'events', label: 'Events', icon: <Building2 />, color: '#D946EF' },],
        'retail': [{ id: 'retail', label: 'Retail', icon: <ShoppingBag />, color: '#06B6D4' },],
        'consultancy': [{ id: 'consultancy', label: 'Consultancy', icon: <Briefcase />, color: '#94A3B8' },],
        'general': [{ id: 'other', label: 'Other', icon: <Building2 />, color: '#64748B' },]
    };

    // Get normalized sector key for filtering templates
    const getNormalizedKey = (rawSector) => {
        let key = rawSector?.toLowerCase() || 'general';
        if (key.includes('health') || key.includes('hospital')) return 'healthcare';
        if (key.includes('beauty') || key.includes('salon')) return 'salon';
        if (key.includes('hotel') || key.includes('restaurant') || key.includes('hospitality')) return 'hospitality';
        if (key.includes('school') || key.includes('college') || key.includes('education')) return 'education';
        if (key.includes('company') || key.includes('corporate')) return 'corporate';
        if (key.includes('gym') || key.includes('fitness')) return 'fitness';
        if (key.includes('legal') || key.includes('consult')) return 'consultancy';
        if (key.includes('garage') || key.includes('auto')) return 'automobile';
        if (key.includes('repair') || key.includes('service center')) return 'repair';
        if (key.includes('event') || key.includes('media')) return 'events';
        return key;
    };
    
    // Check both potential sector fields
    const activeSectorRaw = user?.organizationSector || user?.sector || 'general';
    const normalizedSector = getNormalizedKey(activeSectorRaw);
    
    // Ensure we always have at least 'Other' or a sensible default
    let allowedCategories = sectorToTemplateMap[normalizedSector] || [];
    if (allowedCategories.length === 0) {
        allowedCategories = ['Other'];
    }

    const applyTemplate = (categoryKey) => {
        const template = industryTemplates[categoryKey];
        if (!template) return;
        
        setServiceForm(prev => ({
            ...prev,
            category: categoryKey,
            customFields: [...template.suggestedFields]
        }));
    };

    // Form Builder helpers
    const addFormField = () => {
        const newField = { label: '', fieldKey: '', fieldType: 'text', options: [], required: false, placeholder: '' };
        setServiceForm(prev => ({ ...prev, customFields: [...prev.customFields, newField] }));
    };

    const updateFormField = (index, key, value) => {
        setServiceForm(prev => {
            const fields = [...prev.customFields];
            fields[index] = { ...fields[index], [key]: value };
            // Auto-generate fieldKey from label
            if (key === 'label') {
                fields[index].fieldKey = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            }
            return { ...prev, customFields: fields };
        });
    };

    const removeFormField = (index) => {
        setServiceForm(prev => ({ ...prev, customFields: prev.customFields.filter((_, i) => i !== index) }));
    };

    // Initial Fetch Map
    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            // Fetch Staff (Employees & HR)
            const staffRes = await axios.get(`${API_BASE_URL}/users`, { headers: { 'x-auth-token': token } });
            // Filter out non-client related users if backend doesn't, but assuming tenantGuard works:
            // Backend tenantGuard already filters by clientId — just exclude the logged-in client themselves
            const myId = user._id || user.id;
            const staffData = staffRes.data.filter(u => {
                // Exclude the logged-in client user and regular users (customers) from the staff list
                if (String(u._id) === String(myId)) return false;
                if (u.role === 'user') return false;
                // If backend already applied tenantFilter, accept all remaining users
                // Otherwise, double-check clientId match using string comparison
                if (user.clientId && u.clientId) {
                    const uCid = u.clientId?._id || u.clientId;
                    return String(uCid) === String(user.clientId);
                }
                return true;
            });
            setEmployees(staffData);

            // Fetch Services
            const servRes = await axios.get(`${API_BASE_URL}/services`, { headers: { 'x-auth-token': token } });
            setServices(servRes.data);

            // Fetch Slots
            const slotRes = await axios.get(`${API_BASE_URL}/slots`, { headers: { 'x-auth-token': token } });
            setSlots(slotRes.data);

            // Fetch Bookings
            const bookRes = await axios.get(`${API_BASE_URL}/appointments/my-appointments`, { headers: { 'x-auth-token': token } });
            setBookings(bookRes.data);

            // Fetch Customers directly from the User collection
            const custRes = await axios.get(`${API_BASE_URL}/users/customer-list`, { headers: { 'x-auth-token': token } });
            setCustomers(custRes.data);

            // Calc Metrics
            const today = new Date().toISOString().split('T')[0];
            setMetrics({
                totalBookings: bookRes.data.length,
                todayBookings: bookRes.data.filter(b => b.date === today || b.manualDate === today).length,
                availableSlots: slotRes.data.filter(s => !s.isBooked).length,
                totalEmployees: staffData.length,
                pendingRequests: bookRes.data.filter(b => b.status === 'pending').length,
                employeeAvailability: staffData.length > 0 
                    ? Math.round(((staffData.length - new Set(bookRes.data.filter(b => (b.date === today || b.manualDate === today)).map(b => b.hrId?._id || b.hrId)).size) / staffData.length) * 100) 
                    : 0
            });

            setOrganizationForm({
                organizationName: user.organizationName || '',
                organizationWebsite: user.organizationWebsite || '',
                organizationLogo: user.organizationLogo || '',
                organizationImages: user.organizationImages || '',
                organizationDescription: user.organizationDescription || '',
                organizationStory: user.organizationStory || '',
                organizationPurpose: user.organizationPurpose || ''
            });

            // Fetch All Sectors for onboarding
            const sectorsRes = await axios.get(`${API_BASE_URL}/sectors`);
            setAllSectors(sectorsRes.data);

        } catch (error) {
            console.error("Fetch Data Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return navigate('/login');
        if (user.role !== 'client') return navigate('/dashboard'); // Security fallback
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate]);

    // Handle Forms
    const handleAddStaff = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const endpoint = staffForm.role === 'hr' ? '/users/create-hr' : '/users/create-professional';
            await axios.post(`${API_BASE_URL}${endpoint}`, staffForm, { headers: { 'x-auth-token': token } });
            setShowStaffModal(false);
            setStaffForm({ name: '', email: '', password: '', role: 'employee', department: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to add staff");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user? This cannot be undone.')) return;
        try {
            await axios.delete(`${API_BASE_URL}/users/${id}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
            fetchData();
        } catch (err) { alert('Failed to delete user'); }
    };

    const handleBlockUser = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`${API_BASE_URL}/users/${id}/block`, {}, { 
                headers: { 'x-auth-token': localStorage.getItem('token') } 
            });
            fetchData();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`${API_BASE_URL}/users/${selectedUserId}`, staffForm, { headers: { 'x-auth-token': token } });
            setShowStaffModal(false);
            setIsEditMode(false);
            setStaffForm({ name: '', email: '', password: '', role: 'employee', department: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update staff");
        }
    };

    const handleCreateService = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (isServiceEdit) {
                await axios.patch(`${API_BASE_URL}/services/${selectedServiceId}`, serviceForm, { headers: { 'x-auth-token': token } });
                alert("Service updated successfully!");
            } else {
                await axios.post(`${API_BASE_URL}/services`, serviceForm, { headers: { 'x-auth-token': token } });
                alert("Service created successfully!");
            }
            setShowServiceModal(false);
            setIsServiceEdit(false);
            setServiceForm({ name: '', description: '', price: 0, duration: 30, category: '', customFields: [] });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDeleteService = async (id) => {
        if (!window.confirm('Deactivate this service?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_BASE_URL}/services/${id}`, { headers: { 'x-auth-token': token } });
            fetchData();
        } catch (error) {
            alert('Failed to remove service');
        }
    };

    const handleDeleteBooking = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_BASE_URL}/appointments/${id}`, { headers: { 'x-auth-token': token } });
            fetchData();
        } catch (error) {
            alert('Failed to remove appointment');
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm('Remove this operational slot? This will prevent new bookings on this time.')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_BASE_URL}/slots/${id}`, { headers: { 'x-auth-token': token } });
            fetchData();
        } catch (error) {
            alert('Failed to remove slot');
        }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            // Provide professionalName manually if backend expects it
            const professional = employees.find(e => e._id === slotForm.professionalId);
            const payload = { ...slotForm, professionalName: professional ? professional.name : 'Unknown' };
            await axios.post(`${API_BASE_URL}/slots`, payload, { headers: { 'x-auth-token': token } });
            setShowSlotModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create slot");
        }
    };

    const handleUpdateBookingStatus = async (id, status) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`${API_BASE_URL}/appointments/${id}/status`, { status }, { 
                headers: { 'x-auth-token': localStorage.getItem('token') } 
            });
            fetchData();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handleCreateBooking = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const typeMap = { hospital: 'medical', interview: 'interview', service: 'general', automobile: 'automotive' };
            const purposeTypeMap = { hospital: 'doctor', interview: 'interview', service: 'service', automobile: 'agent' };
            
            const payload = {
                ...bookingForm,
                booking_type: 'offline',
                type: typeMap[user.userType] || 'general',
                purposeType: purposeTypeMap[user.userType] || 'meeting',
                clientId: user.clientId,
                hrId: bookingForm.professionalId
            };

            await axios.post(`${API_BASE_URL}/appointments/book`, payload, { headers: { 'x-auth-token': token } });
            setShowBookingModal(false);
            setBookingForm({ 
                patientName: '', patientPhone: '', patientEmail: '', 
                manualDate: new Date().toISOString().split('T')[0], manualTime: '', 
                professionalId: '', notes: '', type: '', purpose: '' 
            });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create booking");
        }
    };

    const handleSaaSRequest = async (type, extraData = {}) => {
        const token = localStorage.getItem('token');
        try {
            let msg = `Client ${user.name} from ${user.organizationName} requested ${type.replace('_', ' ')}.`;
            if (extraData.packageName) msg += ` Selected Package: ${extraData.packageName}`;
            
            const res = await axios.post(`${API_BASE_URL}/saas/request`, { type, message: msg, sector: user.sector }, { headers: { 'x-auth-token': token } });
            
            if (res.data.autoApproved) {
                alert("SYSTEM AUTO-APPROVAL: Your request has been approved instantly! Your dashboard is now UNLOCKED.");
                window.location.reload(); // Force refresh to update user plan context
            } else {
                setShowSaaSRequestSuccess(true);
                setShowTrainingPayment(false);
                setTimeout(() => setShowSaaSRequestSuccess(false), 5000);
            }
        } catch (error) {
            alert("Error sending request: " + (error.response?.data?.message || error.message));
        }
    };

    const handleConnectPayment = () => {
        setShowPaymentModal(true);
    };

    const processPayment = async () => {
        setPaymentStage('processing');
        setShowPaymentModal(false);
        
        // 1. Show Processing Screen (3.5 seconds)
        setTimeout(() => {
             // 2. Launch Rocket Animation (2.8 seconds)
             setPaymentStage('rocket');
             
             // Sync with backend while rocket is flying
             handleSaaSRequest('upgrade_plan');

             setTimeout(() => {
                 // 3. Show Completion State (2 seconds)
                 setPaymentStage('completed');
                 
                 // 4. Final Redirect/Refresh
                 setTimeout(() => {
                     window.location.reload();
                 }, 2000);
             }, 2800);
        }, 3500);
    };

    const handleUpdateOrgProfile = async (e) => {
        if (e) e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const orgId = user._id || user.id;
            await axios.patch(`${API_BASE_URL}/users/${orgId}`, organizationForm, { headers: { 'x-auth-token': token } });
            alert("Organization profile updated successfully!");
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update organization profile");
        }
    };

    const handleCompleteOnboarding = async () => {
        setOnboardingLoading(true);
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`${API_BASE_URL}/users/${user._id || user.id}`, {
                sector: onboardingSector,
                subCategory: onboardingSubSector
            }, { 
                headers: { 'x-auth-token': token } 
            });
            setOnboardingStep(3);
            setTimeout(() => {
                window.location.reload(); // Refresh to apply sector config everywhere
            }, 2000);
        } catch (err) {
            alert('Selection failed');
        } finally {
            setOnboardingLoading(false);
        }
    };

    const NavItem = ({ id, label, icon: Icon, alert }) => (
        <button 
            onClick={() => setActiveTab(id)}
            style={{
                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: activeTab === id ? 'var(--primary)' : 'transparent',
                color: activeTab === id ? 'white' : 'var(--text-gray)',
                border: 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                fontWeight: activeTab === id ? 900 : 700, transition: 'all 0.2s', marginBottom: '8px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} /> {label}
            </div>
            {alert && <div style={{ background: '#EF4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>{alert}</div>}
        </button>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-light)' }}>
            <PaymentAnimationOverlay />
            {/* SIDEBAR */}
            <aside style={{ width: '280px', background: '#fff', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', background: 'var(--primary)', color: 'white' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Building size={20} /> {config.label} Management Portal
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.8 }}>Tenant ID: {user.clientId?.substring(0, 8)}</p>
                    <a 
                        href={`/org/${user._id || user.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            marginTop: '12px', 
                            fontSize: '11px', 
                            fontWeight: 900, 
                            background: 'rgba(255,255,255,0.2)', 
                            color: 'white', 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            textDecoration: 'none',
                            transition: 'background 0.2s',
                            width: '100%',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                    >
                        <ExternalLink size={14} /> View My Public Website
                    </a>
                </div>
                
                <div style={{ padding: '24px 16px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px', paddingLeft: '16px' }}>Main Systems</div>
                    <NavItem id="dashboard" label="Overview" icon={LayoutDashboard} />
                    <NavItem id="bookings" label={config.dashboard.bookingLabel} icon={ClipboardList} alert={bookings.filter(b => b.status === 'pending').length || null} />
                    
                    {/* Sector-Specific Tabs */}
                    <NavItem id="slots" label={config.dashboard.slotLabel} icon={Calendar} />
                    <NavItem id="services" label={config.dashboard.serviceLabel} icon={Briefcase} />

                    <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-light)', textTransform: 'uppercase', marginTop: '32px', marginBottom: '12px', letterSpacing: '1px', paddingLeft: '16px' }}>Staff & Users</div>
                    <NavItem id="hr" label="HR / Managers" icon={ShieldAlert} />
                    <NavItem id="employees" label={`${config.dashboard.employeeRole}s`} icon={Users} />
                    <NavItem id="users" label={`${config.dashboard.userRole} Data`} icon={UserIcon} />

                    <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-light)', textTransform: 'uppercase', marginTop: '32px', marginBottom: '12px', letterSpacing: '1px', paddingLeft: '16px' }}>Tenant Config</div>
                    <NavItem id="plan" label="Plan & Usage" icon={PieChart} />
                    <NavItem id="settings" label="Settings" icon={Settings} />
                </div>
                
                <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: 'white', border: '1px solid var(--border-color)', marginBottom: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user.name.charAt(0)}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 900, fontSize: '16px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</div>
                            <div style={{ fontSize: '12px', fontWeight: 900, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {config.label} Admin
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-outline" style={{ width: '100%', color: '#EF4444' }} onClick={logout}>Sign Out</button>
                </div>
            </aside>

            {/* RIGHT SIDE WRAPPER */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', position: 'relative' }}>
                
                {/* EXPIRY BANNER */}
                {isExpired && (
                    <div style={{ 
                        background: 'linear-gradient(90deg, #F87171, #EF4444)', 
                        color: 'white', 
                        padding: '12px 24px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        fontWeight: 900,
                        fontSize: '14px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 100,
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>
                                <ShieldAlert size={20} />
                            </div>
                            <span>Your Training Period has Expired! Please upgrade your plan to unlock full dashboard features.</span>
                        </div>
                        <button 
                            className="btn" 
                            style={{ background: 'white', color: '#EF4444', border: 'none', padding: '8px 16px', fontSize: '12px' }}
                            onClick={() => setActiveTab('plan')}
                        >
                            View Upgrade Options
                        </button>
                    </div>
                )}

                {!isExpired && daysRemaining !== null && daysRemaining <= 1 && (
                    <div style={{ 
                        background: '#FFFBEB', 
                        color: '#B45309', 
                        padding: '8px 24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        fontSize: '13px',
                        fontWeight: 800,
                        borderBottom: '1px solid #FEF3C7'
                    }}>
                        <Clock size={16} />
                        Your 1-day training period ends in less than 24 hours. Enjoy exploring the features!
                    </div>
                )}

                <main style={{ flex: 1, padding: '40px', position: 'relative' }}>
                    {/* 1. OVERVIEW DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', position: 'relative' }}>
                        {isExpired && <LockOverlay onUpgrade={() => { setActiveTab('plan'); setShowPaymentModal(true); }} />}
                        
                        {/* SaaS Promotional Trial Banner */}
                        {user.plan?.type !== 'paid' && !isExpired && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ 
                                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
                                    borderRadius: '32px', 
                                    padding: '40px', 
                                    marginBottom: '40px', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    color: 'white',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
                                    <img src={config.userSide.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                </div>
                                <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.1 }}>
                                    <ShieldCheck size={300} />
                                </div>
                                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <Sparkles size={20} color="#F59E0B" />
                                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Trial Mode</span>
                                    </div>
                                    <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>Build Your {config.label} Empire</h2>
                                    <p style={{ fontSize: '16px', opacity: 0.8, maxWidth: '550px', margin: '0 0 32px', lineHeight: 1.6 }}>
                                        Configure your {config.dashboard.employeeRole.toLowerCase()}s, set up your {config.dashboard.serviceLabel.toLowerCase()}, and start accepting {config.dashboard.bookingLabel.toLowerCase()} from your professional portal.
                                    </p>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <button 
                                            onClick={() => { setActiveTab('plan'); setShowUpgradeFlow(true); }} 
                                            className="btn btn-primary" 
                                            style={{ height: '56px', padding: '0 32px', borderRadius: '16px', fontSize: '16px', fontWeight: 900, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none' }}
                                        >
                                            Upgrade to Pro Now
                                        </button>
                                        <button onClick={() => setShowTutorialModal(true)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0 24px', height: '56px', borderRadius: '16px', cursor: 'pointer', fontWeight: 800, backdropFilter: 'blur(10px)' }}>
                                            Watch Tutorials
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'block', marginRight: '40px', position: 'relative', zIndex: 1 }}>
                                    <div style={{ width: '180px', height: '180px', background: 'rgba(255,255,255,0.05)', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(-5deg)', backdropFilter: 'blur(10px)' }}>
                                        {config.label?.toLowerCase().includes('health') ? <Activity size={80} color="rgba(255,255,255,0.4)" /> :
                                         config.label?.toLowerCase().includes('education') ? <BookOpen size={80} color="rgba(255,255,255,0.4)" /> :
                                         config.label?.toLowerCase().includes('repair') ? <Wrench size={80} color="rgba(255,255,255,0.4)" /> :
                                         <Building2 size={80} color="rgba(255,255,255,0.2)" />}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="flex-between" style={{ marginBottom: '32px' }}>
                            <div>
                                <h1 style={{ fontSize: '28px', margin: '0 0 8px', fontWeight: 900, color: 'var(--primary)' }}>Workspace Overview</h1>
                                <p style={{ color: 'var(--text-gray)', margin: 0 }}>Monitor your operations, active staff, and upcoming schedule.</p>
                            </div>
                            <button className="btn btn-primary" style={{ padding: '12px 24px' }} onClick={() => fetchData()}><Activity size={18} /> Refresh</button>
                        </div>

                        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                            <div className="stat-card" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '24px', borderRadius: '16px' }}>
                                <ClipboardList size={24} color="#2563EB" style={{ marginBottom: '12px' }} />
                                <h3 style={{ fontSize: '13px', color: '#1E3A8A', margin: '0 0 4px', fontWeight: 800 }}>TOTAL {config.dashboard.bookingLabel.toUpperCase()}</h3>
                                <div style={{ fontSize: '32px', fontWeight: 900, color: '#1E3A8A' }}>{metrics.totalBookings}</div>
                            </div>
                            <div className="stat-card" style={{ background: '#FDF4FF', border: '1px solid #FBCFE8', padding: '24px', borderRadius: '16px' }}>
                                <Activity size={24} color="#DB2777" style={{ marginBottom: '12px' }} />
                                <h3 style={{ fontSize: '13px', color: '#831843', margin: '0 0 4px', fontWeight: 800 }}>TODAY'S {config.dashboard.bookingLabel.toUpperCase()}</h3>
                                <div style={{ fontSize: '32px', fontWeight: 900, color: '#831843' }}>{metrics.todayBookings}</div>
                            </div>
                            <div className="stat-card" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '24px', borderRadius: '16px' }}>
                                <Calendar size={24} color="#16A34A" style={{ marginBottom: '12px' }} />
                                <h3 style={{ fontSize: '13px', color: '#14532D', margin: '0 0 4px', fontWeight: 800 }}>{config.dashboard.slotLabel.toUpperCase()}</h3>
                                <div style={{ fontSize: '32px', fontWeight: 900, color: '#14532D' }}>{metrics.availableSlots}</div>
                            </div>
                            <div className="stat-card" style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '24px', borderRadius: '16px' }}>
                                <Users size={24} color="#DC2626" style={{ marginBottom: '12px' }} />
                                <h3 style={{ fontSize: '13px', color: '#7F1D1D', margin: '0 0 4px', fontWeight: 800 }}>TOTAL {config.dashboard.employeeRole.toUpperCase()}S</h3>
                                <div style={{ fontSize: '32px', fontWeight: 900, color: '#7F1D1D' }}>{metrics.totalEmployees}</div>
                            </div>
                            <div className="stat-card" style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '24px', borderRadius: '16px' }}>
                                <Bell size={24} color="#D97706" style={{ marginBottom: '12px' }} />
                                <h3 style={{ fontSize: '13px', color: '#92400E', margin: '0 0 4px', fontWeight: 800 }}>PENDING REQUESTS</h3>
                                <div style={{ fontSize: '32px', fontWeight: 900, color: '#92400E' }}>{metrics.pendingRequests}</div>
                            </div>
                            <div className="stat-card" style={{ background: '#F0FDFA', border: '1px solid #CCFBF1', padding: '24px', borderRadius: '16px' }}>
                                <Sparkles size={24} color="#0D9488" style={{ marginBottom: '12px' }} />
                                <h3 style={{ fontSize: '13px', color: '#115E59', margin: '0 0 4px', fontWeight: 800 }}>STAFF AVAILABILITY</h3>
                                <div style={{ fontSize: '32px', fontWeight: 900, color: '#115E59' }}>{metrics.employeeAvailability}%</div>
                            </div>
                        </div>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div className="data-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>Recent Activity</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    {bookings.slice(0, 8).map((b, idx) => (
                                        <div key={b._id} style={{ 
                                            padding: '20px 0', 
                                            borderBottom: idx === bookings.slice(0, 8).length - 1 ? 'none' : '1px solid #F1F5F9', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center' 
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '16px', color: '#0F172A', marginBottom: '4px' }}>{b.userId?.name || b.patientName || 'Anonymous'}</div>
                                                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{b.type || 'General'} | {b.date || b.manualDate || 'No Date'}</div>
                                            </div>
                                            <div style={{ 
                                                fontSize: '12px', 
                                                fontWeight: 900, 
                                                textTransform: 'uppercase', 
                                                color: b.status === 'pending' ? '#EA580C' : b.status === 'cancelled' || b.status === 'rejected' ? '#64748B' : '#0284C7'
                                            }}>
                                                {b.status}
                                            </div>
                                        </div>
                                    ))}
                                    {bookings.length === 0 && <p style={{ fontSize: '14px', color: '#94A3B8', textAlign: 'center', padding: '40px 0' }}>No recent activity to show.</p>}
                                </div>
                            </div>
                            <div className="data-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>Recent Staff Activity</h3>
                                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                    <Activity size={40} color="#E2E8F0" style={{ marginBottom: '16px' }} />
                                    <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0, fontWeight: 600 }}>Live feed integration coming soon.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2 & 3. HR / EMPLOYEE MANAGEMENT */}
                {(activeTab === 'hr' || activeTab === 'employees') && (
                    <div style={{ animation: 'fadeIn 0.3s ease', position: 'relative' }}>
                        {isExpired && <LockOverlay onUpgrade={() => setActiveTab('plan')} />}
                        <div className="flex-between" style={{ marginBottom: '32px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', margin: '0 0 8px', fontWeight: 900 }}>{activeTab === 'hr' ? 'HR Management' : `${config.dashboard.employeeRole} Roster`}</h1>
                                <p style={{ color: 'var(--text-gray)', margin: 0 }}>Add, block, and assign departments to your operational {activeTab === 'hr' ? 'managers' : config.dashboard.employeeRole.toLowerCase()}.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => { setStaffForm({...staffForm, role: activeTab === 'hr' ? 'hr' : 'employee'}); setShowStaffModal(true); }}>
                                <Plus size={18} /> Add {activeTab === 'hr' ? 'HR' : config.dashboard.employeeRole}
                            </button>
                        </div>

                        <div className="data-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--bg-light)', borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>NAME</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>EMAIL</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>DEPARTMENT</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>STATUS</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.filter(e => activeTab === 'hr' ? e.role === 'hr' : (e.role !== 'hr')).map(emp => (
                                        <tr key={emp._id} style={{ borderBottom: '1px solid var(--bg-light)' }}>
                                            <td style={{ padding: '16px', fontWeight: 800 }}>{emp.name}</td>
                                            <td style={{ padding: '16px', color: 'var(--text-gray)' }}>{emp.email}</td>
                                            <td style={{ padding: '16px' }}><span className="badge badge-outline">{emp.department || 'General'}</span></td>
                                            <td style={{ padding: '16px' }}>
                                                <span className={`badge badge-${emp.isBlocked ? 'danger' : 'success'}`}>{emp.isBlocked ? 'Blocked' : 'Active'}</span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button 
                                                        className="btn btn-sm btn-ghost" 
                                                        style={{ color: emp.isBlocked ? 'var(--success)' : 'var(--danger)', padding: '6px' }} 
                                                        onClick={() => handleBlockUser(emp._id)}
                                                        title={emp.isBlocked ? 'Unblock' : 'Block'}
                                                    >
                                                        <StopCircle size={16} />
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-ghost" 
                                                        style={{ color: '#64748B', padding: '6px' }}
                                                        onClick={() => {
                                                            setStaffForm({ name: emp.name, email: emp.email, role: emp.role, department: emp.department });
                                                            setSelectedUserId(emp._id);
                                                            setIsEditMode(true);
                                                            setShowStaffModal(true);
                                                        }}
                                                    >
                                                        <GripVertical size={16} />
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-ghost" 
                                                        style={{ color: '#EF4444', padding: '6px' }}
                                                        onClick={() => handleDeleteUser(emp._id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.filter(e => activeTab === 'hr' ? e.role === 'hr' : (e.role !== 'hr')).length === 0 && (
                                        <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-light)' }}>No {activeTab} added yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. SERVICE MANAGEMENT — Universal Service Builder */}
                {activeTab === 'services' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', position: 'relative' }}>
                        {isExpired && <LockOverlay onUpgrade={() => setActiveTab('plan')} />}
                        <div className="flex-between" style={{ marginBottom: '32px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', margin: '0 0 8px', fontWeight: 900 }}>{config.dashboard.serviceLabel} Catalog</h1>
                                <p style={{ color: 'var(--text-gray)', margin: 0 }}>
                                    Define the {config.dashboard.serviceLabel.toLowerCase()} your organization offers. The system adapts to your sector automatically.
                                </p>
                            </div>
                            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowServiceModal(true)}>
                                <Plus size={18} /> Create New {config.dashboard.serviceLabel.slice(0, -1)}
                            </button>
                        </div>

                        {/* Service Cards Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                            {services.map(s => (
                                <div key={s._id} style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border-color)', overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
                                    {/* Card Header */}
                                    <div style={{ background: 'linear-gradient(135deg, var(--primary), #7C3AED)', padding: '20px 24px', color: 'white' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.7, textTransform: 'uppercase', marginBottom: '4px' }}>{s.category}</div>
                                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>{s.name}</h3>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button 
                                                    onClick={() => {
                                                        setServiceForm({ ...s });
                                                        setSelectedServiceId(s._id);
                                                        setIsServiceEdit(true);
                                                        setShowServiceModal(true);
                                                    }} 
                                                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white' }}
                                                    title="Edit Service"
                                                >
                                                    <Settings size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteService(s._id)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white' }} title="Delete Service">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div style={{ padding: '20px 24px' }}>
                                        <p style={{ fontSize: '13px', color: 'var(--text-gray)', margin: '0 0 16px', minHeight: '36px' }}>
                                            {s.description || 'No description.'}
                                        </p>

                                        {/* Stats Row */}
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ background: '#F0F9FF', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#0369A1' }}>
                                                [!] {s.duration || 30} min
                                            </div>
                                            <div style={{ background: '#F0FDF4', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#16A34A' }}>
                                                Rs.{s.price}
                                            </div>
                                            <div style={{ background: '#FDF4FF', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#7C3AED' }}>
                                                {s.customFields?.length || 0} Fields
                                            </div>
                                        </div>

                                        {/* Custom Fields Preview */}
                                        {s.customFields && s.customFields.length > 0 && (
                                            <div style={{ background: 'var(--bg-light)', borderRadius: '10px', padding: '12px' }}>
                                                <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '8px' }}>Form Fields</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {s.customFields.map((f, i) => (
                                                        <span key={i} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>
                                                            {f.label} <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>({f.fieldType})</span>
                                                            {f.required && <span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Empty State */}
                            {services.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '20px', border: '2px dashed var(--border-color)' }}>
                                    <Briefcase size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                    <h3 style={{ fontWeight: 900, marginBottom: '8px' }}>No Services Created Yet</h3>
                                    <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '24px' }}>
                                        Create your first service — it can be a Doctor Appointment, Interview Round, Product Repair, or anything your business offers.
                                    </p>
                                    <button className="btn btn-primary" onClick={() => setShowServiceModal(true)}>
                                        <Plus size={16} /> Create First Service
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 5. SLOT MANAGEMENT */}
                {activeTab === 'slots' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', position: 'relative' }}>
                        {isExpired && <LockOverlay onUpgrade={() => setActiveTab('plan')} />}
                        <div className="flex-between" style={{ marginBottom: '32px' }}>

                            <div>
                                <h1 style={{ fontSize: '24px', margin: '0 0 8px', fontWeight: 900 }}>{config.dashboard.slotLabel} Master View</h1>
                                <p style={{ color: 'var(--text-gray)', margin: 0 }}>Design your schedule limits, block off dates, and assign {config.dashboard.employeeRole.toLowerCase()}s.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowSlotModal(true)}><Plus size={18} /> Generate {config.dashboard.slotLabel}</button>
                        </div>

                        <div className="data-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--bg-light)', borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>DATE</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>TIME RANGES</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>SERVICE</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>PROFESSIONAL</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>STATUS</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slots.map(s => (
                                        <tr key={s._id} style={{ borderBottom: '1px solid var(--bg-light)' }}>
                                            <td style={{ padding: '16px', fontWeight: 800 }}>{s.date}</td>
                                            <td style={{ padding: '16px' }}><Clock size={12} color="var(--primary)" /> {s.startTime} - {s.endTime}</td>
                                            <td style={{ padding: '16px', fontWeight: 700, color: 'var(--primary)' }}>{s.serviceId?.name || s.type}</td>
                                            <td style={{ padding: '16px', fontWeight: 700 }}>{s.professionalName || 'TBD'}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span className={`badge badge-${s.isBooked ? 'danger' : 'success'}`}>{s.isBooked ? 'Booked' : 'Available'}</span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <button 
                                                    className="btn btn-sm btn-ghost" 
                                                    style={{ color: '#EF4444', padding: '6px' }}
                                                    onClick={() => handleDeleteSlot(s._id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {slots.length === 0 && <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-light)' }}>No slots scheduled into system.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 6. BOOKING MANAGEMENT */}
                {activeTab === 'bookings' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', position: 'relative' }}>
                        {isExpired && <LockOverlay onUpgrade={() => setActiveTab('plan')} />}
                        <div className="flex-between" style={{ marginBottom: '32px' }}>

                            <div>
                                <h1 style={{ fontSize: '24px', margin: '0 0 8px', fontWeight: 900 }}>Central {config.dashboard.bookingLabel} Ledger</h1>
                                <p style={{ color: 'var(--text-gray)', margin: 0 }}>Review, approve, and reschedule incoming {config.dashboard.bookingLabel.toLowerCase()} from your public portal.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowBookingModal(true)}>
                                <Plus size={18} /> Book New {config.dashboard.bookingLabel.slice(0, -1)}
                            </button>
                        </div>

                        <div className="data-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--bg-light)', borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>APPOINTMENT</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>CUSTOMER / PATIENT</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>SCHEDULE</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>STATUS</th>
                                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-light)' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b._id} style={{ borderBottom: '1px solid var(--bg-light)' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 800 }}>{b.type.toUpperCase()}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-gray)' }}>{b.purpose || 'General Requirement'}</div>
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: 700 }}>{b.userId?.name || b.patientName || 'Anonymous'}</td>
                                            <td style={{ padding: '16px' }}>{b.date || b.manualDate || 'Unscheduled'}</td>
                                            <td style={{ padding: '16px' }}>
                                                <StatusBadge status={b.status} />
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {b.status === 'pending' && (
                                                        <button className="btn btn-sm" style={{ background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 800 }} onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}>
                                                            <CheckCircle size={14} /> Confirm
                                                        </button>
                                                    )}
                                                    {['pending', 'confirmed', 'approved'].includes(b.status) && (
                                                        <button className="btn btn-sm" style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 800 }} onClick={() => handleUpdateBookingStatus(b._id, 'rejected')}>
                                                            <XCircle size={14} />
                                                        </button>
                                                    )}
                                                    {['pending', 'confirmed', 'approved', 'accepted', 'ongoing'].includes(b.status) && (
                                                        <button className="btn btn-sm btn-outline" style={{ borderRadius: '6px' }} onClick={() => handleUpdateBookingStatus(b._id, 'completed')}>
                                                            Finish
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="btn btn-sm btn-ghost" 
                                                        style={{ color: '#94A3B8', padding: '6px' }}
                                                        onClick={() => {
                                                            if(window.confirm('Remove this appointment record?')) {
                                                                handleDeleteBooking(b._id);
                                                            }
                                                        }}
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan="5">
                                                <div style={{ padding: '32px', textAlign: 'center', background: '#F8FAFC', borderRadius: '24px', border: '2px dashed #E2E8F0' }}>
                                                    <div style={{ width: '60px', height: '60px', background: '#F1F5F9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94A3B8' }}>
                                                        <Calendar size={32} />
                                                    </div>
                                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>No appointments yet</h3>
                                                    <p style={{ color: '#64748B', fontWeight: 600, margin: 0 }}>Active appointments will appear here once booked.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 7. CUSTOMER DETAILS */}
                {activeTab === 'users' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', position: 'relative' }}>
                        {isExpired && <LockOverlay onUpgrade={() => setActiveTab('plan')} />}
                        <div className="flex-between" style={{ marginBottom: '32px' }}>

                            <div>
                                <h1 style={{ fontSize: '24px', margin: '0 0 8px', fontWeight: 900 }}>Customer Index</h1>
                                <p style={{ color: 'var(--text-gray)', margin: 0 }}>Global tracking of all {config.dashboard.userRole.toLowerCase()}s intersecting with your organization.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[...new Set(customers.map(c => c.sector || 'General'))].map(sectorName => {
                                const sectorCustomers = customers.filter(c => (c.sector || 'General') === sectorName);
                                return (
                                    <div key={sectorName} style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#EEF2FF', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{sectorName} Sector</h3>
                                                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>{sectorCustomers.length} Total Customers</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                            {sectorCustomers.map(c => (
                                                <div key={c._id} style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', transition: 'transform 0.2s' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 800, fontSize: '16px', color: '#0F172A' }}>{c.name}</div>
                                                            <div style={{ fontSize: '12px', color: '#64748B' }}>{c.email}</div>
                                                        </div>
                                                        <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 900 }}>{c.totalBookings || 0} BOOKINGS</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Clock size={12} color="#94A3B8" />
                                                            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Last seen: {c.lastBooking || 'New Joiner'}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDeleteUser(c._id)}
                                                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                                            title="Remove Customer Record"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {customers.length === 0 && (
                                <div style={{ background: 'white', padding: '80px', borderRadius: '32px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                                    <Users size={64} color="#E2E8F0" style={{ marginBottom: '20px' }} />
                                    <h3 style={{ color: '#0F172A', fontWeight: 900 }}>No User Data</h3>
                                    <p style={{ color: '#64748B' }}>Interactions will appear here once users start booking sessions.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 8. PLAN AND USAGE */}
                {activeTab === 'plan' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h1 style={{ fontSize: '24px', margin: '0 0 8px', fontWeight: 900 }}>Subscription & Usage</h1>
                            <p style={{ color: 'var(--text-gray)', margin: 0 }}>Monitor system quotas enforced by the Super Admin level.</p>
                        </div>
                        
                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div className="data-card" style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', color: 'white' }}>
                                    <div className="badge badge-success" style={{ marginBottom: '16px' }}>{user.plan?.type === 'paid' ? 'PREMIUM ACCESS' : 'FREE TIER'}</div>
                                    <h1 style={{ fontSize: '32px', margin: '0 0 8px' }}>{user.plan?.type === 'paid' ? 'Pro Plan' : 'Basic Plan'}</h1>
                                    <p style={{ opacity: 0.8, fontSize: '13px', marginBottom: '32px' }}>
                                        {user.plan?.type === 'paid' ? 'Unlimited structural access active until expiry.' : 'Strict tenant quotas enforced. Upgrade today to uncap resource allocation limits.'}
                                    </p>
                                    <div style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
                                        <b>Expiry Date:</b> {user.plan?.expiryDate ? new Date(user.plan.expiryDate).toLocaleDateString() : 'Active indefinitely'}
                                    </div>
                                </div>

                                <div className="data-card">
                                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 900 }}>Growth and Support</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '12px 16px', fontSize: '13px' }} onClick={() => handleSaaSRequest('extend_trial')}>
                                            [!] Request 1-Day Trial Renewal
                                        </button>
                                        <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '12px 16px', fontSize: '13px' }} onClick={() => setShowTrainingPayment(true)}>
                                            [!] Request Support & Training
                                        </button>
                                        <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px 16px', fontSize: '13px', borderRadius: '12px' }} onClick={() => handleSaaSRequest('upgrade_plan')}>
                                            [!] Request Full SaaS Access
                                        </button>
                                    </div>
                                    <p style={{ margin: '16px 0 0', fontSize: '11px', color: 'var(--text-gray)', textAlign: 'center' }}>
                                        Requests are sent directly to Forge India Super Admin.
                                    </p>
                                </div>

                                <div className="data-card" style={{ border: '1.5px solid #F1F5F9' }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 900 }}>Payments and Banking</h3>
                                    <p style={{ fontSize: '12px', color: 'var(--text-gray)', marginBottom: '20px' }}>Configure how you collect payments from your customers during booking.</p>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ padding: '8px', background: 'white', borderRadius: '8px' }}>[!]</div>
                                                <span style={{ fontSize: '13px', fontWeight: 800 }}>Razorpay / UPI</span>
                                            </div>
                                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748B' }}>DISCONNECTED</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ padding: '8px', background: 'white', borderRadius: '8px' }}>[!]</div>
                                                <span style={{ fontSize: '13px', fontWeight: 800 }}>Stripe (International)</span>
                                            </div>
                                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748B' }}>DISCONNECTED</span>
                                        </div>
                                    </div>

                                    <button onClick={() => navigate('/billing')} style={{ background: '#4F46E5', color: 'white', padding: '12px 28px', borderRadius: '14px', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                                        <Zap size={18} fill="currentColor" /> UPGRADE NOW
                                    </button>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* AVAILABLE PLANS GRID — Shown to clients to encourage upgrade */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '8px' }}>
                                    {/* Basic Card */}
                                    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>Basic Plan</div>
                                        <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary)', marginBottom: '12px' }}>Rs.0</div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', color: '#64748B', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowRight size={12} /> 50 Bookings / mo</li>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowRight size={12} /> 2 HR & Staff</li>
                                        </ul>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Starter</div>
                                    </div>

                                    {/* Pro Card */}
                                    <div style={{ background: 'linear-gradient(135deg, var(--primary), #7C3AED)', padding: '20px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 20px -5px rgba(79,70,229,0.3)', transform: 'translateY(-4px)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 900 }}>Pro Plan</div>
                                            <div style={{ background: '#F59E0B', color: 'white', fontSize: '8px', fontWeight: 900, padding: '2px 6px', borderRadius: '10px', textTransform: 'uppercase' }}>Popular</div>
                                        </div>
                                        <div style={{ fontSize: '22px', fontWeight: 900, marginBottom: '12px' }}>Rs.299<span style={{ fontSize: '12px', opacity: 0.8 }}>/mo</span></div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, opacity: 0.9 }}>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowRight size={12} /> 500 Bookings / mo</li>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowRight size={12} /> 5 HR & Staff</li>
                                        </ul>
                                        <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.7, textTransform: 'uppercase' }}>Growth</div>
                                    </div>

                                    {/* Premium Card */}
                                    <div style={{ background: '#0F172A', padding: '20px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '4px' }}>Premium</div>
                                        <div style={{ fontSize: '22px', fontWeight: 900, color: '#38BDF8', marginBottom: '12px' }}>Rs.799<span style={{ fontSize: '12px', color: 'white', opacity: 0.7 }}>/mo</span></div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, opacity: 0.8 }}>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowRight size={12} /> Unlimited Bookings</li>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowRight size={12} /> Unlimited Team</li>
                                        </ul>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Enterprise</div>
                                    </div>
                                </div>

                                {/* USAGE STATS CARD */}
                                <div className="data-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>📊 Resource Usage</h3>
                                    </div>
                                    <div>
                                        <div className="flex-between" style={{ marginBottom: '12px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '14px', color: '#475569' }}>HR Managers Assigned</span>
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>{employees.filter(e=>e.role==='hr').length} / {user.plan?.maxHr || 2}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '10px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #7C3AED)', width: `${Math.min((employees.filter(e=>e.role==='hr').length / (user.plan?.maxHr || 2))*100, 100)}%`, borderRadius: '10px', transition: 'width 1s ease' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex-between" style={{ marginBottom: '12px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '14px', color: '#475569' }}>Employees & Staff Quota</span>
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#EF4444' }}>{employees.filter(e=>e.role!=='hr').length} / {user.plan?.maxEmployees || 5}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '10px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: 'linear-gradient(90deg, #F87171, #EF4444)', width: `${Math.min((employees.filter(e=>e.role!=='hr').length / (user.plan?.maxEmployees || 5))*100, 100)}%`, borderRadius: '10px', transition: 'width 1s ease' }}></div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 'auto', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.5' }}>
                                            <b>Note:</b> These limits are enforced by the platform administrator. To increase your limits, please select a plan above and contact support.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 10. SETTINGS */}
                {activeTab === 'settings' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '600px' }}>
                        <h1 style={{ fontSize: '24px', margin: '0 0 32px', fontWeight: 900 }}>Platform Settings</h1>
                        
                        {/* 🏢 ORGANIZATION PROFILE SECTION */}
                        <div className="data-card" style={{ marginBottom: '40px', border: '2px solid var(--primary)', borderRadius: '24px' }}>
                            <div style={{ padding: '24px', background: 'var(--primary)', color: 'white', borderRadius: '22px 22px 0 0' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Building size={20} /> Organization Profile
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.8 }}>Update your professional branding and public website links.</p>
                            </div>
                            
                            <form onSubmit={handleUpdateOrgProfile} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>{(config.brandLabel || 'Organization').toUpperCase()} NAME</label>
                                    <input 
                                        className="input-field" 
                                        placeholder="Enter full legal name"
                                        value={organizationForm.organizationName}
                                        onChange={e => setOrganizationForm({...organizationForm, organizationName: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>Bannner / Gallery Images (URLs, comma-separated)</label>
                                    <input 
                                        className="input-field" 
                                        placeholder="https://example.com/img1.png, https://example.com/img2.png"
                                        value={organizationForm.organizationImages}
                                        onChange={e => setOrganizationForm({...organizationForm, organizationImages: e.target.value})}
                                    />
                                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--text-gray)' }}>These images will appear on your public profile and booking page gallery.</p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>ORGANIZATION LOGO URL</label>
                                    <input 
                                        className="input-field" 
                                        placeholder="https://example.com/logo.png"
                                        value={organizationForm.organizationLogo}
                                        onChange={e => setOrganizationForm({...organizationForm, organizationLogo: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>{config.websiteContent?.aboutTitle?.toUpperCase() || 'ABOUT OUR STORY'}</label>
                                    <textarea 
                                        className="input-field" 
                                        placeholder="Tell your clients how you started, your journey, and your expertise..."
                                        style={{ minHeight: '120px', resize: 'vertical' }}
                                        value={organizationForm.organizationStory}
                                        onChange={e => setOrganizationForm({...organizationForm, organizationStory: e.target.value})}
                                    />
                                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--text-gray)' }}>This will be showcased in the 'About' section of your mini-website.</p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>OUR MISSION / PURPOSE</label>
                                    <textarea 
                                        className="input-field" 
                                        placeholder="What is your ultimate goal? Why should people choose you?"
                                        style={{ minHeight: '80px', resize: 'vertical' }}
                                        value={organizationForm.organizationPurpose}
                                        onChange={e => setOrganizationForm({...organizationForm, organizationPurpose: e.target.value})}
                                    />
                                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--text-gray)' }}>Briefly summarize your core purpose.</p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>TAGLINE (SEARCH PREVIEW)</label>
                                    <textarea 
                                        className="input-field" 
                                        placeholder="One-line snippet for search results..."
                                        style={{ minHeight: '60px', resize: 'vertical' }}
                                        value={organizationForm.organizationDescription}
                                        onChange={e => setOrganizationForm({...organizationForm, organizationDescription: e.target.value})}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ height: '56px', fontWeight: 900, fontSize: '16px', borderRadius: '16px', marginTop: '12px' }}>
                                    <CheckCircle size={20} /> Save Changes
                                </button>
                            </form>
                        </div>
                        
                        <div className="data-card" style={{ marginBottom: '24px' }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Notification Preferences</h3>
                            <div className="flex-between" style={{ padding: '16px 0', borderBottom: '1px solid var(--bg-light)' }}>
                                <div>
                                    <span style={{ fontWeight: 800, display: 'block', fontSize: '14px' }}>Booking Reminders</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Send SMS/Email 30 mins prior</span>
                                </div>
                                <div className="badge badge-success">ACTIVE</div>
                            </div>
                            <div className="flex-between" style={{ padding: '16px 0' }}>
                                <div>
                                    <span style={{ fontWeight: 800, display: 'block', fontSize: '14px' }}>Daily Activity Digest</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Receive daily admin summaries</span>
                                </div>
                                <div className="badge badge-outline">DISABLED</div>
                            </div>
                        </div>

                        <div className="data-card">
                            <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Operational Constraints</h3>
                            <div className="flex-between" style={{ padding: '16px 0', borderBottom: '1px solid var(--bg-light)' }}>
                                <div>
                                    <span style={{ fontWeight: 800, display: 'block', fontSize: '14px' }}>Default Session Length</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Overrides professional preferences</span>
                                </div>
                                <select className="input-field" style={{ width: 'auto', padding: '8px 12px' }}>
                                    <option>15 mins</option>
                                    <option>30 mins</option>
                                    <option>60 mins</option>
                                </select>
                            </div>
                            <div className="flex-between" style={{ padding: '16px 0' }}>
                                <div>
                                    <span style={{ fontWeight: 800, display: 'block', fontSize: '14px' }}>Auto-Approve Walk-ins</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Skip pending stage for offline schedules</span>
                                </div>
                                <div className="badge badge-success">ACTIVE</div>
                            </div>
                        </div>
                    </div>
                )}


            {/* MODALS */}
            {/* Create Staff Modal */}
            {showStaffModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="data-card" style={{ maxWidth: '450px', width: '100%', padding: '32px' }}>
                        <h2 style={{ margin: '0 0 24px', fontWeight: 900 }}>{isEditMode ? `Edit ${config.dashboard.employeeRole}` : `Add New ${staffForm.role === 'hr' ? 'HR Manager' : config.dashboard.employeeRole}`}</h2>
                        <form onSubmit={isEditMode ? handleUpdateUser : handleAddStaff}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-gray)', marginBottom: '8px' }}>FULL NAME</label>
                                <input type="text" className="input-field" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} required />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-gray)', marginBottom: '8px' }}>EMAIL ADDRESS</label>
                                <input type="email" className="input-field" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} required disabled={isEditMode} />
                            </div>
                            {!isEditMode && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-gray)', marginBottom: '8px' }}>INITIAL PASSWORD</label>
                                    <input type="password" className="input-field" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} required />
                                </div>
                            )}
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-gray)', marginBottom: '8px' }}>DEPARTMENT / SPECIALTY</label>
                                <input type="text" className="input-field" value={staffForm.department} onChange={e => setStaffForm({...staffForm, department: e.target.value})} placeholder={user.userType === 'hospital' ? 'e.g. Cardiology' : 'e.g. Operations'} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowStaffModal(false); setIsEditMode(false); }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{isEditMode ? 'Save Changes' : 'Create Account'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══ SERVICE BUILDER MODAL (Full Dynamic Form Builder) ═══ */}
            {showServiceModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '680px', borderRadius: '24px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
                        
                        {/* Modal Header */}
                        <div style={{ background: 'linear-gradient(135deg, var(--primary), #7C3AED)', padding: '24px 32px', color: 'white', borderRadius: '24px 24px 0 0', position: 'sticky', top: 0, zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 4px', fontWeight: 900, fontSize: '20px' }}>{isServiceEdit ? 'Edit' : 'New'} {config.dashboard.serviceLabel.slice(0, -1)} Builder</h2>
                                    <p style={{ margin: 0, opacity: 0.8, fontSize: '13px' }}>{isServiceEdit ? `Modify your existing ${config.dashboard.serviceLabel.toLowerCase().slice(0, -1)} details and fields.` : `Define any ${config.dashboard.serviceLabel.toLowerCase().slice(0, -1)} — the system adapts to your sector automatically.`}</p>
                                </div>
                                <button onClick={() => setShowServiceModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreateService}>
                            {/* Section 1: Basic Info */}
                            <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--bg-light)' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Service Details</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>{config.dashboard.serviceLabel.slice(0, -1)} Name *</label>
                                        <input 
                                            className="input-field" 
                                            placeholder={`e.g. ${config.subCategories?.[0] || 'Consultation'}, ${config.subCategories?.[1] || 'General Service'}...`} 
                                            value={serviceForm.name} 
                                            onChange={e => setServiceForm({...serviceForm, name: e.target.value})} 
                                            required 
                                        />
                                        
                                        {/* Sector-Wise Quick Suggestions */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-light)', alignSelf: 'center', marginRight: '4px' }}>QUICK SUGGESTIONS:</span>
                                            {(config.subCategories || []).map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setServiceForm({...serviceForm, name: cat})}
                                                    style={{ 
                                                        background: 'white', 
                                                        border: '1px solid #E2E8F0', 
                                                        borderRadius: '8px', 
                                                        padding: '4px 12px', 
                                                        fontSize: '11px', 
                                                        fontWeight: 700, 
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; }}
                                                    onMouseLeave={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.color = 'inherit'; }}
                                                >
                                                    + {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>Description</label>
                                        <textarea className="input-field" placeholder={`Explain what happens during this ${config.dashboard.serviceLabel.toLowerCase().slice(0, -1)}...`} style={{ resize: 'none', height: '80px', padding: '12px' }} value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>Industry Category *</label>
                                        <select
                                            className="input-field"
                                            value={serviceForm.category}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setServiceForm(prev => ({ ...prev, category: val }));
                                            }}
                                            required
                                        >
                                            <option value="" disabled>Select your business type...</option>
                                            {Object.entries(industryTemplates)
                                                .filter(([key]) => allowedCategories.includes(key))
                                                .map(([key, tmpl]) => (
                                                    <option key={key} value={key}>{key}</option>
                                                ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>Duration (minutes)</label>
                                        <input className="input-field" type="number" min="5" placeholder="30" value={serviceForm.duration} onChange={e => setServiceForm({...serviceForm, duration: parseInt(e.target.value) || ''})} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>Price (Rs.)</label>
                                        <input className="input-field" type="number" min="0" placeholder="0 for free" value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: parseFloat(e.target.value) || ''})} />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Custom Form Builder */}
                            <div style={{ padding: '28px 32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-light)', textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: '1px' }}>Custom Form Fields</h3>
                                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)' }}>What info do customers need to fill when booking this service?</p>
                                    </div>
                                    <button type="button" onClick={addFormField} style={{ background: '#EFF6FF', border: '2px dashed #3B82F6', color: '#2563EB', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Plus size={16} /> Add Field
                                    </button>
                                </div>

                                {/* Field list */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {serviceForm.customFields.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-light)', borderRadius: '12px', border: '2px dashed #E2E8F0' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                                                {Object.entries(industryTemplates)
                                                    .filter(([key]) => allowedCategories.includes(key))
                                                    .map(([key, tmpl]) => (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        onClick={() => applyTemplate(key)}
                                                        style={{
                                                            background: 'white', border: '1px solid #E2E8F0', borderRadius: '10px',
                                                            padding: '12px 8px', cursor: 'pointer', transition: 'all 0.2s',
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#EFF6FF'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'white'; }}
                                                    >
                                                        <span style={{ fontSize: '24px' }}>{tmpl.icon}</span>
                                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#374151' }}>{key}</span>
                                                        <span style={{ fontSize: '10px', color: '#94A3B8' }}>{tmpl.suggestedFields.length} fields</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                                                Or click "Add Field" above to build from scratch.
                                            </p>
                                        </div>
                                    )}

                                    {serviceForm.customFields.map((field, index) => (
                                        <div key={index} style={{ background: 'var(--bg-light)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-gray)' }}>FIELD LABEL</label>
                                                    <input 
                                                        className="input-field" 
                                                        style={{ background: 'white' }}
                                                        placeholder="e.g. Patient Name, Course, Experience" 
                                                        value={field.label}
                                                        onChange={e => updateFormField(index, 'label', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-gray)' }}>FIELD TYPE</label>
                                                    <select className="input-field" style={{ background: 'white' }} value={field.fieldType} onChange={e => updateFormField(index, 'fieldType', e.target.value)}>
                                                        <option value="text">Text (Short)</option>
                                                        <option value="textarea">Textarea (Long)</option>
                                                        <option value="number">Number</option>
                                                        <option value="email">Email</option>
                                                        <option value="phone">Phone</option>
                                                        <option value="date">Date</option>
                                                        <option value="file">File Upload</option>
                                                        <option value="dropdown">Dropdown (Options)</option>
                                                    </select>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', paddingBottom: '2px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: '#64748B' }}>
                                                        <input type="checkbox" checked={field.required} onChange={e => updateFormField(index, 'required', e.target.checked)} />
                                                        Required
                                                    </label>
                                                    <button type="button" onClick={() => removeFormField(index)} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#DC2626' }}>
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Dropdown options editor */}
                                            {field.fieldType === 'dropdown' && (
                                                <div style={{ marginTop: '12px' }}>
                                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-gray)' }}>DROPDOWN OPTIONS (comma-separated)</label>
                                                    <input 
                                                        className="input-field" 
                                                        style={{ background: 'white' }}
                                                        placeholder="Option 1, Option 2, Option 3"
                                                        value={field.options?.join(', ') || ''}
                                                        onChange={e => updateFormField(index, 'options', e.target.value.split(',').map(o => o.trim()).filter(Boolean))}
                                                    />
                                                </div>
                                            )}

                                            {/* Auto-generated key preview */}
                                            {field.fieldKey && (
                                                <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-light)' }}>
                                                    Key: <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{field.fieldKey}</code>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{ padding: '20px 32px', borderTop: '1px solid var(--bg-light)', display: 'flex', gap: '12px', position: 'sticky', bottom: 0, background: 'white', borderRadius: '0 0 24px 24px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowServiceModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2, fontWeight: 900 }}>
                                    Deploy Service
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Create Slot Modal */}
            {showSlotModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '400px' }}>
                        <h2 style={{ margin: '0 0 24px', fontWeight: 900 }}>Generate Operational Slot</h2>
                        <form onSubmit={handleCreateSlot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input className="input-field" type="date" value={slotForm.date} onChange={e=>setSlotForm({...slotForm, date: e.target.value})} required />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input className="input-field" type="time" placeholder="Start" value={slotForm.startTime} onChange={e=>setSlotForm({...slotForm, startTime: e.target.value})} required />
                                <input className="input-field" type="time" placeholder="End" value={slotForm.endTime} onChange={e=>setSlotForm({...slotForm, endTime: e.target.value})} required />
                            </div>
                            <select className="input-field" value={slotForm.professionalId} onChange={e=>setSlotForm({...slotForm, professionalId: e.target.value})} required>
                                <option value="" disabled>Assign Professional...</option>
                                {employees.filter(e => e.role !== 'hr').map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                                )) || <option disabled>No employees found</option>}
                            </select>
                            <select className="input-field" value={slotForm.serviceId} onChange={e=>setSlotForm({...slotForm, serviceId: e.target.value, type: 'general'})}>
                                <option value="">General Slot (No specific service)</option>
                                {services.map(srv => (
                                    <option key={srv._id} value={srv._id}>{srv.name} ({srv.duration} min)</option>
                                ))}
                            </select>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowSlotModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manual Booking Modal */}
            {showBookingModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s' }}>
                        <div className="flex-between" style={{ marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--primary)' }}>Manual Booking</h2>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-gray)', fontSize: '14px' }}>Register a new appointment on behalf of a customer.</p>
                            </div>
                            <button onClick={() => setShowBookingModal(false)} style={{ background: '#F1F5F9', border: 'none', padding: '8px', borderRadius: '12px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>{user.userType === 'hospital' ? 'PATIENT NAME' : 'CUSTOMER NAME'}</label>
                                    <input className="input-field" required placeholder="Full Name" value={bookingForm.patientName} onChange={e=>setBookingForm({...bookingForm, patientName: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>PHONE NUMBER</label>
                                    <input className="input-field" required placeholder="+91 0000000000" value={bookingForm.patientPhone} onChange={e=>setBookingForm({...bookingForm, patientPhone: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>ASSIGN TO STAFF / {user.userType === 'hospital' ? 'DOCTOR' : 'EXPERT'}</label>
                                <select className="input-field" required value={bookingForm.professionalId} onChange={e=>setBookingForm({...bookingForm, professionalId: e.target.value})}>
                                    <option value="">Select Professional...</option>
                                    {employees.filter(e => e.role !== 'hr').map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.department || 'Staff'})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>DATE</label>
                                    <input className="input-field" type="date" required value={bookingForm.manualDate} onChange={e=>setBookingForm({...bookingForm, manualDate: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>TIME</label>
                                    <input className="input-field" type="time" required value={bookingForm.manualTime} onChange={e=>setBookingForm({...bookingForm, manualTime: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '8px', color: '#1E293B' }}>NOTES / PURPOSE</label>
                                <textarea className="input-field" placeholder="Brief reason for booking..." style={{ minHeight: '80px', resize: 'vertical' }} value={bookingForm.notes} onChange={e=>setBookingForm({...bookingForm, notes: e.target.value})} />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowBookingModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2, height: '56px', fontWeight: 900, borderRadius: '16px' }}>Complete Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ONBOARDING OVERLAY */}
            {(!user.sector || user.sector === 'general' || user.sector === 'User') && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: '24px' }}>
                    <div className="onboarding-modal" style={{ background: 'white', width: '100%', maxWidth: onboardingStep === 1 ? '900px' : '500px', borderRadius: '32px', padding: '48px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                                <div style={{ background: '#EEF2FF', padding: '16px', borderRadius: '24px', color: '#4F46E5' }}>
                                    <Building size={32} />
                                </div>
                            </div>
                            {onboardingStep === 1 && <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Welcome to your workspace!</h2>}
                            {onboardingStep === 2 && <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Refine your establishment</h2>}
                            {onboardingStep === 3 && <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#10B981', marginBottom: '8px' }}>Setup Complete!</h2>}
                            
                            <p style={{ color: '#64748B', fontWeight: 600, fontSize: '16px' }}>
                                {onboardingStep === 1 && "What industry does your organization belong to?"}
                                {onboardingStep === 2 && `Which specific type of ${onboardingSector} are you?`}
                                {onboardingStep === 3 && "We are tailoring your dashboard experience."}
                            </p>
                        </div>

                        {onboardingStep === 1 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                {Array.from(new Set(allSectors.map(s => s.category))).map(cat => {
                                    const iconName = allSectors.find(s => s.category === cat)?.icon;
                                    
                                    const getIconColor = (name) => {
                                        switch(name) {
                                            case 'Hospital': return '#EF4444';
                                            case 'Heart': return '#F43F5E';
                                            case 'Scissors': return '#EC4899';
                                            case 'Home': return '#F59E0B';
                                            case 'Car': return '#3B82F6';
                                            case 'Dumbbell': return '#10B981';
                                            case 'GraduationCap': return '#8B5CF6';
                                            case 'Laptop': return '#6366F1';
                                            case 'Cpu': return '#06B6D4';
                                            case 'Wrench': return '#64748B';
                                            case 'Scale': return '#1E293B';
                                            case 'Camera': return '#F43F5E';
                                            case 'Calendar': return '#4F46E5';
                                            case 'Gavel': return '#78350F';
                                            case 'Music': return '#D946EF';
                                            case 'Sparkles': return '#F59E0B';
                                            default: return '#4F46E5';
                                        }
                                    };
                                    const iconColor = getIconColor(iconName);

                                    let iconComponent = <Building2 size={32} color={iconColor} />;
                                    if (iconName === 'Heart') iconComponent = <Heart size={32} color={iconColor} />;
                                    else if (iconName === 'Sparkles') iconComponent = <Sparkles size={32} color={iconColor} />;
                                    else if (iconName === 'Home') iconComponent = <Home size={32} color={iconColor} />;
                                    else if (iconName === 'Car') iconComponent = <Car size={32} color={iconColor} />;
                                    else if (iconName === 'Dumbbell') iconComponent = <Dumbbell size={32} color={iconColor} />;
                                    else if (iconName === 'GraduationCap') iconComponent = <GraduationCap size={32} color={iconColor} />;
                                    else if (iconName === 'Laptop') iconComponent = <Laptop size={32} color={iconColor} />;
                                    else if (iconName === 'Cpu') iconComponent = <Cpu size={32} color={iconColor} />;
                                    else if (iconName === 'Wrench') iconComponent = <Wrench size={32} color={iconColor} />;
                                    else if (iconName === 'Scale') iconComponent = <Scale size={32} color={iconColor} />;
                                    else if (iconName === 'Camera') iconComponent = <Camera size={32} color={iconColor} />;
                                    else if (iconName === 'Calendar') iconComponent = <Calendar size={32} color={iconColor} />;
                                    else if (iconName === 'Gavel') iconComponent = <Gavel size={32} color={iconColor} />;
                                    else if (iconName === 'Music') iconComponent = <Music size={32} color={iconColor} />;
                                    else if (iconName === 'Hospital') iconComponent = <Building2 size={32} color={iconColor} />;
                                    else if (iconName === 'Scissors') iconComponent = <Scissors size={32} color={iconColor} />;
                                    
                                    return (
                                        <div 
                                            key={cat}
                                            onClick={() => { setOnboardingSector(cat); setOnboardingStep(2); }}
                                            style={{ 
                                                background: 'white', padding: '24px', borderRadius: '20px', border: '2px solid #E2E8F0', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <div style={{ fontSize: '32px' }}>{iconComponent}</div>
                                            <div style={{ fontWeight: 900, color: '#0F172A' }}>{cat}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {onboardingStep === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <select 
                                    className="input-field" 
                                    style={{ height: '60px', fontSize: '16px', fontWeight: 700 }}
                                    value={onboardingSubSector}
                                    onChange={e => setOnboardingSubSector(e.target.value)}
                                >
                                    <option value="">Select specific type...</option>
                                    {allSectors.filter(s => s.category === onboardingSector).map(s => (
                                        <option key={s._id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setOnboardingStep(1)}>Back</button>
                                    <button 
                                        className="btn btn-primary" 
                                        style={{ flex: 2, height: '60px' }}
                                        disabled={!onboardingSubSector || onboardingLoading}
                                        onClick={handleCompleteOnboarding}
                                    >
                                        {onboardingLoading ? 'Saving...' : 'Enter Dashboard'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {onboardingStep === 3 && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4F46E5', opacity: 0.3 + (i * 0.3) }} />
                                    ))}
                                </div>
                                <p style={{ fontWeight: 800, color: '#4F46E5' }}>Configuring sector-specific themes...</p>
                            </div>
                        )}

                    </div>
                </div>
            )}
            {/* TRAINING PAYMENT MODAL */}
            {showTrainingPayment && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '24px' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>Select Training Package</h2>
                            <button onClick={() => setShowTrainingPayment(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { id: 'basic', label: 'Dashboard Basics', price: 'Rs. 4,999', duration: '2 Hours', icon: '[!]' },
                                { id: 'advanced', label: 'Advanced Staff Mgmt', price: 'Rs. 9,999', duration: '5 Hours', icon: '[!]' },
                                { id: 'full', label: 'Full System Implementation', price: 'Rs. 19,999', duration: 'Full Day', icon: '[!]' }
                            ].map(pkg => (
                                <div 
                                    key={pkg.id}
                                    onClick={() => setSelectedTrainingPackage(pkg)}
                                    style={{ 
                                        padding: '20px', borderRadius: '16px', border: '2px solid', 
                                        borderColor: selectedTrainingPackage?.id === pkg.id ? '#4F46E5' : '#E2E8F0',
                                        background: selectedTrainingPackage?.id === pkg.id ? '#F0F9FF' : 'white',
                                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '16px'
                                    }}
                                >
                                    <div style={{ fontSize: '30px' }}>{pkg.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900, fontSize: '16px', color: '#0F172A' }}>{pkg.label}</div>
                                        <div style={{ fontSize: '12px', color: '#64748B' }}>Duration: {pkg.duration}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 900, fontSize: '18px', color: '#4F46E5' }}>{pkg.price}</div>
                                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>ONE-TIME</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '32px', padding: '20px', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                            <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 800 }}>Payment Method</h4>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 800 }}>Razorpay / UPI</div>
                                <div style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 800 }}>Net Banking</div>
                            </div>
                        </div>

                        <button 
                            className="btn btn-primary" 
                            disabled={!selectedTrainingPackage}
                            style={{ width: '100%', height: '56px', marginTop: '24px', borderRadius: '16px', fontWeight: 900, fontSize: '16px' }}
                            onClick={() => {
                                setPaymentData({ 
                                    amount: selectedTrainingPackage?.price, 
                                    title: `Training: ${selectedTrainingPackage?.label}` 
                                });
                                setShowPaymentModal(true);
                            }}
                        >
                            Proceed to Payment & Book
                        </button>
                    </div>
                </div>
            )}

                </main>
    
                {/* MAIN CONTENT AREA FOOTER */}
                <div style={{ padding: '60px 40px 40px', borderTop: '1px solid #E2E8F0', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                    <div>
                         <div style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', marginBottom: '4px' }}>POWERED BY</div>
                         <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>Forge India Connect</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Smart Appointment Scheduling System</div>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8' }}>(c) 2024 All Rights Reserved. v2.1.0</div>
                    </div>
                </div>
            </div>

            {/* TRIAL EXPIRED LOCKDOWN OVERLAY */}
            {user.plan?.type === 'free' && user.plan?.expiryDate && new Date(user.plan.expiryDate) < new Date() && (
                <div style={{ 
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.98)', zIndex: 100000, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', padding: '24px' 
                }}>
                    <div style={{ 
                        background: 'white', width: '100%', maxWidth: '600px', borderRadius: '32px', padding: '48px', 
                        textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden', animation: 'scaleUp 0.4s ease-out'
                    }}>
                        {!showUpgradeFlow ? (
                            <>
                                <div style={{ position: 'relative', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '32px' }}>
                                    <div style={{ position: 'absolute', width: '100px', height: '100px', background: '#FEE2E2', borderRadius: '50%', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                                    <ShieldAlert size={64} color="#EF4444" style={{ position: 'relative' }} />
                                </div>

                                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#1E293B', marginBottom: '16px' }}>Oops... Something went wrong!</h2>
                                <p style={{ fontSize: '18px', color: '#64748B', fontWeight: 600, marginBottom: '32px', lineHeight: '1.6' }}>
                                    Your 1-Day Training Period (24 Hours) has finished. To continue managing your business, please upgrade to our premium plan.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <button 
                                        className="btn btn-primary" 
                                        style={{ height: '64px', fontSize: '18px', fontWeight: 900, borderRadius: '20px' }}
                                        onClick={() => setShowUpgradeFlow(true)}
                                    >
                                        Pay and Continue Here
                                    </button>
                                    <button className="btn btn-outline" style={{ border: 'none', color: '#EF4444', fontWeight: 800 }} onClick={logout}>Sign Out & Register Later</button>
                                </div>
                            </>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '24px' }}>Choose Your Path</h2>
                                
                                <div style={{ display: 'grid', gap: '16px', textAlign: 'left', marginBottom: '32px' }}>
                                    {[
                                        { id: 'pro', name: 'Pro SaaS Plan', price: 'Rs. 29,999/year', features: ['Unlimited Bookings', 'Unlimited Staff', 'Custom Branding'], icon: 'Pro' },
                                        { id: 'growth', name: 'Growth Plan', price: 'Rs. 14,999/year', features: ['500 Bookings/mo', '10 Staff Members', 'Standard Analytics'], icon: 'Growth' }
                                    ].map(plan => (
                                        <div 
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan)}
                                            style={{ 
                                                padding: '20px', borderRadius: '20px', border: '2px solid', 
                                                borderColor: selectedPlan?.id === plan.id ? '#4F46E5' : '#E2E8F0',
                                                background: selectedPlan?.id === plan.id ? '#F0F9FF' : 'white',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontWeight: 900, fontSize: '18px' }}>{plan.icon} {plan.name}</div>
                                                <div style={{ fontWeight: 900, color: '#4F46E5' }}>{plan.price}</div>
                                            </div>
                                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748B' }}>
                                                {plan.features.join(' * ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedPlan ? (
                                    <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '24px', marginBottom: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                        <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 900, color: '#0F172A', textAlign: 'left' }}>Confirm & Pay for {selectedPlan.name}</h4>
                                        
                                        <div style={{ padding: '16px', background: 'white', borderRadius: '16px', marginBottom: '24px', border: '1px solid #F1F5F9', textAlign: 'left' }}>
                                            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount:</div>
                                            <div style={{ fontSize: '24px', fontWeight: 950, color: '#4F46E5' }}>{selectedPlan.price}</div>
                                        </div>

                                        {/* ═══ DIRECT UPI PAYMENT OPTION ═══ */}
                                        <div style={{ background: '#1A1A2E', borderRadius: '24px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 15px 30px rgba(0,0,0,0.15)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#5E239D', color: 'white', padding: '6px 14px', borderRadius: '100px', width: 'fit-content', margin: '0 auto 16px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                <Zap size={12} fill="currentColor" /> Direct Upgrade Payment
                                            </div>

                                            <div style={{ marginBottom: '20px' }}>
                                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Amount to Pay</div>
                                                <div style={{ fontSize: '28px', fontWeight: 950, color: '#10B981' }}>{selectedPlan.price}</div>
                                            </div>
                                            
                                            <div style={{ position: 'relative', display: 'inline-block', padding: '12px', background: '#FFFFFF', borderRadius: '16px', marginBottom: '16px' }}>
                                                <img 
                                                    src="/phonepe-qr.jpeg" 
                                                    alt="UPI QR Code" 
                                                    style={{ width: '150px', height: '150px', display: 'block', objectFit: 'contain' }}
                                                    onError={(e) => {
                                                        const cleanAmount = selectedPlan.price.replace(/[^0-9]/g, '');
                                                        e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${cleanAmount}&cu=INR`;
                                                    }}
                                                />
                                                <div style={{ position: 'absolute', top: '6px', left: '6px', width: '12px', height: '12px', borderTop: '2px solid rgba(0,0,0,0.1)', borderLeft: '2px solid rgba(0,0,0,0.1)', borderRadius: '4px 0 0 0' }}></div>
                                                <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '12px', height: '12px', borderBottom: '2px solid rgba(0,0,0,0.1)', borderRight: '2px solid rgba(0,0,0,0.1)', borderRadius: '0 0 4px 0' }}></div>
                                            </div>
                                            
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>Scan with any UPI App</div>
                                            <div style={{ color: 'white', fontSize: '18px', fontWeight: 950, letterSpacing: '0.5px' }}>{UPI_ID}</div>

                                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 16px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#10B981', fontWeight: 800, marginTop: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                <div style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                                                Secure System Verification Active
                                            </div>
                                        </div>

                                        <button className="btn btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '14px', fontWeight: 900, background: '#4F46E5' }} onClick={() => {
                                            setPaymentData({ amount: selectedPlan.price, title: selectedPlan.name });
                                            setShowPaymentModal(true);
                                        }}>
                                            Continue to Portal Checkout
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ height: '116px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px', fontStyle: 'italic' }}>
                                        Please select a plan above to continue
                                    </div>
                                )}

                                <button 
                                    className="btn btn-outline" 
                                    style={{ width: '100%', border: 'none' }} 
                                    onClick={() => setShowUpgradeFlow(false)}
                                >
                                    Go Back
                                </button>
                            </div>
                        )}
                    </div>
                    <style>{`
                        @keyframes scaleUp {
                            from { transform: scale(0.9); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                        @keyframes ping {
                            75%, 100% { transform: scale(2); opacity: 0; }
                        }
                    `}</style>
                </div>
            )}

            {/* MOCK PAYMENT GATEWAY MODAL */}
            {showPaymentModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200000, padding: '20px' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', animation: 'fadeIn 0.4s ease' }}>
                        
                        {/* Header */}
                        <div style={{ background: '#F8FAFC', padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>{paymentData.title}</h3>
                                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Forge India SaaS Gateway</div>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '32px' }}>
                                      <div style={{ background: '#1A1A2E', padding: '32px 24px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#5E239D', color: 'white', padding: '10px 20px', borderRadius: '100px', width: 'fit-content', margin: '0 auto 28px', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                     <Smartphone size={16} /> Pay via PhonePe
                                 </div>

                                 <div style={{ marginBottom: '24px' }}>
                                     <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Amount Due</div>
                                     <div style={{ fontSize: '38px', fontWeight: 950, color: '#10B981' }}>{paymentData.amount}</div>
                                 </div>

                                 <div style={{ position: 'relative', display: 'inline-block', padding: '20px', background: '#FFFFFF', borderRadius: '24px', marginBottom: '20px' }}>
                                     <img 
                                         src="/phonepe-qr.jpeg" 
                                         alt="PhonePe QR Code" 
                                         style={{ width: '220px', height: '220px', borderRadius: '12px', display: 'block', objectFit: 'contain' }} 
                                         onError={(e) => {
                                             if (e.target.src.includes('phonepe-qr.jpeg')) {
                                                 e.target.src = '/qr-payment-v2.png';
                                             } else if (e.target.src.includes('qr-payment-v2.png')) {
                                                 e.target.src = '/qr-payment-new.png';
                                             } else if (e.target.src.includes('qr-payment-new.png')) {
                                                 e.target.src = '/qr-payment.jpg';
                                             } else {
                                                 e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${paymentData.amount.replace(/[^0-9.]/g, '')}&cu=INR`;
                                             }
                                         }}
                                     />
                                     {/* Decorative Corner Accents */}
                                     <div style={{ position: 'absolute', top: '15px', left: '15px', width: '25px', height: '25px', borderTop: '2px solid rgba(255,255,255,0.2)', borderLeft: '2px solid rgba(255,255,255,0.2)', borderRadius: '6px 0 0 0' }}></div>
                                     <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '25px', height: '25px', borderBottom: '2px solid rgba(255,255,255,0.2)', borderRight: '2px solid rgba(255,255,255,0.2)', borderRadius: '0 0 6px 0' }}></div>
                                 </div>

                                 <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>Scan with any UPI App</div>
                                 <div style={{ color: 'white', fontSize: '18px', fontWeight: 950, letterSpacing: '0.5px' }}>{UPI_ID}</div>

                                 <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 16px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#10B981', fontWeight: 800, marginTop: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                     <div style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                                     Automated Transaction Syncing...
                                 </div>
                             </div>

                            <div style={{ fontSize: '12px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Or Pay via Card</div>
                            
                            {/* Card Option */}
                            <div 
                                onClick={() => setPaymentMethod('card')}
                                style={{ 
                                    padding: '16px', borderRadius: '16px', border: `2px solid ${paymentMethod === 'card' ? 'var(--primary)' : '#F1F5F9'}`,
                                    background: paymentMethod === 'card' ? '#EEF2FF' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px'
                                }}
                            >
                                <div style={{ background: '#0F172A', color: 'white', padding: '10px', borderRadius: '12px' }}><CreditCard size={20} /></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: '14px' }}>Credit / Debit Card</div>
                                    <div style={{ fontSize: '11px', color: '#64748B' }}>Visa, Mastercard, RuPay</div>
                                </div>
                                {paymentMethod === 'card' && <CheckCircle size={18} color="var(--primary)" />}
                            </div>

                            <button 
                                className="btn btn-primary" 
                                disabled={paymentStage !== 'idle'}
                                style={{ width: '100%', marginTop: '32px', padding: '16px', borderRadius: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                onClick={processPayment}
                            >
                                {paymentStage !== 'idle' ? 'Processing Secure Payment...' : `Pay ${paymentData.amount} Now`}
                            </button>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px', color: '#94A3B8' }}>
                                <ShieldAlert size={14} />
                                <span style={{ fontSize: '11px', fontWeight: 700 }}>SSL SECURED & ENCRYPTED</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TUTORIAL VIDEO MODAL */}
            {showTutorialModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300000, padding: '24px' }}>
                    <div style={{ background: '#0F172A', width: '100%', maxWidth: '1000px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', padding: '10px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)' }}><Play size={20} fill="white" /></div>
                                    Step-by-Step Admin Walkthrough
                                </h3>
                                <div style={{ fontSize: '14px', color: '#94A3B8', marginTop: '6px', fontWeight: 600 }}>Master your dashboard in 3 simple steps.</div>
                            </div>
                            <button 
                                onClick={() => setShowTutorialModal(false)} 
                                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'white', padding: '12px', borderRadius: '14px', transition: 'all 0.3s' }}
                                onMouseEnter={(e) => e.target.style.background = '#EF4444'}
                                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', background: '#0F172A', minHeight: '600px' }}>
                            {/* Cinematic Scene Progress */}
                            <div style={{ width: '320px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '32px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ marginBottom: '32px' }}>
                                    <h4 style={{ color: 'white', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '24px' }}>A-Z Business Flow</h4>
                                    {[
                                        { id: 1, title: '1. Instant Registration', desc: 'Starting your 24h Trial' },
                                        { id: 2, title: '2. Trial to Premium', desc: 'Expanding after 24 hours' },
                                        { id: 3, title: '3. Team Hierarchy', desc: 'Client -> HR -> Employee' },
                                        { id: 4, title: '4. Dynamic Slots', desc: 'Sector-wise availability' },
                                        { id: 5, title: '5. User Experience', desc: 'End-to-End Booking' }
                                    ].map((s) => (
                                        <div 
                                            key={s.id} 
                                            onClick={() => setTutorialScene(s.id)}
                                            style={{ 
                                                display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px',
                                                color: tutorialScene === s.id ? 'white' : '#64748B',
                                                cursor: 'pointer', transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{ 
                                                width: '32px', height: '32px', borderRadius: '10px', 
                                                background: tutorialScene === s.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: tutorialScene === s.id ? 'white' : '#94A3B8',
                                                fontSize: '12px', fontWeight: 900,
                                                boxShadow: tutorialScene === s.id ? '0 0 20px rgba(79, 70, 229, 0.4)' : 'none'
                                            }}>
                                                {s.id}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 900, fontSize: '14px' }}>{s.title}</div>
                                                <div style={{ fontSize: '10px', opacity: 0.6 }}>{s.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Scene Content Region */}
                            <div style={{ flex: 1, position: 'relative', background: '#000', overflow: 'hidden', padding: '60px' }}>
                                <AnimatePresence mode="wait">
                                    <motion.div 
                                        key={tutorialScene}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5 }}
                                        style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                                    >
                                        <div style={{ 
                                            display: 'inline-flex', padding: '8px 20px', background: 'rgba(79, 70, 229, 0.1)', 
                                            borderRadius: '100px', color: '#818CF8', fontSize: '12px', fontWeight: 900, 
                                            marginBottom: '32px', border: '1px solid rgba(79, 70, 229, 0.2)'
                                        }}>
                                            SCENE 0{tutorialScene} • {tutorialScene === 1 ? 'ONBOARDING' : tutorialScene === 2 ? 'GROWTH' : tutorialScene === 3 ? 'TEAM' : tutorialScene === 4 ? 'DYNAMIC' : 'CONVERSION'}
                                        </div>

                                        {tutorialScene === 1 && (
                                            <>
                                                <span style={{ fontSize: '11px', fontWeight: 900, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '1px' }}>Premium Access</span>
                                                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: '4px 0 12px' }}>Unlock All Advanced Features</h3>
                                                <p style={{ fontSize: '13px', color: '#A5B4FC', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>Access professional themes, custom domains, and AI-driven insights for your business growth.</p>
                                                <p style={{ color: '#94A3B8', fontSize: '18px', maxWidth: '600px', lineHeight: 1.6, marginTop: '20px' }}>Register your organization in seconds. Everyone starts with a full-access 24-hour training period to explore every feature.</p>
                                                <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <Clock size={48} color="var(--primary)" style={{ animation: 'spin 10s linear infinite' }} />
                                                </div>
                                            </>
                                        )}

                                        {tutorialScene === 2 && (
                                            <>
                                                <div style={{ fontSize: '48px', fontWeight: 900, color: 'white', marginBottom: '16px' }}>Beyond <span style={{ color: '#EF4444' }}>The Trial</span></div>
                                                <p style={{ color: '#94A3B8', fontSize: '18px', maxWidth: '600px', lineHeight: 1.6 }}>Once the 24-hour magic expires, our "Oops" lockdown keeps your data safe while you upgrade to a professional plan.</p>
                                                <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                                                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}><ShieldAlert size={32} color="#EF4444" /></div>
                                                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}><ArrowRight size={32} color="white" /></div>
                                                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}><CreditCard size={32} color="#10B981" /></div>
                                                </div>
                                            </>
                                        )}

                                        {tutorialScene === 3 && (
                                            <>
                                                <div style={{ fontSize: '48px', fontWeight: 900, color: 'white', marginBottom: '16px' }}>The <span style={{ color: '#F59E0B' }}>Team Hierarchy</span></div>
                                                <p style={{ color: '#94A3B8', fontSize: '18px', maxWidth: '600px', lineHeight: 1.6 }}>Client Admin grants authority to HR. HR then creates and manages Employee accounts. Professional delegation at its best.</p>
                                                <div style={{ display: 'flex', gap: '40px', marginTop: '40px', alignItems: 'center' }}>
                                                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px' }}>Client</div><div style={{ color: 'white', fontWeight: 900, fontSize: '12px', marginTop: '8px' }}>CLIENT</div></div>
                                                    <ArrowRight size={20} color="#64748B" />
                                                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px' }}>HR</div><div style={{ color: 'white', fontWeight: 900, fontSize: '12px', marginTop: '8px' }}>HR MGR</div></div>
                                                    <ArrowRight size={20} color="#64748B" />
                                                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px' }}>Staff</div><div style={{ color: 'white', fontWeight: 900, fontSize: '12px', marginTop: '8px' }}>EMPLOYEES</div></div>
                                                </div>
                                            </>
                                        )}

                                        {tutorialScene === 4 && (
                                            <>
                                                <div style={{ fontSize: '48px', fontWeight: 900, color: 'white', marginBottom: '16px' }}>Sector-Wise <span style={{ color: '#8B5CF6' }}>Slots</span></div>
                                                <p style={{ color: '#94A3B8', fontSize: '18px', maxWidth: '600px', lineHeight: 1.6 }}>Employees manage their own availability specifically tailored to your industry (Salon, Clinic, or Education).</p>
                                                <div style={{ marginTop: '40px', padding: '32px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '32px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                    <GripVertical size={40} color="#8B5CF6" />
                                                </div>
                                            </>
                                        )}

                                        {tutorialScene === 5 && (
                                            <>
                                                <div style={{ fontSize: '48px', fontWeight: 900, color: 'white', marginBottom: '16px' }}>Global <span style={{ color: '#10B981' }}>User Booking</span></div>
                                                <p style={{ color: '#94A3B8', fontSize: '18px', maxWidth: '600px', lineHeight: 1.6 }}>Finally, the user finds your public profile and books the exactly right slot. The circle of your business flow is complete.</p>
                                                <div style={{ marginTop: '40px', display: 'flex', gap: '12px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', animation: 'pulse 1s infinite' }}></div>
                                                    <div style={{ color: '#10B981', fontWeight: 900, fontSize: '14px' }}>LIVE BOOKING ENGINE ACTIVE</div>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Scene Controls */}
                                <div style={{ position: 'absolute', bottom: '40px', left: '60px', right: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button 
                                        disabled={tutorialScene === 1}
                                        onClick={() => setTutorialScene(prev => prev - 1)}
                                        style={{ background: 'none', border: 'none', color: tutorialScene === 1 ? '#334155' : 'white', cursor: 'pointer', fontWeight: 900 }}
                                    >Previous Scene</button>
                                    
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '4px', background: tutorialScene === i ? 'var(--primary)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => {
                                            if (tutorialScene === 5) setShowTutorialModal(false);
                                            else setTutorialScene(prev => prev + 1);
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 900 }}
                                    >{tutorialScene === 5 ? 'Start Exploring Now [ok]' : 'Next Scene ->'}</button>
                                </div>
                            </div>
                        </div>

                        <style>{`
                            @keyframes presentationFlow {
                                0% { transform: scale(1); }
                                50% { transform: scale(1.02); }
                                100% { transform: scale(1); }
                            }
                            @keyframes pulse {
                                0% { transform: scale(0.5); opacity: 0.8; }
                                100% { transform: scale(3); opacity: 0; }
                            }
                        `}</style>

                        <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button 
                                className="btn btn-primary" 
                                style={{ borderRadius: '20px', padding: '16px 48px', fontSize: '16px', fontWeight: 900, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none', boxShadow: '0 15px 30px rgba(79, 70, 229, 0.4)' }}
                                onClick={() => setShowTutorialModal(false)}
                            >
                                Enter Professional Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <FloatingSupport />
            <ChatWidget role="client" />
        </div>
    );
};

export default ClientDashboard;
