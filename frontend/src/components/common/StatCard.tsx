import React from 'react';
import '../../styles/components/StatCard.css';

interface StatCardProps {
  count: number | string;
  label: string;
  countColor?: string; // Accepts a CSS variable like 'var(--color-indigo)'
}

export const StatCard: React.FC<StatCardProps> = ({ 
  count, 
  label, 
  countColor = 'var(--color-black)' 
}) => {
  return (
    <div className="stat-card">
      <span className="stat-count" style={{ color: countColor }}>
        {count}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
};