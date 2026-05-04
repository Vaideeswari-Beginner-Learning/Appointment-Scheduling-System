import React, { useState } from 'react';
import { Sidebar, TopNavbar } from '.';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className={`main-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            
            <div className="main-content">
                <TopNavbar onMenuClick={toggleSidebar} />
                <main className="dashboard-container" onClick={closeSidebar}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
