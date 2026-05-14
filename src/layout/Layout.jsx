import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileSidebarOpen]);

  // Add print event listeners to hide sidebar and header when printing
  useEffect(() => {
    const handleBeforePrint = () => {
      document.body.classList.add('printing');
    };

    const handleAfterPrint = () => {
      document.body.classList.remove('printing');
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  return (
    <div style={{ background: '#F5F5DC' }} className="print:bg-white">
      <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />

      {/* Desktop Sidebar — no isMobileOpen prop so it hits the desktop branch */}
      <Sidebar />

      {/* Mobile Sidebar Drawer — isMobileOpen defined so it hits the mobile drawer branch */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <main
        className={`lg:ml-72 mt-16 p-4 sm:p-6 lg:p-8 transition-all duration-300 print:p-0 print:m-0 ${
          isMobileSidebarOpen
            ? 'pointer-events-none opacity-50 lg:pointer-events-auto lg:opacity-100'
            : 'pointer-events-auto opacity-100'
        }`}
        style={{
          overflowY: isMobileSidebarOpen ? 'hidden' : 'auto',
          maxHeight: 'calc(100vh - 64px)',
          overflowX: 'hidden',
        }}
      >
        <div className="max-w-7xl mx-auto print:max-w-none print:mx-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;