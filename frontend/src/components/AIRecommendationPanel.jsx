import React, { useState } from 'react';
import { 
  Sparkles, Ambulance, Hospital, CheckCircle, 
  Clock, ShieldAlert, ArrowRight, UserCheck, X, Check, Edit3, Heart, Activity
} from 'lucide-react';

export default function AIRecommendationPanel({ 
  selectedIncident, 
  recommendation, 
  onApproveDispatch,
  onModifyDispatch,
  onSelectNextIncident,
  ambulances = [],
  hospitals = []
}) {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideAmbulanceId, setOverrideAmbulanceId] = useState('');
  const [overrideHospitalId, setOverrideHospitalId] = useState('');

  if (!selectedIncident) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(6, 182, 212, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <Sparkles size={28} color="#06B6D4" />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F1F5F9' }}>No Emergency Selected</h3>
        <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px', maxWidth: '240px' }}>
          Select an incoming emergency from the queue or radar map to review the AI dispatch recommendation.
        </p>
      </div>
    );
  }

  const isAlreadyDispatched = selectedIncident.status !== 'PENDING_DISPATCH';
  const isCritical = selectedIncident.severity === 1;

  return (
    <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#06B6D4" />
          <h2 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#F8FAFC' }}>
            Dispatch Console
          </h2>
        </div>
        {recommendation && (
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '6px',
            padding: '3px 10px',
            fontSize: '11px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)'
          }}>
            {Math.round(recommendation.confidence_score * 100)}% Match
          </span>
        )}
      </div>

      {/* Selected Call Summary Box */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: isCritical ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(245, 158, 11, 0.5)',
        borderRadius: '10px',
        padding: '12px 14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
            {selectedIncident.code}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span className={`badge ${selectedIncident.care_level_required === 'ALS' ? 'badge-als' : 'badge-bls'}`}>
              {selectedIncident.care_level_required}
            </span>
            <span className={`badge ${isCritical ? 'badge-critical' : 'badge-emergent'}`}>
              {isCritical ? 'P1 CRITICAL' : 'P2 EMERGENT'}
            </span>
          </div>
        </div>

        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>
          {selectedIncident.title}
        </div>
        <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
          📍 {selectedIncident.address}
        </div>

        {/* Patient Vitals Quick Bar */}
        {selectedIncident.vitals && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(51, 65, 85, 0.5)',
            fontSize: '11px',
            color: '#94A3B8'
          }}>
            <span>Age: <strong style={{ color: '#F1F5F9' }}>{selectedIncident.vitals.age}</strong></span>
            <span>HR: <strong style={{ color: selectedIncident.vitals.heart_rate > 120 ? '#EF4444' : '#10B981' }}>{selectedIncident.vitals.heart_rate}</strong></span>
            <span>SpO2: <strong style={{ color: selectedIncident.vitals.spo2 < 90 ? '#EF4444' : '#10B981' }}>{selectedIncident.vitals.spo2}%</strong></span>
            <span>BP: <strong style={{ color: '#F1F5F9' }}>{selectedIncident.vitals.systolic_bp}</strong></span>
          </div>
        )}
      </div>

      {/* Recommended Match Cards */}
      {recommendation ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Ambulance Card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.75)',
            border: '1.5px solid rgba(6, 182, 212, 0.5)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <img 
              src="/images/ambulance_als.jpg" 
              alt="ALS Ambulance" 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                flexShrink: 0
              }} 
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Ambulance size={16} color="#06B6D4" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#F8FAFC' }}>
                    {recommendation.recommended_ambulance.call_sign}
                  </span>
                </div>
                <span style={{
                  background: '#06B6D4',
                  color: '#090D16',
                  fontWeight: 800,
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '5px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  ETA {recommendation.ambulance_eta_minutes}m
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                Crew: {recommendation.recommended_ambulance.paramedic_crew?.slice(0, 1).join(', ')} • 12-Lead ECG
              </div>
            </div>
          </div>

          {/* Receiving Hospital Card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.75)',
            border: '1.5px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <img 
              src="/images/hospital_trauma.jpg" 
              alt="Trauma Hospital" 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                flexShrink: 0
              }} 
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Hospital size={16} color="#3B82F6" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#F8FAFC' }}>
                    {recommendation.recommended_hospital.name.split(' ')[0]} {recommendation.recommended_hospital.name.split(' ')[1]}
                  </span>
                </div>
                <span style={{
                  background: '#3B82F6',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '5px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  Transit {recommendation.hospital_transit_minutes}m
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                <span>Open ICU: <strong style={{ color: '#10B981' }}>{recommendation.recommended_hospital.available_icu_beds} Beds</strong></span>
                <span>Wait: <strong style={{ color: '#FCD34D' }}>{recommendation.recommended_hospital.er_wait_time_minutes}m</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Criteria Highlights */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
            <span className="feature-pill" style={{ color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
              ✓ Fastest Traffic Route
            </span>
            <span className="feature-pill" style={{ color: '#C084FC', borderColor: 'rgba(192, 132, 252, 0.4)' }}>
              ✓ ALS Paramedic Matched
            </span>
            <span className="feature-pill" style={{ color: '#34D399', borderColor: 'rgba(52, 211, 153, 0.4)' }}>
              ✓ Specialty ER Available
            </span>
          </div>

        </div>
      ) : null}

      {/* Prominent Action Buttons */}
      <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
        {isAlreadyDispatched ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
              color: '#6EE7B7',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={18} /> Unit Dispatched & Tracking Active
            </div>

            {onSelectNextIncident && (
              <button
                className="btn-action btn-secondary"
                style={{ width: '100%', padding: '10px' }}
                onClick={onSelectNextIncident}
              >
                Review Next Pending Call →
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Primary Large Approve Button */}
            <button
              className="btn-action btn-approve"
              style={{ width: '100%', padding: '14px', fontSize: '15px', letterSpacing: '0.02em' }}
              onClick={() => onApproveDispatch(
                selectedIncident.id, 
                recommendation.recommended_ambulance.id, 
                recommendation.recommended_hospital.id
              )}
            >
              <Check size={18} strokeWidth={3} /> Approve & Dispatch Unit
            </button>

            {/* Secondary Modify Button */}
            <button
              className="btn-action btn-secondary"
              style={{ width: '100%', padding: '10px', fontSize: '12.5px' }}
              onClick={() => {
                setOverrideAmbulanceId(recommendation?.recommended_ambulance?.id || '');
                setOverrideHospitalId(recommendation?.recommended_hospital?.id || '');
                setShowOverrideModal(true);
              }}
            >
              <Edit3 size={14} /> Change Unit or Hospital
            </button>
          </div>
        )}
      </div>

      {/* Manual Selection Modal */}
      {showOverrideModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{ width: '440px', padding: '22px', background: '#0F172A', border: '1px solid #38BDF8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC' }}>Manual Resource Selection</h3>
              <button 
                onClick={() => setShowOverrideModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Select Ambulance Unit:
              </label>
              <select 
                value={overrideAmbulanceId} 
                onChange={(e) => setOverrideAmbulanceId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1E293B',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#F8FAFC',
                  fontSize: '13px'
                }}
              >
                {ambulances.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.call_sign} ({a.type}) - Status: {a.status}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Select Destination Hospital:
              </label>
              <select 
                value={overrideHospitalId} 
                onChange={(e) => setOverrideHospitalId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1E293B',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#F8FAFC',
                  fontSize: '13px'
                }}
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} (ICU: {h.available_icu_beds}, {h.status})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                className="btn-action btn-secondary" 
                onClick={() => setShowOverrideModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-action btn-primary"
                onClick={() => {
                  onModifyDispatch(selectedIncident.id, overrideAmbulanceId, overrideHospitalId);
                  setShowOverrideModal(false);
                }}
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
