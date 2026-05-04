import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Mail, Lock, Activity, Zap, Stethoscope, Briefcase, Wrench, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

const StaffOnboardingForm = ({ onStaffOnboarded }) => {
    const { user } = useAuth();
    const dept = user?.department || 'hospital';
    
    // Dynamic config based on department
    const config = {
        hospital: {
            title: 'Onboard Medical Staff',
            subtitle: 'Add a new doctor or specialist to the team.',
            namePlaceholder: 'Dr. John Doe',
            emailPlaceholder: 'doctor@hospital.com',
            role: 'doctor',
            specialtyLabel: 'Medical Specialization',
            specialties: [
                'General Physician', 'Dentist', 'Surgeon', 'Pediatrician', 
                'Cardiologist', 'Neurologist', 'Radiologist', 'Nurse Practitioner',
                'Orthopedic', 'Dermatologist', 'Psychiatrist'
            ],
            icon: <Stethoscope size={24} />,
            color: '#10B981'
        },
        interview: {
            title: 'Onboard Hiring Expert',
            subtitle: 'Add a new recruitment specialist or interviewer.',
            namePlaceholder: 'Expert Name',
            emailPlaceholder: 'interviewer@company.com',
            role: 'interviewer',
            specialtyLabel: 'Domain Expertise',
            specialties: [
                'Technical Expert', 'System Architect', 'Frontend specialist', 
                'Backend specialist', 'HR Manager', 'Project Lead', 'Product Manager'
            ],
            icon: <Briefcase size={24} />,
            color: '#3B82F6'
        },
        service: {
            title: 'Onboard Service Technician',
            subtitle: 'Add a new specialized service provider.',
            namePlaceholder: 'Provider Name',
            emailPlaceholder: 'provider@service.com',
            role: 'service',
            specialtyLabel: 'Service Category',
            specialties: [
                'Camera Service', 'Fan Service', 'Washing Machine Service', 
                'AC Repair', 'Refrigerator Expert', 'Plumbing Expert', 
                'Electrical Specialist', 'Deep Cleaning', 'Pest Control'
            ],
            icon: <Wrench size={24} />,
            color: '#8B5CF6'
        },
        client: {
            title: 'Onboard Client Manager',
            subtitle: 'Add a new account manager or consultant.',
            namePlaceholder: 'Manager Name',
            emailPlaceholder: 'manager@client.com',
            role: 'service',
            specialtyLabel: 'Focus Area',
            specialties: [
                'Account Management', 'Strategic Consulting', 'Implementation Expert',
                'Business Relations', 'Customer Success Manager'
            ],
            icon: <UserPlus size={24} />,
            color: '#0F172A'
        }
    };

    const current = config[dept] || config.hospital;

    const timeSlots = [
        '08:00 AM - 04:00 PM',
        '09:00 AM - 05:00 PM',
        '10:00 AM - 06:00 PM',
        '12:00 PM - 08:00 PM',
        '02:00 PM - 10:00 PM',
        'Night Shift (10 PM - 6 AM)'
    ];

    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        specialty: current.specialties[0],
        workingHours: timeSlots[1],
        role: current.role,
        department: dept
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(API_BASE_URL + '/users/create-professional', form, { 
                headers: { 'x-auth-token': token } 
            });
            alert(`${form.name} onboarded successfully as ${form.specialty}!`);
            if (onStaffOnboarded) onStaffOnboarded();
            setForm({ 
                name: '', 
                email: '', 
                password: '', 
                specialty: current.specialties[0],
                workingHours: timeSlots[1],
                role: current.role,
                department: dept
            });
        } catch (err) {
            alert('Failed to onboard professional: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="staff-onboarding-container" style={{ 
            background: 'white', 
            borderRadius: '24px', 
            padding: '40px', 
            border: '1px solid #E2E8F0', 
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
            animation: 'fadeIn 0.5s ease',
            margin: '0 auto',
            width: '100%',
            maxWidth: '720px',
            boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ width: '56px', height: '56px', background: `${current.color}10`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: current.color, border: `1px solid ${current.color}20`, flexShrink: 0 }}>
                    {current.icon}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>{current.title}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontWeight: 600 }}>{current.subtitle}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '24px 20px', 
                width: '100%'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserPlus size={14} /> Full Name
                    </label>
                    <input required type="text" placeholder={current.namePlaceholder} value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        style={{ padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 700, outline: 'none', transition: 'all 0.2s', background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} /> Email ID
                    </label>
                    <input required type="email" placeholder={current.emailPlaceholder} value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        style={{ padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 700, outline: 'none', transition: 'all 0.2s', background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={14} /> Access Password
                    </label>
                    <input required type="password" placeholder="********" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                        style={{ padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 700, outline: 'none', transition: 'all 0.2s', background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> Default Shift / Slot
                    </label>
                    <select required value={form.workingHours} onChange={e => setForm({...form, workingHours: e.target.value})}
                        style={{ padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 700, background: '#F8FAFC', outline: 'none', cursor: 'pointer', width: '100%', boxSizing: 'border-box', height: '52px' }}>
                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2', width: '100%' }}>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={14} /> {current.specialtyLabel} (Dynamic)
                    </label>
                    <select required value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})}
                        style={{ padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 700, background: '#F8FAFC', outline: 'none', cursor: 'pointer', width: '100%', boxSizing: 'border-box', height: '52px' }}>
                        {current.specialties.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <button type="submit" disabled={loading} style={{ 
                    gridColumn: 'span 2',
                    padding: '16px', 
                    marginTop: '8px',
                    borderRadius: '16px', 
                    background: current.color, 
                    color: 'white', 
                    border: 'none', 
                    fontSize: '15px', 
                    fontWeight: 900, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '12px',
                    boxShadow: `0 8px 20px ${current.color}40`,
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.3s transform ease',
                    width: '100%',
                }}>
                    <Zap size={20} fill={loading ? 'none' : 'currentColor'} /> {loading ? 'Onboarding...' : `ADD EMPLOYEE TO SYSTEM`}
                </button>
            </form>
        </div>
    );
};

export default StaffOnboardingForm;
