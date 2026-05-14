import React, { useState } from 'react';
import axios from 'axios';
import { Building, Globe, User, Mail, Zap } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ClientRegistryForm = ({ onClientRegistered }) => {
    const [form, setForm] = useState({ name: '', industry: '', contactPerson: '', contactEmail: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(API_BASE_URL + '/hiring/clients', form, { 
                headers: { 'x-auth-token': token } 
            });
            alert('Client registered successfully!');
            onClientRegistered();
            setForm({ name: '', industry: '', contactPerson: '', contactEmail: '' });
        } catch (err) {
            alert('Failed to register client: ' + (err.response?.data?.message || err.message));
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
                <div style={{ width: '40px', height: '40px', background: '#F5F3FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                    <Building size={24} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#2D3748' }}>Register Corporate Client</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Onboard a new company or healthcare partner to your hiring portfolio.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px', 
                alignItems: 'flex-end' 
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building size={14} /> Company Name
                    </label>
                    <input required type="text" placeholder="e.g. Apollo Hospitals" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={14} /> Industry
                    </label>
                    <input required type="text" placeholder="e.g. Healthcare / IT" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} /> Contact Person
                    </label>
                    <input required type="text" placeholder="Full Name" value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} /> Contact Email
                    </label>
                    <input required type="email" placeholder="hr@client.com" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <button type="submit" disabled={loading} style={{ 
                    padding: '12px 24px', 
                    borderRadius: '12px', 
                    background: '#8B5CF6', 
                    color: '#2D3748', 
                    border: 'none', 
                    fontSize: '14px', 
                    fontWeight: 900, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.2s',
                    minWidth: '160px'
                }}>
                    <Zap size={18} fill={loading ? 'none' : 'currentColor'} /> {loading ? 'Registering...' : 'Add Client'}
                </button>
            </form>
        </div>
    );
};

export default ClientRegistryForm;
