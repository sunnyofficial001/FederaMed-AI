import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Network, 
  ShieldCheck, 
  Activity, 
  Database, 
  Lock, 
  Terminal, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Command Center', icon: LayoutDashboard, path: '/' },
  { label: 'Network Ops', icon: Network, path: '/network' },
  { label: 'Model Governance', icon: ShieldCheck, path: '/governance' },
  { label: 'Privacy Intel', icon: Activity, path: '/privacy' },
  { label: 'Data Hub', icon: Database, path: '/data' },
  { label: 'Security Ops', icon: Lock, path: '/security' },
  { label: 'Observability', icon: Terminal, path: '/observability' },
];

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
      className="fixed left-0 top-0 h-full bg-bg-surface border-r border-border-default z-40 flex flex-col"
      aria-label="Main Navigation"
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-border-default">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="font-semibold text-text-primary whitespace-nowrap"
            >
              FederaMed AI
            </motion.span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 relative
                ${isActive 
                  ? 'bg-brand-primary/10 text-brand-primary' 
                  : 'text-text-secondary hover:bg-bg-surfaceHover hover:text-text-primary'
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-0 top-0 bottom-0 w-1 bg-brand-primary rounded-l-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border-default space-y-2">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-surfaceHover transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        
        {!isCollapsed && (
          <>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surfaceHover rounded-md transition-colors">
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;