import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    ChevronLeft, 
    ChevronRight,
    Plus, 
    Calendar as CalendarIcon, 
    Clock, 
    ExternalLink,
    User,
    X,
    Video,
    CheckCircle,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const CalendarPage = () => {
    const { user } = useAuth();
    const [view, setView] = useState('month');
    const [appointments, setAppointments] = useState([]);
    const [showNewEvent, setShowNewEvent] = useState(false);
    const [activeMeeting, setActiveMeeting] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [newSlotForm, setNewSlotForm] = useState({ date: '', startTime: '' });
    const [slotLoading, setSlotLoading] = useState(false);
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(API_BASE_URL + '/appointments/my-appointments', {
                headers: { 'x-auth-token': token }
            });
            setAppointments(res.data);
        } catch (err) { console.error(err); }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        if (!isAdmin) { alert('Only admins can create availability slots.'); return; }
        setSlotLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(API_BASE_URL + '/slots', newSlotForm, {
                headers: { 'x-auth-token': token }
            });
            alert('Slot created! Candidates can now book this time.');
            setShowNewEvent(false);
            setNewSlotForm({ date: '', startTime: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create slot');
        } finally { setSlotLoading(false); }
    };

    // Build calendar grid for current month
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getAppointmentsForDay = (day) => {
        return appointments.filter(a => {
            if (!a.slotId?.date) return false;
            const d = new Date(a.slotId.date);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });
    };

    const todayAppointments = appointments.filter(a => {
        if (!a.slotId?.date) return false;
        return new Date(a.slotId.date).toDateString() === today.toDateString();
    });

    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    return (
        <div className="calendar-page">
            {/* --- MODAL: NEW EVENT / SLOT --- */}
            {showNewEvent && (
                <div onClick={() => setShowNewEvent(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div onClick={e => e.stopPropagation()} className="data-card" style={{ maxWidth: '440px', width: '100%', padding: '36px', animation: 'fadeIn 0.2s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0 }}>
                                {isAdmin ? '+ Create Availability Slot' : 'Calendar: New Event Info'}
                            </h3>
                            <button onClick={() => setShowNewEvent(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
                        </div>

                        {isAdmin ? (
                            <form onSubmit={handleCreateSlot} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                                    Create an availability slot that candidates can book.
                                </p>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input type="date" className="input-field"
                                        value={newSlotForm.date}
                                        onChange={e => setNewSlotForm({ ...newSlotForm, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input type="time" className="input-field"
                                        value={newSlotForm.startTime}
                                        onChange={e => setNewSlotForm({ ...newSlotForm, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ height: '48px' }} disabled={slotLoading}>
                                    {slotLoading ? 'Creating...' : 'Deploy Slot'}
                                </button>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <CalendarIcon size={48} color="var(--primary)" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.6 }} />
                                <h4 style={{ marginBottom: '8px' }}>Book an Appointment</h4>
                                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
                                    To schedule a new session, go to <b>Book Session</b> from the sidebar.
                                </p>
                                <a href="/book" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                                    Go to Booking <ArrowRight size={16} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ APPOINTMENT DETAILS ═══ */}
            {activeMeeting && (
                <div onClick={() => setActiveMeeting(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div onClick={e => e.stopPropagation()} className="data-card" style={{ maxWidth: '420px', width: '100%', padding: '40px', textAlign: 'center' }}>
                        <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', borderRadius: '20px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 20px -5px rgba(59,130,246,0.5)' }}>
                            <Video size={32} />
                        </div>
                        <h3 style={{ marginBottom: '8px' }}>Join Your Session</h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>Your virtual room is ready. Click below to join.</p>
                        <a href={activeMeeting} target="_blank" rel="noreferrer" className="btn btn-primary"
                            style={{ width: '100%', height: '48px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Enter Meeting Room <ArrowRight size={16} />
                        </a>
                        <button className="btn btn-ghost" style={{ marginTop: '12px', width: '100%' }} onClick={() => setActiveMeeting(null)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* ═══ EVENT CLICK HANDLER ═══ */}
            <header className="flex-between" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900 }}>Session <span style={{ color: 'var(--primary)' }}>Calendar</span></h1>
                    <p style={{ color: 'var(--text-gray)', fontWeight: 600 }}>Navigate your schedule and optimize your time.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {/* Month Nav */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '8px 16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={18} color="#64748B" /></button>
                        <span style={{ fontWeight: 800, fontSize: '14px', minWidth: '140px', textAlign: 'center' }}>{monthName}</span>
                        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><ChevronRight size={18} color="#64748B" /></button>
                    </div>
                    {/* View Toggle */}
                    <div style={{ display: 'flex', background: 'white', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '4px' }}>
                        <button className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('month')} style={{ padding: '8px 18px', fontSize: '12px' }}>Month</button>
                        <button className={`btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('week')} style={{ padding: '8px 18px', fontSize: '12px' }}>Week</button>
                    </div>
                    {/* New Event Button */}
                    <button className="btn btn-primary" onClick={() => setShowNewEvent(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> New Event
                    </button>
                </div>
            </header>

            <div className="booking-grid">
                {/* --- CALENDAR GRID --- */}
                <div className="calendar-wrapper">
                    {/* Day Headers */}
                    <div className="grid-7">
                        {days.map(d => (
                            <div key={d} className="calendar-header-cell">{d}</div>
                        ))}
                    </div>
                    {/* Grid Cells */}
                    <div className="grid-7">
                        {/* Empty cells before first day */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="calendar-cell" style={{ opacity: 0.2 }} />
                        ))}
                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                            const dayAppts = getAppointmentsForDay(day);
                            return (
                                <div key={day} className="calendar-cell" style={{ position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{
                                            width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            borderRadius: '8px', fontSize: '12px', fontWeight: 900,
                                            background: isToday ? 'var(--primary)' : 'transparent',
                                            color: isToday ? 'white' : 'var(--text-light)'
                                        }}>{day}</span>
                                    </div>
                                    <div className="appointments-list">
                                        {dayAppts.slice(0, 2).map((a, idx) => (
                                            <div key={idx} className={`calendar-item calendar-item-${a.type}`}
                                                style={{ cursor: a.meetingLink ? 'pointer' : 'default' }}
                                                onClick={() => a.meetingLink && setActiveMeeting(a.meetingLink)}>
                                                <div style={{ opacity: 0.8, fontSize: '9px' }}>{a.slotId?.startTime}</div>
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}>
                                                    {a.purpose || a.userId?.name || a.type}
                                                </div>
                                            </div>
                                        ))}
                                        {dayAppts.length > 2 && (
                                            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>+{dayAppts.length - 2} more</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- SIDEBAR --- */}
                <div className="calendar-sidebar">
                    {/* Today's Appointments */}
                    <div className="event-sidebar-card">
                        <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px' }}>Upcoming Today</h3>
                        {todayAppointments.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {todayAppointments.map((a, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                                            <div style={{ width: '4px', background: 'var(--primary)', borderRadius: '2px', flexShrink: 0 }} />
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-light)', textTransform: 'uppercase' }}>{a.slotId?.startTime}</p>
                                                <h4 style={{ fontSize: '15px', fontWeight: 900, margin: '2px 0' }}>{a.purpose || `${a.type} Session`}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                                    <div style={{ width: '20px', height: '20px', background: 'var(--bg-light)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <User size={10} color="var(--text-light)" />
                                                    </div>
                                                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-gray)' }}>
                                                        {a.adminId?.name || 'Assigned Expert'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {a.meetingLink ? (
                                            <button className="btn btn-primary" style={{ width: '100%', height: '42px', fontSize: '13px' }}
                                                onClick={() => setActiveMeeting(a.meetingLink)}>
                                                Join Call Now
                                            </button>
                                        ) : (
                                            <div style={{ padding: '10px', background: 'var(--bg-light)', borderRadius: '10px', textAlign: 'center', fontSize: '11px', color: 'var(--text-light)', fontWeight: 700 }}>
                                                Meeting link will be shared soon
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <CalendarIcon size={32} color="var(--text-light)" style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
                                <p style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 600 }}>No sessions today</p>
                            </div>
                        )}
                    </div>

                    {/* Calendar Sync Card */}
                    <div style={{ marginTop: '24px', background: 'linear-gradient(135deg, #1E1B4B 0%, #1E3A8A 100%)', padding: '28px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.08 }}><ExternalLink size={80} fill="white" /></div>
                        <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '8px' }}>Calendar Sync</h3>
                        <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '20px', lineHeight: 1.5 }}>
                            Connect your external calendars to sync all your sessions automatically.
                        </p>
                        <button className="btn" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', width: '100%', border: '1px solid rgba(255,255,255,0.2)', fontSize: '13px' }}>
                            Configure Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
