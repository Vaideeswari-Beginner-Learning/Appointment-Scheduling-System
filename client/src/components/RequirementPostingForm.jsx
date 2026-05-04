import React, { useState } from 'react';
import axios from 'axios';
import { Target, Users, FileText, Building, Zap } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const RequirementPostingForm = ({ clients = [], onRequirementPosted }) => {
    const [form, setForm] = useState({ clientId: '', title: '', count: 1, description: '', status: 'active' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.clientId) { alert('Please select a client first.'); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(API_BASE_URL + '/hiring/requirements', form, { 
                headers: { 'x-auth-token': token } 
            });
            alert('Requirement posted successfully!');
            onRequirementPosted();
            setForm({ clientId: '', title: '', count: 1, description: '', status: 'active' });
        } catch (err) {
            alert('Failed to post requirement: ' + (err.response?.data?.message || err.message));
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
                <div style={{ width: '40px', height: '40px', background: '#FFF7ED', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316' }}>
                    <Target size={24} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Post Hiring Requirement</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Create a new vacancy or personnel request for your active clients.</p>
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
                        <Building size={14} /> Associated Client
                    </label>
                    <select required value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, background: 'white', outline: 'none' }}>
                        <option value="">Select Client...</option>
                        {clients.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Target size={14} /> Opening Title
                    </label>
                    <input required type="text" placeholder="e.g. Senior Nurse (ICU)" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} /> Vacancy Count
                    </label>
                    <input required type="number" placeholder="1" min="1" value={form.count} onChange={e => setForm({...form, count: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={14} /> Description
                    </label>
                    <input required type="text" placeholder="Brief job overview..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '14px', fontWeight: 600, outline: 'none' }} />
                </div>

                <button type="submit" disabled={loading} style={{ 
                    padding: '12px 24px', 
                    borderRadius: '12px', 
                    background: '#F97316', 
                    color: 'white', 
                    border: 'none', 
                    fontSize: '14px', 
                    fontWeight: 900, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.2s',
                    minWidth: '160px'
                }}>
                    <Zap size={18} fill={loading ? 'none' : 'currentColor'} /> {loading ? 'Posting...' : 'Create Opening'}
                </button>
            </form>
        </div>
    );
};

export default RequirementPostingForm;
