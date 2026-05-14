import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, Plus, Zap } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const SlotCreation = ({ onSlotCreated, doctors = [] }) => {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [type, setType] = useState('general');
    const [professionalId, setProfessionalId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const selectedDr = doctors.find(d => d._id === professionalId);
            await axios.post(API_BASE_URL + '/slots', { 
                date, 
                startTime, 
                endTime, 
                type,
                professionalId,
                professionalName: selectedDr ? selectedDr.name : ''
            }, {
                headers: { 'x-auth-token': token }
            });
            alert('Slot created successfully!');
            onSlotCreated();
            // Reset form
            setStartTime('');
            setEndTime('');
            setProfessionalId('');
        } catch (error) {
            alert('Error creating slot: ' + error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            background: 'white', 
            borderRadius: '24px', 
            padding: '32px', 
            border: '1px solid #E2E8F0', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            marginBottom: '32px',
            animation: 'fadeIn 0.4s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', background: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A315D' }}>
                    <Plus size={24} />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#2D3748' }}>Create New Availability Slot</h3>
            </div>

            <form onSubmit={handleSubmit} style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '20px', 
                alignItems: 'flex-end' 
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> Date
                    </label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required 
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> Start Time
                    </label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required 
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> End Time
                    </label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required 
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Professional</label>
                    <select value={professionalId} onChange={(e) => setProfessionalId(e.target.value)} required 
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, background: 'white', outline: 'none' }}>
                        <option value="">Select Staff...</option>
                        {doctors.map(dr => (
                            <option key={dr._id} value={dr._id}>{dr.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} 
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, background: 'white', outline: 'none' }}>
                        <option value="general">General</option>
                        <option value="interview">Interview</option>
                        <option value="medical">Medical</option>
                    </select>
                </div>

                <button type="submit" disabled={loading} style={{ 
                    padding: '12px 24px', 
                    borderRadius: '12px', 
                    background: '#FFFFFF', 
                    color: '#2D3748', 
                    border: 'none', 
                    fontSize: '14px', 
                    fontWeight: 900, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.2s'
                }}>
                    <Zap size={18} fill={loading ? 'none' : 'currentColor'} /> {loading ? 'Adding...' : 'Add Slot'}
                </button>
            </form>
        </div>
    );
};

export default SlotCreation;
