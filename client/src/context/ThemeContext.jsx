import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : true; // Default to dark mode
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    const theme = {
        // Core Layout
        bg: isDarkMode ? '#011611' : '#FDFBF7',
        bgSecondary: isDarkMode ? '#022C22' : '#FAF9F6',
        
        // Specific Card Styles
        card: isDarkMode ? '#064E3B' : '#FFFFFF',
        cardBorder: isDarkMode ? 'rgba(217, 119, 6, 0.2)' : 'rgba(2, 44, 34, 0.1)',
        iconBg: isDarkMode ? 'rgba(217, 119, 6, 0.1)' : '#ECFDF5',
        iconColor: isDarkMode ? '#D97706' : '#065F46',
        text: isDarkMode ? '#F8FAFC' : '#0F172A',
        textMuted: isDarkMode ? '#94A3B8' : '#64748B',
        cardHover: isDarkMode ? '#085C46' : '#F0FDF4',
        cardGlow: isDarkMode ? 'rgba(217, 119, 6, 0.15)' : 'rgba(2, 44, 34, 0.05)',
        
        // Brand Colors
        primary: isDarkMode ? '#D97706' : '#022C22', 
        secondary: isDarkMode ? '#B76E79' : '#D97706',
        accent: isDarkMode ? '#D97706' : '#B76E79',
        
        // Compatibility Aliases
        border: isDarkMode ? 'rgba(217, 119, 6, 0.2)' : 'rgba(2, 44, 34, 0.1)',
        gray: isDarkMode ? '#94A3B8' : '#64748B',
        isDarkMode
    };


    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
