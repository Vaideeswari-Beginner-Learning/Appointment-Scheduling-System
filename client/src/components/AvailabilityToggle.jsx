import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AvailabilityToggle = ({ currentStatus = 'available', onStatusChange }) => {
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);

    const statuses = [
        { id: 'available', label: 'Available', color: '#16A34A', bg: '#DCFCE7', dot: '#22C55E' },
        { id: 'busy', label: 'Busy', color: '#B76E79', bg: '#FEF3C7', dot: '#F59E0B' },
        { id: 'offline', label: 'Offline', color: '#64748B', bg: '#F1F5F9', dot: '#718096' },
    ];

    const current = statuses.find(s => s.id === status) || statuses[0];

    const updateStatus = async (newStatus) => {
        if (newStatus === status || loading) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/users/me/availability`,
                { status: newStatus },
                { headers: { 'x-auth-token': token } }
            );
            setStatus(newStatus);
            onStatusChange?.(newStatus);
        } catch (err) {
            console.error('Status update failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: current.bg, borderRadius: '99px', border: `1px solid ${current.dot}30` }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: current.dot, animation: status === 'available' ? 'pulse 2s infinite' : 'none' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: current.color }}>{current.label}</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
                {statuses.map(s => (
                    <button key={s.id} onClick={() => updateStatus(s.id)} disabled={loading}
                        title={`Set ${s.label}`}
                        style={{
                            width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${status === s.id ? s.dot : '#E2E8F0'}`,
                            background: status === s.id ? s.bg : 'white', cursor: 'pointer', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.dot }} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AvailabilityToggle;
