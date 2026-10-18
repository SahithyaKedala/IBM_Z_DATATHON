import React from 'react';
import { Radio, AlertTriangle, Info, BellRing } from 'lucide-react';

export default function AlertsTicker({ alerts = [] }) {
  if (!alerts || alerts.length === 0) return null;

  const getAlertBadge = (level) => {
    switch (level) {
      case 'CRITICAL': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', icon: <AlertTriangle size={14} color="#EF4444" /> };
      case 'WARNING': return { bg: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', icon: <AlertTriangle size={14} color="#F59E0B" /> };
      default: return { bg: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', icon: <Info size={14} color="#38BDF8" /> };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '10px 16px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
        <BellRing size={16} color="#06B6D4" />
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Real-Time Dispatch Events:
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        flex: 1
      }}>
        {alerts.slice(0, 5).map(alert => {
          const badge = getAlertBadge(alert.level);
          return (
            <div 
              key={alert.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: `1px solid ${badge.color}40`,
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px'
              }}
            >
              {badge.icon}
              <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{alert.title}:</span>
              <span style={{ color: '#94A3B8' }}>{alert.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
