import React from 'react';
import { Ambulance, Hospital, Activity, Shield, Fuel, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function FleetHospitalView({ ambulances = [], hospitals = [], onToggleDivert }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '100%' }}>
      
      {/* Left Column: Ambulance Fleet */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ambulance size={20} color="#06B6D4" />
            <h2 style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ambulance Fleet Status ({ambulances.length} Units)
            </h2>
          </div>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {ambulances.filter(a => a.status === 'AVAILABLE').length} Available
          </span>
        </div>

        {/* Hero Fleet Visual Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '16px',
          height: '110px',
          border: '1px solid rgba(6, 182, 212, 0.4)'
        }}>
          <img 
            src="/images/ambulance_als.jpg" 
            alt="Ambulance Fleet" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px 12px',
            background: 'linear-gradient(to top, rgba(7, 11, 20, 0.9) 0%, transparent 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#38BDF8' }}>
              Paramedic Quick-Response Fleet
            </span>
            <span style={{ fontSize: '10.5px', color: '#CBD5E1' }}>
              ALS & BLS Certified
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {ambulances.map(amb => {
            const isAvail = amb.status === 'AVAILABLE';
            const isALS = amb.type === 'ALS';

            return (
              <div 
                key={amb.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: isAvail ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(6, 182, 212, 0.45)',
                  borderRadius: '10px',
                  padding: '12px 14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#F8FAFC' }}>
                      {amb.call_sign}
                    </span>
                    <span className={`badge ${isALS ? 'badge-als' : 'badge-bls'}`}>
                      {amb.type}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isAvail ? '#10B981' : '#06B6D4',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {amb.status}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  <span>Crew: <strong style={{ color: '#E2E8F0' }}>{amb.paramedic_crew?.join(', ') || 'Paramedic Unit'}</strong></span>
                  <span>Fuel: <strong style={{ color: amb.fuel_level < 30 ? '#EF4444' : '#10B981' }}>{amb.fuel_level}%</strong></span>
                </div>

                <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '6px' }}>
                  Kit: {amb.equipment?.slice(0, 3).join(' • ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Hospital Facilities */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Hospital size={20} color="#3B82F6" />
            <h2 style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Hospital Receiving Facilities ({hospitals.length})
            </h2>
          </div>
          <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            Live Bed Telemetry
          </span>
        </div>

        {/* Hero Hospital Visual Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '16px',
          height: '110px',
          border: '1px solid rgba(59, 130, 246, 0.4)'
        }}>
          <img 
            src="/images/hospital_trauma.jpg" 
            alt="Hospital Facilities" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px 12px',
            background: 'linear-gradient(to top, rgba(7, 11, 20, 0.9) 0%, transparent 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#60A5FA' }}>
              Emergency Departments & Surgical Suites
            </span>
            <span style={{ fontSize: '10.5px', color: '#CBD5E1' }}>
              Real-Time ICU Tracking
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {hospitals.map(hosp => {
            const isDivert = hosp.status === 'DIVERT';

            return (
              <div 
                key={hosp.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: isDivert ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '10px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#F8FAFC' }}>
                      {hosp.name}
                    </h3>
                    <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                      📍 {hosp.address}
                    </p>
                  </div>
                  
                  {/* Status Toggle Button */}
                  <button
                    className={`btn-action ${isDivert ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={() => onToggleDivert(hosp.id)}
                    title="Toggle emergency diversion status"
                  >
                    {isDivert ? 'DIVERT ACTIVE' : 'SET DIVERT'}
                  </button>
                </div>

                {/* Capacity Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '8px', padding: '8px 10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '6px', fontSize: '11px' }}>
                  <div>
                    <div style={{ color: '#64748B' }}>ICU Beds</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: hosp.available_icu_beds > 2 ? '#10B981' : '#EF4444', fontFamily: 'var(--font-mono)' }}>
                      {hosp.available_icu_beds} <span style={{ fontSize: '10px', color: '#64748B' }}>/ {hosp.total_icu_beds}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748B' }}>ER Wait</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FCD34D', fontFamily: 'var(--font-mono)' }}>
                      {hosp.er_wait_time_minutes} min
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748B' }}>Occupancy</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: hosp.occupancy_rate > 0.9 ? '#EF4444' : '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                      {Math.round(hosp.occupancy_rate * 100)}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                  {hosp.specialties?.map((spec, i) => (
                    <span key={i} className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD', fontSize: '10px' }}>
                      {spec.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
