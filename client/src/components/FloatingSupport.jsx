import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FloatingSupport = () => {
    const { user } = useAuth();
    
    if (!user) return null;

    // Show WhatsApp only for Client, HR, Employee, Doctor, Service roles
    // Hide for Super Admin, System Admin, and End Users (Customers)
    const allowedRoles = ['client', 'hr', 'employee', 'doctor', 'service', 'interviewer'];
    const hideRoles = ['super-admin', 'admin', 'user'];
    
    const role = user.role?.toLowerCase();
    if (hideRoles.includes(role) || !allowedRoles.includes(role)) {
        return null;
    }

    const whatsappNumber = "919014169726"; // Forge India Connect Support
    const message = `Halo Forge Support! Saya ${user.name} dari ${user.organizationName || 'Organisasi saya'}. Saya butuh bantuan dengan dashboard saya.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '60px',
                height: '60px',
                backgroundColor: '#25D366',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
                zIndex: 1000,
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                textDecoration: 'none'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(37, 211, 102, 0.6)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.4)';
            }}
        >
            <MessageSquare size={30} color="white" />
            <div style={{
                position: 'absolute',
                right: '70px',
                background: 'white',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800,
                color: '#1F2937',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                pointerEvents: 'none',
                opacity: 0,
                transition: 'opacity 0.3s'
            }} className="support-tooltip">
                Hubungi Support
            </div>
            <style>{`
                a:hover .support-tooltip { opacity: 1 !important; }
            `}</style>
        </a>
    );
};

export default FloatingSupport;
