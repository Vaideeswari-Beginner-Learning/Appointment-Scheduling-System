import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Plus, Zap, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { getSectorConfig } from '../config/sectorConfig';

const ProfessionalSlotManager = ({ sector }) => {
    const { user } = useAuth();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    const sectorData = getSectorConfig(sector || user?.sector || 'general');
    const slotTypes = sectorData?.subCategories || ['General'];

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        type: slotTypes[0] || 'general'
    });

    useEffect(() => {
        // Reset type when sector changes
        if (slotTypes.length > 0) {
            setForm(prev => ({ ...prev, type: slotTypes[0] }));
        }
    }, [sector]);

    useEffect(() => {
        if (user?._id) {
            fetchMySlots();
        }
    }, [user?._id]);

    const fetchMySlots = async () => {
        const userId = user?._id || user?.id;
        if (!userId) {
            console.warn('[!] fetchMySlots called without a valid user ID');
            return;
        }

        setFetching(true);
        try {
            const token = localStorage.getItem('token');
            // Fetch slots where this professional is assigned
            const res = await axios.get(`${API_BASE_URL}/slots/available?professionalId=${userId}`, {
                headers: { 'x-auth-token': token }
            });
            setSlots(res.data);
        } catch (err) {
            console.error('Error fetching slots:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = user?._id || user?.id;
        if (!userId) {
            alert('Error: User not authenticated properly');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(API_BASE_URL + '/slots', { 
                ...form,
                professionalId: userId,
                professionalName: user.name
            }, {
                headers: { 'x-auth-token': token }
            });
            alert('Availability slot added!');
            fetchMySlots();
        } catch (error) {
            alert('Error creating slot: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm('Are you sure you want to remove this availability slot?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/slots/${id}`, {
                headers: { 'x-auth-token': token }
            });
            fetchMySlots();
        } catch (err) {
            alert('Failed to delete slot');
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '32px', animation: 'fadeIn 0.5s ease' }}>
            {/* SLOT CREATION FORM */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0', height: 'fit-content', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#F0F9FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369A1' }}>
                        <Plus size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Add Availability</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Define when clients can book you.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Date</label>
                        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required 
                            style={{ padding: '14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>From</label>
                            <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required 
                                style={{ padding: '14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Until</label>
                            <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required 
                                style={{ padding: '14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>Slot Type</label>
                        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} 
                            style={{ padding: '14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, background: 'white', textTransform: 'capitalize' }}>
                            {slotTypes.map(type => (
                                <option key={type} value={type.toLowerCase()}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" disabled={loading} style={{ 
                        padding: '16px', borderRadius: '12px', background: '#0F172A', color: 'white', border: 'none', fontSize: '14px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)', opacity: loading ? 0.7 : 1
                    }}>
                        <Zap size={18} fill={loading ? 'none' : 'currentColor'} /> {loading ? 'Saving...' : 'Confirm Availability'}
                    </button>
                </form>
            </div>

            {/* SLOTS LIST */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 800 }}>My Active Slots</h3>
                
                {fetching ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Loading availability...</div>
                ) : slots.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#F8FAFC', borderRadius: '20px', border: '2px dashed #E2E8F0' }}>
                        <Calendar size={40} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                        <p style={{ margin: 0, fontWeight: 700, color: '#64748B' }}>No slots created yet</p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94A3B8' }}>Your clients can't book you until you add slots.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        {slots.map(slot => (
                            <div key={slot._id} style={{ padding: '20px', borderRadius: '20px', border: '1px solid #E2E8F0', background: slot.isBooked ? '#F0FDF4' : '#F8FAFC', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'white', fontSize: '10px', fontWeight: 800, border: '1px solid #E2E8F0', textTransform: 'uppercase' }}>
                                        {slot.type}
                                    </div>
                                    {!slot.isBooked && (
                                        <button onClick={() => handleDeleteSlot(slot._id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                
                                <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>{new Date(slot.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                <div style={{ color: '#64748B', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} /> {slot.startTime} - {slot.endTime}
                                </div>

                                {slot.isBooked ? (
                                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontSize: '11px', fontWeight: 800 }}>
                                        <CheckCircle size={12} /> ALREADY BOOKED
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#0369A1', fontSize: '11px', fontWeight: 800 }}>
                                        <AlertCircle size={12} /> OPEN FOR BOOKING
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfessionalSlotManager;
