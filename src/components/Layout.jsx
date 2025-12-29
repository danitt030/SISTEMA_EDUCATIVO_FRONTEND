import React, { useState } from 'react';
import Navbar from './navs/Navbar';
import Sidebar from './navs/Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="layout">
            <Navbar toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;