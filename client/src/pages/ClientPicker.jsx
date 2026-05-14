import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { getSectorConfig } from '../config/sectorConfig';
import { ArrowLeft, Search, Building2, MapPin, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const ClientPicker = () => {
    const [searchParams] = useSearchParams();
    const sectorId = searchParams.get('sector') || 'general';
    const navigate = useNavigate();
    
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const sectorCfg = getSectorConfig(sectorId);

    useEffect(() => {
        fetchClients();
    }, [sectorId]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/users/clients-by-sector/${sectorId}`);
            setClients(res.data);
        } catch (err) {
            console.error('Fetch Clients Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* HEADER */}
            <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '20px 40px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/')} style={{ background: '#F1F5F9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: '#64748B' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Select your {sectorCfg.label}</h1>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Choose from registered organizations</p>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                {/* SEARCH & SECTOR INFO */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EEF2FF', color: '#4F46E5', padding: '8px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>
                        Available in {sectorCfg.label}
                    </div>
                    <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#2D3748', marginBottom: '32px' }}>Pick a {sectorCfg.dashboard.userRole === 'Guest' ? 'Hotel' : (sectorCfg.dashboard.userRole === 'Student' ? 'College' : 'Organization')}</h2>
                    
                    <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                        <Search size={22} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                        <input 
                            placeholder={`Search ${sectorCfg.label} names...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', 
                                height: '64px', 
                                borderRadius: '20px', 
                                border: '2px solid #E2E8F0', 
                                paddingLeft: '56px',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>
                </div>

                {/* CLIENT GRID */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                        <span style={{ fontWeight: 800, color: '#718096' }}>Loading organizations...</span>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '32px', border: '2px dashed #E2E8F0' }}>
                        <Building2 size={64} color="#E2E8F0" style={{ marginBottom: '20px' }} />
                        <h3 style={{ fontWeight: 800, color: '#64748B' }}>No organizations found</h3>
                        <p style={{ color: '#718096' }}>Be the first to register a business in this sector!</p>
                        <button onClick={() => navigate('/client-register')} style={{ background: '#4F46E5', color: '#2D3748', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', marginTop: '16px' }}>Register Business</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {filteredClients.map(client => (
                            <motion.div 
                                key={client._id}
                                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                                onClick={() => navigate(`/book?clientId=${client.clientId || client._id}`)}
                                style={{ 
                                    background: 'white', 
                                    borderRadius: '24px', 
                                    padding: '24px', 
                                    border: '1px solid #E2E8F0', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: '64px', 
                                        height: '64px', 
                                        borderRadius: '16px', 
                                        background: '#F1F5F9',
                                        backgroundImage: client.avatar ? `url(${client.avatar})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        overflow: 'hidden'
                                    }}>
                                        {!client.avatar && <Building2 size={28} color="#718096" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#2D3748' }}>{client.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                            <Star size={14} fill="#F59E0B" color="#F59E0B" />
                                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#F59E0B' }}>4.8</span>
                                            <span style={{ fontSize: '12px', color: '#718096', fontWeight: 600 }}>(120+ reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '13px', fontWeight: 600 }}>
                                        <MapPin size={14} /> City Center
                                    </div>
                                    <div style={{ color: '#4F46E5', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        Book Now <ChevronRight size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ClientPicker;
