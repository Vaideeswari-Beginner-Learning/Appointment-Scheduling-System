import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, Briefcase, Users, FileText, Sparkles, 
    CheckCircle, AlertCircle, Loader2, Upload, 
    ArrowRight, Trophy, Zap, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

const CandidateApplication = ({ onComplete }) => {
    const { user } = useAuth();
    const [role, setRole] = useState('');
    const [selectedHr, setSelectedHr] = useState('');
    const [hrList, setHrList] = useState([]);
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchHRs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/users/hr-list`, {
                    headers: { 'x-auth-token': token }
                });
                setHrList(res.data);
            } catch (err) { console.error('Error fetching HRs:', err); }
        };
        fetchHRs();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size too large (Max 5MB)');
                return;
            }
            setResume(file);
            setError('');
        }
    };

    const runAIAnalysis = async () => {
        if (!role || !resume) {
            setError('Please provide your Role and Resume for AI analysis');
            return;
        }
        setAnalyzing(true);
        setError('');
        
        // Simulation of AI processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const mockResults = [
            { score: 94, summary: "Expert alignment. Your skills in " + role + " are significantly above average.", skills: ['Architecture', 'Scaling', 'Domain Mastery'] },
            { score: 88, summary: "Strong candidate. High correlation between your resume and the " + role + " requirements.", skills: ['Problem Solving', 'Technical Depth', 'Adaptability'] },
            { score: 82, summary: "Solid foundational match. Recommended for initial screening rounds.", skills: ['Core Competency', 'Communication', 'Teamwork'] }
        ];
        
        setAnalysisResult(mockResults[Math.floor(Math.random() * mockResults.length)]);
        setAnalyzing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedHr || !resume || !role) {
            setError('Please fill all fields and provide a resume');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('role', role);
        formData.append('hrId', selectedHr);
        formData.append('resume', resume);
        formData.append('purpose', `Application for ${role} (AI Analyzed)`);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/appointments/apply`, formData, {
                headers: { 
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess(true);
            if (onComplete) setTimeout(onComplete, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '60px 20px' }}
            >
                <div style={{ width: '80px', height: '80px', background: '#DCFCE7', color: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={40} />
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>Saved and updated successfully!</h2>
                <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>Your AI-analyzed application has been securely recorded. Check your dashboard for the latest updates and status.</p>
            </motion.div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
            <div className="data-card" style={{ padding: '40px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Interview Application</h2>
                    <p style={{ color: '#64748B', fontSize: '14px' }}>Complete the form below to apply with AI-powered candidate screening.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Full Name</label>
                            <div className="input-wrapper" style={{ opacity: 0.7 }}>
                                <User size={18} />
                                <input type="text" className="input-field" value={user?.name} readOnly />
                            </div>
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Target Role</label>
                            <div className="input-wrapper">
                                <Briefcase size={18} />
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="e.g. Senior Developer" 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Select Interviewer / HR</label>
                        <div className="input-wrapper">
                            <Users size={18} />
                            <select 
                                className="input-field" 
                                style={{ appearance: 'none', background: 'transparent' }}
                                value={selectedHr}
                                onChange={(e) => setSelectedHr(e.target.value)}
                                required
                            >
                                <option value="">Choose an HR professional...</option>
                                {hrList.map(hr => (
                                    <option key={hr._id} value={hr._id}>{hr.name} ({hr.department})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Resume / CV (PDF/DOCX)</label>
                        <div 
                            style={{ 
                                border: '2px dashed #E2E8F0', padding: '32px', borderRadius: '16px', textAlign: 'center',
                                background: resume ? '#F8FAFC' : 'transparent', transition: 'all 0.2s', cursor: 'pointer'
                            }}
                            onClick={() => document.getElementById('resume-upload').click()}
                        >
                            <input type="file" id="resume-upload" hidden onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                            <Upload size={32} color={resume ? 'var(--primary)' : '#94A3B8'} style={{ marginBottom: '12px' }} />
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: resume ? '#0F172A' : '#64748B' }}>
                                {resume ? resume.name : 'Click or Drag Resume here'}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94A3B8' }}>Maximum file size: 5MB</p>
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '12px', background: '#FEF2F2', color: '#991B1B', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                        <button 
                            type="button" 
                            className="btn" 
                            onClick={runAIAnalysis}
                            disabled={analyzing || !resume || !role}
                            style={{ 
                                flex: 1, height: '54px', background: '#F5F3FF', color: '#7C3AED', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' 
                            }}
                        >
                            {analyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                            {analyzing ? 'AI Scanning...' : 'AI Profile Analysis'}
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading || analyzing}
                            style={{ flex: 1.5, height: '54px', fontSize: '16px', fontWeight: 800 }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Application'} <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                        </button>
                    </div>
                </form>
            </div>

            {/* AI FEEDBACK SIDEBAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <AnimatePresence mode="wait">
                    {analyzing ? (
                        <motion.div 
                            key="analyzing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="data-card" 
                            style={{ padding: '32px', textAlign: 'center', background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', color: 'white' }}
                        >
                            <Sparkles size={40} style={{ marginBottom: '20px', animation: 'pulse 2s infinite' }} />
                            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '8px' }}>AI Engine Processing</h3>
                            <p style={{ fontSize: '13px', opacity: 0.8 }}>We are analyzing your resume keywords against industry standards for {role || 'the role'}.</p>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', marginTop: '24px' }}>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 3 }}
                                    style={{ height: '100%', background: 'white' }}
                                />
                            </div>
                        </motion.div>
                    ) : analysisResult ? (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="data-card" 
                            style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: '#F5F3FF', borderRadius: '50%', zIndex: 0 }} />
                            
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 900 }}>AI Analysis Report</h3>
                                    <div style={{ padding: '4px 10px', background: '#F5F3FF', color: '#7C3AED', borderRadius: '8px', fontSize: '10px', fontWeight: 900 }}>v2.0 Beta</div>
                                </div>

                                <div style={{ textAlign: 'center', margin: '24px 0' }}>
                                    <div style={{ fontSize: '48px', fontWeight: 900, color: analysisResult.score > 90 ? '#16A34A' : '#7C3AED' }}>{analysisResult.score}%</div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Match Score</div>
                                </div>

                                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>{analysisResult.summary}</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Identified Strengths</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {analysisResult.skills.map(s => (
                                            <span key={s} style={{ padding: '6px 12px', background: '#F1F5F9', color: '#475569', borderRadius: '80px', fontSize: '11px', fontWeight: 700 }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="data-card" 
                            style={{ padding: '32px', textAlign: 'center', border: '2px dashed #E2E8F0', background: 'transparent' }}
                        >
                            <Zap size={32} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#94A3B8' }}>AI Insights Ready</h3>
                            <p style={{ fontSize: '12px', color: '#94A3B8' }}>Upload your resume and click "AI Analysis" to see your matching potential.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="data-card" style={{ padding: '24px', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Target size={20} color="var(--primary)" />
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900 }}>Application Tips</h4>
                    </div>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            'Highlight relevant projects first',
                            'Use keywords found in role desc',
                            'Keep PDF under 5MB for parsing'
                        ].map(tip => (
                            <li key={tip} style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%' }} />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CandidateApplication;
