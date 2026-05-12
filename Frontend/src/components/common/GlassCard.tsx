import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  delay?: number;
  headerAction?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  title,
  subtitle,
  icon,
  className = '', 
  hoverable = true,
  delay = 0,
  headerAction
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverable ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={`
        relative overflow-hidden
        bg-[var(--admin-card)] backdrop-blur-xl
        border border-[var(--admin-card-border)]
        rounded-[2rem] shadow-2xl
        text-[var(--admin-text-primary)] group
        ${className}
      `}

    >
      {/* Background Glows */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] pointer-events-none group-hover:bg-blue-500/20 transition-colors" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
      
      <div className="relative z-10 p-8">
        {(title || icon || headerAction) && (
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              {icon && <div className="p-3 bg-white/5 rounded-2xl text-accent border border-white/10">{icon}</div>}
              <div>
                {title && <h3 className="text-xl font-bold tracking-tight">{title}</h3>}
                {subtitle && <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
              </div>
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
};
