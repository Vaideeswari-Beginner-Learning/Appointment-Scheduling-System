import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Calendar, Clock, CheckCircle, XCircle, IndianRupee, AlertCircle, BarChart3 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const DashboardStats = ({ role }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/analytics/stats`, {
                    headers: { 'x-auth-token': token }
                });
                setStats(res.data);
            } catch (err) {
                console.error('Stats fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: '#F1F5F9', borderRadius: '16px', height: '100px', animation: 'pulse 1.5s infinite' }} />
            ))}
        </div>
    );

    if (!stats) return null;

    const cards = [
        { label: 'Total Bookings', value: stats.totalBookings || 0, icon: BarChart3, color: '#4F46E5', bg: '#EEF2FF' },
        { label: "Today's Appointments", value: stats.todayBookings || 0, icon: Calendar, color: '#0891B2', bg: '#ECFEFF' },
        { label: 'Pending Requests', value: stats.pendingCount || 0, icon: Clock, color: '#D97706', bg: '#FEF3C7' },
        { label: 'Revenue (Paid)', value: `Rs. ${stats.revenue || 0}`, icon: IndianRupee, color: '#16A34A', bg: '#F0FDF4' },
        { label: 'Confirmed', value: stats.confirmedCount || 0, icon: CheckCircle, color: '#059669', bg: '#D1FAE5' },
        { label: 'Completed', value: stats.completedCount || 0, icon: TrendingUp, color: '#7C3AED', bg: '#FAF5FF' },
        { label: 'Cancelled', value: stats.cancelledCount || 0, icon: XCircle, color: '#DC2626', bg: '#FEF2F2' },
        { label: 'This Week Trend', value: `${stats.last7Days?.slice(-1)[0]?.count || 0} today`, icon: AlertCircle, color: '#EA580C', bg: '#FFF7ED' },
    ];

    return (
        <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                {cards.slice(0, 4).map((card, i) => (
                    <div key={i} style={{
                        background: 'white', padding: '20px', borderRadius: '16px',
                        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <card.icon size={22} color={card.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{card.value}</div>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {cards.slice(4).map((card, i) => (
                    <div key={i} style={{
                        background: 'white', padding: '16px 20px', borderRadius: '14px',
                        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <card.icon size={18} color={card.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{card.value}</div>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginTop: '3px' }}>{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardStats;
