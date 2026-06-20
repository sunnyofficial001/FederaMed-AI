import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbs = pathnames.map((name, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
    const isLast = index === pathnames.length - 1;

    return { label, routeTo, isLast };
  });

  if (location.pathname === '/') return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-6" aria-label="Breadcrumb">
      <Link to="/" className="flex items-center hover:text-text-primary transition-colors">
        <Home size={16} />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.routeTo}>
          <ChevronRight size={16} className="text-border-default" />
          {crumb.isLast ? (
            <motion.span
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-medium text-text-primary"
            >
              {crumb.label}
            </motion.span>
          ) : (
            <Link
              to={crumb.routeTo}
              className="hover:text-text-primary transition-colors capitalize"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;