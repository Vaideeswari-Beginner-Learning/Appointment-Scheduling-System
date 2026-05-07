import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Bell } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            style={{ 
                                background: 'white', 
                                padding: '16px 24px', 
                                borderRadius: '16px', 
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                border: '1px solid #E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                minWidth: '300px'
                            }}
                        >
                            {toast.type === 'success' && <CheckCircle color="#10B981" size={20} />}
                            {toast.type === 'error' && <AlertCircle color="#EF4444" size={20} />}
                            {toast.type === 'info' && <Bell color="#3B82F6" size={20} />}
                            
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', flex: 1 }}>{toast.message}</span>
                            
                            <button 
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
