import React from 'react';
import { AlertCircle, Clock, Heart, Activity, CheckCircle2 } from 'lucide-react';

export default function IncidentQueue({ incidents = [], selectedIncident, onSelectIncident }) {
  const pendingIncidents = incidents.filter(i => i.status === 'PENDING_DISPATCH');
  const activeMissions = incidents.filter(i => i.status !== 'PENDING_DISPATCH' && i.status !== 'RESOLVED');

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 1: return 'badge-critical';
      case 2: return 'badge-emergent';
      case 3: return 'badge-urgent';
      default: return 'badge-stable';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 1: return 'P1 CRITICAL';
      case 2: return 'P2 EMERGENT';
      case 3: return 'P3 URGENT';
      default: return 'P4 MINOR';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={17} color="#EF4444" />
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Dispatch Incident Queue
          </h2>
        </div>
        <span style={{ 
          background: 'rgba(239, 68, 68, 0.2)', 
          color: '#F87171', 
          padding: '2px 8px', 
          borderRadius: '10px', 
          fontSize: '11px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)'
        }}>
          {pendingIncidents.length} Pending
        </span>
      </div>

      {/* Incidents List Container */}
      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {pendingIncidents.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '24px 12px', 
            color: '#64748B', 
            background: 'rgba(15, 23, 42, 0.4)', 
            borderRadius: '8px',
            border: '1px dashed #334155'
          }}>
            <CheckCircle2 size={24} color="#10B981" style={{ margin: '0 auto 8px auto', display: 'block' }} />
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>All Emergency Calls Dispatched</p>
            <p style={{ fontSize: '11px', marginTop: '4px' }}>Awaiting new 911 telemetry inputs.</p>
          </div>
        )}

        {pendingIncidents.map(inc => {
          const isSelected = selectedIncident && selectedIncident.id === inc.id;

          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              style={{
                background: isSelected ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.65)',
                border: isSelected ? '1.5px solid #06B6D4' : '1px solid rgba(51, 65, 85, 0.6)',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 0 16px rgba(6, 182, 212, 0.25)' : 'none'
              }}
            >
              {/* Row 1: Code and Severity */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38BDF8' }}>
                  {inc.code}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={`badge ${inc.care_level_required === 'ALS' ? 'badge-als' : 'badge-bls'}`}>
                    {inc.care_level_required}
                  </span>
                  <span className={`badge ${getSeverityBadgeClass(inc.severity)}`}>
                    {getSeverityLabel(inc.severity)}
                  </span>
                </div>
              </div>

              {/* Title & Address */}
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', marginBottom: '4px' }}>
                {inc.title}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
                📍 {inc.address}
              </div>

              {/* Patient Vitals Preview */}
              {inc.vitals && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '10.5px',
                  color: '#CBD5E1',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <span>Age: {inc.vitals.age}</span>
                  <span>•</span>
                  <span>HR: <strong style={{ color: inc.vitals.heart_rate > 120 ? '#EF4444' : '#38BDF8' }}>{inc.vitals.heart_rate}</strong></span>
                  <span>•</span>
                  <span>SpO2: <strong style={{ color: inc.vitals.spo2 < 90 ? '#EF4444' : '#10B981' }}>{inc.vitals.spo2}%</strong></span>
                  <span>•</span>
                  <span>BP: {inc.vitals.systolic_bp}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Active In-Progress Missions Section */}
        {activeMissions.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
              Active Missions ({activeMissions.length})
            </div>
            {activeMissions.map(inc => (
              <div 
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                style={{
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid #1E293B',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  marginBottom: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ color: '#38BDF8', fontWeight: 700, fontFamily: 'var(--font-mono)', marginRight: '6px' }}>
                    {inc.code}
                  </span>
                  <span style={{ color: '#94A3B8' }}>{inc.incident_type.split('-')[0]}</span>
                </div>
                <span style={{ 
                  color: inc.status === 'EN_ROUTE' ? '#06B6D4' : '#F59E0B', 
                  fontWeight: 600,
                  fontSize: '10px'
                }}>
                  {inc.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
