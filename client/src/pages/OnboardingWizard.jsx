import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronRight, ArrowLeft, Check, Sparkles, 
    Building2, GraduationCap, Heart, Scissors, 
    Hotel, Briefcase, Car, Dumbbell, Gavel, 
    Home, Wrench, Calendar, ShoppingBag, Lightbulb
} from 'lucide-react';
import OnboardingLoader from '../components/OnboardingLoader';
import { getSectorConfig, sectorConfig } from '../config/sectorConfig';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const sectorIcons = {
    health: Heart,
    education: GraduationCap,
    salon: Scissors,
    hotel: Hotel,
    corporate: Briefcase,
    automobile: Car,
    fitness: Dumbbell,
    legal: Gavel,
    property: Home,
    repair: Wrench,
    events: Calendar,
    retail: ShoppingBag,
    consultancy: Lightbulb,
    general: Building2
};

const OnboardingWizard = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;
    const [step, setStep] = useState('loader'); // loader, welcome, sectors, subsectors

    const handleLoaderComplete = () => {
        setStep('welcome');
    };

    const handleSelectSector = (key) => {
        setSelectedSector(key);
        setStep('subsectors');
    };

    const handleFinish = async () => {
        try {
            const token = localStorage.getItem('token');
            // Update user profile with sector and sub-category
            await axios.patch(`${API_BASE_URL}/users/${user.id}`, {
                sector: selectedSector,
                subCategory: selectedSubCategory,
                organizationName,
                organizationLogo,
                organizationDescription,
                organizationWebsite
            }, {
                headers: { 'x-auth-token': token }
            });
            
            updateUser({ 
                sector: selectedSector, 
                subCategory: selectedSubCategory, 
                organizationName,
                organizationLogo,
                organizationDescription,
                organizationWebsite
            });
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to update onboarding data:', err);
            navigate('/dashboard');
        }
    };

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
                {step === 'loader' && (
                    <OnboardingLoader key="loader" onComplete={handleLoaderComplete} />
                )}

                {step === 'welcome' && (
                    <motion.div
                        key="welcome"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="center-screen"
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            height: '100vh',
                            padding: '20px'
                        }}
                    >
                        <div style={{ 
                            background: 'white', 
                            padding: '60px', 
                            borderRadius: '40px', 
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            maxWidth: '600px',
                            border: '1px solid #E2E8F0'
                        }}>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    background: '#EEF2FF', 
                                    borderRadius: '24px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    margin: '0 auto 32px',
                                    color: '#4F46E5'
                                }}>
                                    <Sparkles size={40} />
                                </div>
                                <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#2D3748', marginBottom: '16px' }}>
                                    Welcome, {user?.name?.split(' ')[0]}!
                                </h1>
                                <p style={{ fontSize: '18px', color: '#64748B', lineHeight: 1.6, marginBottom: '40px' }}>
                                    We're excited to help you streamline your operations. Let's personalize your experience in a few quick steps.
                                </p>
                                <button 
                                    onClick={() => setStep('sectors')}
                                    style={{ 
                                        background: '#4F46E5', 
                                        color: '#2D3748', 
                                        border: 'none', 
                                        padding: '18px 48px', 
                                        borderRadius: '16px', 
                                        fontSize: '18px', 
                                        fontWeight: 800, 
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    Let's Go <ChevronRight size={20} />
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {step === 'sectors' && (
                    <motion.div
                        key="sectors"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#2D3748', marginBottom: '16px' }}>Tell us about your industry</h2>
                            <p style={{ fontSize: '18px', color: '#64748B' }}>Select the primary sector your organization operates in.</p>
                        </div>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                            gap: '24px',
                            justifyContent: 'center'
                        }}>
                            {Object.entries(sectorConfig).map(([key, config]) => {
                                const Icon = sectorIcons[key] || Building2;
                                return (
                                    <motion.div
                                        key={key}
                                        whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSelectSector(key)}
                                        style={{ 
                                            background: 'white', 
                                            padding: '32px', 
                                            borderRadius: '24px', 
                                            border: '2px solid #E2E8F0',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s'
                                        }}
                                    >
                                        <div style={{ 
                                            width: '56px', 
                                            height: '56px', 
                                            background: '#F8FAFC', 
                                            borderRadius: '16px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            margin: '0 auto 20px',
                                            color: '#4F46E5'
                                        }}>
                                            <Icon size={28} />
                                        </div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D3748' }}>{config.label}</h3>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {step === 'subsectors' && (
                    <motion.div
                        key="subsectors"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}
                    >
                        <button 
                            onClick={() => setStep('sectors')}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#64748B', 
                                fontSize: '14px', 
                                fontWeight: 800, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                cursor: 'pointer',
                                marginBottom: '32px'
                            }}
                        >
                            <ArrowLeft size={16} /> Back to Industry
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#2D3748', marginBottom: '16px' }}>
                                Refine your {sectorConfig[selectedSector]?.label} Setup
                            </h2>
                            <p style={{ fontSize: '18px', color: '#64748B' }}>Which category best describes your specific focus?</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {sectorConfig[selectedSector]?.subCategories?.map((sub, i) => (
                                <motion.div
                                    key={sub}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setSelectedSubCategory(sub)}
                                    style={{ 
                                        padding: '24px 32px', 
                                        borderRadius: '20px', 
                                        background: selectedSubCategory === sub ? '#EEF2FF' : 'white', 
                                        border: `2px solid ${selectedSubCategory === sub ? '#4F46E5' : '#E2E8F0'}`,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <span style={{ fontSize: '18px', fontWeight: 800, color: selectedSubCategory === sub ? '#4F46E5' : '#FFFFFF' }}>
                                        {sub}
                                    </span>
                                    {selectedSubCategory === sub && (
                                        <div style={{ width: '28px', height: '28px', background: '#4F46E5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D3748' }}>
                                            <Check size={18} />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {selectedSubCategory && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: '40px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px' }}
                            >
                                <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                                    <h4 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 900, color: '#2D3748' }}>
                                        Complete your {sectorConfig[selectedSector]?.brandLabel} Profile
                                    </h4>

                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 900, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {selectedSector === 'education' ? 'School / College Name' : `${sectorConfig[selectedSector]?.brandLabel} Name`}
                                        </label>
                                        <input 
                                            type="text"
                                            value={organizationName}
                                            onChange={(e) => setOrganizationName(e.target.value)}
                                            placeholder={`e.g. Greenwood ${selectedSector === 'education' ? 'High' : (selectedSector === 'health' ? 'Clinic' : 'Services')}`}
                                            style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: '2px solid #E2E8F0', fontSize: '16px', fontWeight: 600, outline: 'none' }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 900, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {selectedSector === 'education' ? 'School / College Website URL' : 'Website / Mini-Site URL'}
                                        </label>
                                        <input 
                                            type="text"
                                            value={organizationWebsite}
                                            onChange={(e) => setOrganizationWebsite(e.target.value)}
                                            placeholder="https://myschool.edu or https://mybusiness.com"
                                            style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: '2px solid #E2E8F0', fontSize: '16px', fontWeight: 600, outline: 'none' }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 900, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {sectorConfig[selectedSector]?.brandLabel} Logo URL
                                        </label>
                                        <input 
                                            type="text"
                                            value={organizationLogo}
                                            onChange={(e) => setOrganizationLogo(e.target.value)}
                                            placeholder="Paste a link to your logo image..."
                                            style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: '2px solid #E2E8F0', fontSize: '16px', fontWeight: 600, outline: 'none' }}
                                        />
                                        {organizationLogo && (
                                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden', background: '#F1F5F9' }}>
                                                    <img src={organizationLogo} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => e.target.src='https://via.placeholder.com/40?text=Error'} />
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#5A315D' }}>Logo Preview Loaded</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 900, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            About the {sectorConfig[selectedSector]?.brandLabel}
                                        </label>
                                        <textarea 
                                            value={organizationDescription}
                                            onChange={(e) => setOrganizationDescription(e.target.value)}
                                            placeholder={`Briefly describe your ${(sectorConfig[selectedSector]?.brandLabel || 'organization').toLowerCase()}...`}
                                            style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: '2px solid #E2E8F0', fontSize: '16px', fontWeight: 600, outline: 'none', minHeight: '120px', resize: 'vertical' }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        <div style={{ marginTop: '60px', textAlign: 'center' }}>
                            <button 
                                disabled={!selectedSubCategory || !organizationName}
                                onClick={handleFinish}
                                style={{ 
                                    background: (selectedSubCategory && organizationName) ? '#4F46E5' : '#CBD5E1', 
                                    color: '#2D3748', 
                                    border: 'none', 
                                    padding: '18px 60px', 
                                    borderRadius: '16px', 
                                    fontSize: '18px', 
                                    fontWeight: 800, 
                                    cursor: (selectedSubCategory && organizationName) ? 'pointer' : 'not-allowed',
                                    boxShadow: (selectedSubCategory && organizationName) ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)' : 'none'
                                }}
                            >
                                Complete Setup
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .center-screen {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
};

export default OnboardingWizard;
