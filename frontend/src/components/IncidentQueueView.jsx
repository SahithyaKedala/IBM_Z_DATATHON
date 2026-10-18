import React, { useState } from 'react';
import { AlertCircle, Clock, Zap, CheckCircle2, ChevronRight, Activity, Filter } from 'lucide-react';

export default function IncidentQueueView({ incidents = [], onSelectAndSwitchToMap }) {
  const [filter, setFilter] = useState('ALL');

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'PENDING') return inc.status === 'PENDING_DISPATCH';
    if (filter === 'ACTIVE') return inc.status !== 'PENDING_DISPATCH' && inc.status !== 'RESOLVED';
    if (filter === 'CRITICAL') return inc.severity === 1;
    return true;
  });

  return (
    <div className="glass-panel" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header and Filter Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} color="#EF4444" />
          <h2 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Emergency Incidents Call Registry
          </h2>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ALL', label: `All (${incidents.length})` },
            { id: 'PENDING', label: `Pending (${incidents.filter(i => i.status === 'PENDING_DISPATCH').length})` },
            { id: 'CRITICAL', label: `Critical P1 (${incidents.filter(i => i.severity === 1).length})` },
            { id: 'ACTIVE', label: `Active Missions (${incidents.filter(i => i.status !== 'PENDING_DISPATCH' && i.status !== 'RESOLVED').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className="btn-action"
              style={{
                padding: '6px 12px',
                fontSize: '11.5px',
                background: filter === tab.id ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                color: filter === tab.id ? '#38BDF8' : '#94A3B8',
                border: filter === tab.id ? '1px solid #06B6D4' : '1px solid #334155'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Incidents */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
        {filteredIncidents.map(inc => {
          const isPending = inc.status === 'PENDING_DISPATCH';
          const isCritical = inc.severity === 1;

          return (
            <div
              key={inc.id}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: isCritical ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(51, 65, 85, 0.6)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                    {inc.code}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={`badge ${inc.care_level_required === 'ALS' ? 'badge-als' : 'badge-bls'}`}>
                      {inc.care_level_required}
                    </span>
                    <span className={`badge ${isCritical ? 'badge-critical' : 'badge-emergent'}`}>
                      {isCritical ? 'P1 CRITICAL' : 'P2 EMERGENT'}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>
                  {inc.title}
                </h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
                  📍 {inc.address}
                </p>

                {inc.vitals && (
                  <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#CBD5E1', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px' }}>
                    <span>Age: <strong>{inc.vitals.age}</strong></span>
                    <span>HR: <strong style={{ color: inc.vitals.heart_rate > 120 ? '#EF4444' : '#10B981' }}>{inc.vitals.heart_rate}</strong></span>
                    <span>SpO2: <strong style={{ color: inc.vitals.spo2 < 90 ? '#EF4444' : '#10B981' }}>{inc.vitals.spo2}%</strong></span>
                    <span>BP: <strong>{inc.vitals.systolic_bp}</strong></span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(51, 65, 85, 0.4)', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', color: isPending ? '#F59E0B' : '#06B6D4', fontWeight: 700 }}>
                  {isPending ? '• Awaiting Dispatch' : `• ${inc.status}`}
                </span>

                <button
                  className="btn-action btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => onSelectAndSwitchToMap(inc)}
                >
                  <Zap size={13} /> {isPending ? 'Dispatch On Radar' : 'Track on Radar'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
