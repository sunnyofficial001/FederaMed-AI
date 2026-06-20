import React from 'react';
import { Bell, Search, UserCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const Topbar: React.FC = () => {
  return (
    <header className="h-16 bg-bg-surface/80 backdrop-blur-md border-b border-border-default fixed top-0 right-0 left-0 z-30 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" 
            size={18} 
          />
          <input
            type="text"
            placeholder="Search models, hospitals, logs..."
            className="w-full bg-bg-main border border-border-default rounded-full pl-10 pr-4 py-1.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            aria-label="Global Search"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono text-text-muted bg-bg-surface border border-border-default rounded">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-6">
        {/* Alerts */}
        <button className="relative p-2 text-text-muted hover:text-text-primary transition-colors" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-bg-surface" />
        </button>
        
        {/* System Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-900/20 border border-green-800/50 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-green-400">System Healthy</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border-default">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-primary">Dr. A. Smith</p>
            <p className="text-xs text-text-muted">Chief Data Officer</p>
          </div>
          <UserCircle size={36} className="text-text-secondary" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;