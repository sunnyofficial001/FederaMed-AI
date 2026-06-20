import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Breadcrumbs from './Breadcrumbs';
import { motion } from 'framer-motion';

const EnterpriseLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-[280px] transition-all duration-300">
        {/* Top Header */}
        <Topbar />

        {/* Scrollable Page Content */}
        <main className="flex-1 pt-20 pb-12 px-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnterpriseLayout;