
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}) => {
  return (
    <motion.div 
      className={cn(
        "bg-card rounded-xl p-6 border border-border shadow-sm card-hover",
        className
      )}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          <div className="text-2xl font-bold">{value}</div>
          
          {trend && (
            <div className="flex items-center mt-1">
              <div 
                className={`
                  text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center
                  ${trend.positive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}
                `}
              >
                <span className="mr-1">
                  {trend.positive ? '↑' : '↓'}
                </span>
                {trend.value}%
              </div>
              {description && (
                <span className="text-xs text-muted-foreground ml-2">{description}</span>
              )}
            </div>
          )}
          
          {!trend && description && (
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
          )}
        </div>
        
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
