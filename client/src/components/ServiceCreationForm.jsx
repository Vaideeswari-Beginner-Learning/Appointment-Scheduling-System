import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Tag, DollarSign, FileText, Zap } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ServiceCreationForm = ({ onServiceCreated }) => {
    const [form, setForm] = useState({ name: '', description: '', price: '', category: 'General' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(API_BASE_URL + '/services', form, { 
                headers: { 'x-auth-token': token } 
            });
            alert('Service added successfully!');
            onServiceCreated();
            setForm({ name: '', description: '', price: '', category: 'General' });
        } catch (err) {
            alert('Failed to create service: ' + (err.response?.data?.message || err.message));
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
                    <Activity size={24} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#2D3748' }}>Configure New Service</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Define a new service offering for the recruitment or medical pipeline.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '20px', 
                alignItems: 'flex-end' 
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Tag size={14} /> Service Name
                    </label>
                    <input required type="text" placeholder="e.g. Master Health Checkup" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Tag size={14} /> Category
                    </label>
                    <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, background: 'white', outline: 'none' }}>
                        <option value="General">General</option>
                        <option value="Scan">Scan</option>
                        <option value="Blood Test">Blood Test</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Interview">Interview Prep</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <DollarSign size={14} /> Pricing (INR)
                    </label>
                    <input required type="number" placeholder="500" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={14} /> Description
                    </label>
                    <input required type="text" placeholder="Brief service overview..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <button type="submit" disabled={loading} style={{ 
                    padding: '12px 24px', 
                    borderRadius: '12px', 
                    background: '#5A315D', 
                    color: '#2D3748', 
                    border: 'none', 
                    fontSize: '14px', 
                    fontWeight: 900, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(90, 49, 93, 0.2)',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.2s',
                    minWidth: '160px'
                }}>
                    <Zap size={18} fill={loading ? 'none' : 'currentColor'} /> {loading ? 'Saving...' : 'Create Service'}
                </button>
            </form>
        </div>
    );
};

export default ServiceCreationForm;
