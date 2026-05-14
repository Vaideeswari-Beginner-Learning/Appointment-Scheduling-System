import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Briefcase, CheckCircle, ArrowLeft, Phone, Mail, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const StaffProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/users/profile/${id}`);
                setProfile(res.data);
            } catch (err) {
                setError('Could not load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #EEF2FF', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    if (error || !profile) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '48px', fontWeight: 900 }}>[!]</div>
            <p style={{ color: '#64748B' }}>Profile not found</p>
            <button onClick={() => navigate(-1)} style={{ background: '#4F46E5', color: '#2D3748', border: 'none', borderRadius: '10px', padding: '10px 24px', cursor: 'pointer', fontWeight: 700 }}>Go Back</button>
        </div>
    );

    const statusColors = { available: '#22C55E', busy: '#F59E0B', offline: '#718096' };
    const stars = Math.round(profile.averageRating || 0);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 20px' }}>
                {/* Back */}
                <button onClick={() => navigate(-1)} style={{ background: 'rgba(90, 49, 93, 0.2)', color: '#2D3748', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', backdropFilter: 'blur(10px)' }}>
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Profile Card */}
                <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', marginBottom: '24px' }}>
                    {/* Banner */}
                    <div style={{ height: '100px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }} />
                    <div style={{ padding: '0 32px 32px', marginTop: '-50px' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#EEF2FF', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                            {profile.avatar || profile.name?.charAt(0) || '[P]'}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 900, color: '#2D3748' }}>{profile.name}</h1>
                                <p style={{ margin: '0 0 8px', color: '#64748B', fontSize: '14px' }}>{profile.specialty || profile.department || profile.role}</p>
                                {/* Stars */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {[1,2,3,4,5].map(s => (
                                        <Star key={s} size={16} fill={s <= stars ? '#F59E0B' : 'none'} color={s <= stars ? '#F59E0B' : '#D1D5DB'} />
                                    ))}
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
                                        {profile.averageRating ? `${profile.averageRating}/5` : 'No ratings yet'}
                                    </span>
                                </div>
                            </div>
                            {/* Availability badge */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: `${statusColors[profile.availabilityStatus] || '#718096'}20`, borderRadius: '99px', border: `1px solid ${statusColors[profile.availabilityStatus] || '#718096'}40` }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[profile.availabilityStatus] || '#718096' }} />
                                <span style={{ fontSize: '13px', fontWeight: 800, color: statusColors[profile.availabilityStatus] || '#718096', textTransform: 'capitalize' }}>
                                    {profile.availabilityStatus || 'Available'}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '28px 0' }}>
                            {[
                                { icon: Briefcase, label: 'Experience', value: `${profile.experience || 0} yrs`, color: '#4F46E5', bg: '#EEF2FF' },
                                { icon: CheckCircle, label: 'Completed Jobs', value: profile.completedJobs || 0, color: '#16A34A', bg: '#DCFCE7' },
                                { icon: Star, label: 'Avg Rating', value: profile.averageRating ? `${profile.averageRating}/5` : 'N/A', color: '#B76E79', bg: '#FEF3C7' },
                            ].map((stat, i) => (
                                <div key={i} style={{ padding: '20px', background: stat.bg, borderRadius: '16px', textAlign: 'center' }}>
                                    <stat.icon size={24} color={stat.color} style={{ margin: '0 auto 8px', display: 'block' }} />
                                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#2D3748' }}>{stat.value}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginTop: '4px' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Contact */}
                        {(profile.email || profile.bio) && (
                            <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '14px', marginBottom: '8px' }}>
                                {profile.bio && <p style={{ margin: '0 0 12px', color: '#475569', fontSize: '14px', lineHeight: 1.6 }}>{profile.bio}</p>}
                                {profile.email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px' }}><Mail size={14} />{profile.email}</div>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '28px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 900, color: '#2D3748' }}>
                        Customer Reviews ({profile.reviews?.length || 0})
                    </h2>
                    {profile.reviews?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {profile.reviews.map((review, i) => (
                                <div key={i} style={{ padding: '16px 20px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '14px', color: '#2D3748' }}>{review.patientName || 'Anonymous'}</div>
                                            <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= review.rating ? '#F59E0B' : 'none'} color={s <= review.rating ? '#F59E0B' : '#D1D5DB'} />)}
                                        </div>
                                    </div>
                                    {review.feedback && <p style={{ margin: 0, color: '#475569', fontSize: '14px', fontStyle: 'italic' }}>"{review.feedback}"</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                            <Star size={40} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                            <p>No reviews yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;
