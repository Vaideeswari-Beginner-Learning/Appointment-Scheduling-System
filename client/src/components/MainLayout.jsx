import React, { useState } from 'react';
import { Sidebar, TopNavbar } from '.';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="layout-wrapper" style={{ 
            display: 'flex', 
            height: '100vh', 
            width: '100%', 
            background: 'var(--bg-main)', 
            overflow: 'hidden' 
        }}>
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            
            <div className="main-content-area" style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                marginLeft: '280px', 
                height: '100vh', 
                overflow: 'hidden' 
            }}>
                <TopNavbar onMenuClick={toggleSidebar} />
                
                <main onClick={closeSidebar} className="scrollable-body" style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '32px',
                    position: 'relative'
                }}>
                    {children}
                    
                    <footer className="fixed-footer" style={{ marginTop: '40px' }}>
                        © 2026 Forge India Connect Pvt Ltd • Excellence in Enterprise Solutions
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
