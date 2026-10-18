import React, { useState } from 'react';
import { Navigation, Plus, Minus, RotateCcw, X, Info } from 'lucide-react';

const BOUNDS = {
  minLat: 40.7000,
  maxLat: 40.8100,
  minLng: -74.0200,
  maxLng: -73.9300
};

export default function InteractiveMap({
  ambulances = [],
  incidents = [],
  hospitals = [],
  trafficZones = [],
  selectedIncident = null,
  activeRecommendation = null,
  onSelectIncident
}) {
  const [hoveredEntity, setHoveredEntity] = useState(null);

  const WIDTH = 860;
  const HEIGHT = 580;

  // Coordinate projection from (lat, lng) to canvas (x, y)
  const toXY = (lat, lng) => {
    const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * WIDTH;
    const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * HEIGHT;
    return { 
      x: Math.max(30, Math.min(WIDTH - 30, x)), 
      y: Math.max(30, Math.min(HEIGHT - 30, y)) 
    };
  };

  const getAmbulanceColor = (amb) => {
    switch (amb.status) {
      case 'AVAILABLE': return '#10B981'; // Emerald
      case 'EN_ROUTE': return '#06B6D4'; // Cyan
      case 'ON_SCENE': return '#F59E0B'; // Amber
      case 'TRANSPORTING': return '#A855F7'; // Purple
      default: return '#64748B';
    }
  };

  const getTrafficColor = (congestion) => {
    switch (congestion) {
      case 'SEVERE': return 'rgba(239, 68, 68, 0.28)';
      case 'HEAVY': return 'rgba(249, 115, 22, 0.22)';
      case 'MODERATE': return 'rgba(234, 179, 8, 0.16)';
      default: return 'rgba(16, 185, 129, 0.08)';
    }
  };

  // Build active route points
  let routePoints = [];
  if (selectedIncident) {
    let sourceAmbulance = null;
    let targetHospital = null;

    if (selectedIncident.assigned_ambulance_id) {
      sourceAmbulance = ambulances.find(a => a.id === selectedIncident.assigned_ambulance_id);
    } else if (activeRecommendation) {
      sourceAmbulance = activeRecommendation.recommended_ambulance;
    }

    if (selectedIncident.destination_hospital_id) {
      targetHospital = hospitals.find(h => h.id === selectedIncident.destination_hospital_id);
    } else if (activeRecommendation) {
      targetHospital = activeRecommendation.recommended_hospital;
    }

    if (sourceAmbulance) {
      const p1 = toXY(sourceAmbulance.lat, sourceAmbulance.lng);
      const p2 = toXY(selectedIncident.lat, selectedIncident.lng);
      routePoints.push(p1, p2);

      if (targetHospital) {
        const p3 = toXY(targetHospital.lat, targetHospital.lng);
        routePoints.push(p3);
      }
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '16px', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Map Sub-Header & Clean Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={16} color="#06B6D4" />
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#F8FAFC' }}>
            Metro Dispatch Radar
          </span>
          <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
            [Live GPS Coordinates]
          </span>
        </div>

        {/* Clean Badged Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px', color: '#94A3B8' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#EF4444' }}></span> Emergency Call
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10B981' }}></span> Available Unit
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#06B6D4' }}></span> En Route
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: '#3B82F6' }}></span> Hospital
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="map-canvas-container" style={{ flex: 1, minHeight: '520px' }}>
        <svg 
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`} 
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            <pattern id="streetGridMap" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(51, 65, 85, 0.2)" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Background Street Grid */}
          <rect width="100%" height="100%" fill="url(#streetGridMap)" />

          {/* Key Street Avenues */}
          <line x1="180" y1="0" x2="180" y2={HEIGHT} className="map-corridor-line" />
          <line x1="360" y1="0" x2="360" y2={HEIGHT} className="map-corridor-line" />
          <line x1="540" y1="0" x2="540" y2={HEIGHT} className="map-corridor-line" />
          <line x1="720" y1="0" x2="720" y2={HEIGHT} className="map-corridor-line" />
          
          <line x1="0" y1="145" x2={WIDTH} y2="145" className="map-corridor-line" />
          <line x1="0" y1="290" x2={WIDTH} y2="290" className="map-corridor-line" />
          <line x1="0" y1="435" x2={WIDTH} y2="435" className="map-corridor-line" />

          {/* FDR Expressway Arterial */}
          <path 
            d="M 720 0 Q 770 200 730 380 T 670 580" 
            fill="none" 
            stroke="rgba(56, 189, 248, 0.45)" 
            strokeWidth="3.5"
            strokeDasharray="6, 4"
          />
          <text x="735" y="70" fill="#38BDF8" fontSize="10" fontFamily="var(--font-mono)" opacity="0.7">
            FDR EXPRESSWAY
          </text>

          {/* Traffic Congestion Zones */}
          {trafficZones.map(zone => {
            const p1 = toXY(zone.lat_max, zone.lng_min);
            const p2 = toXY(zone.lat_min, zone.lng_max);
            const w = Math.abs(p2.x - p1.x);
            const h = Math.abs(p2.y - p1.y);

            return (
              <g key={zone.id}>
                <rect
                  x={p1.x}
                  y={p1.y}
                  width={w}
                  height={h}
                  fill={getTrafficColor(zone.congestion)}
                  stroke={zone.congestion === 'SEVERE' ? '#EF4444' : '#F59E0B'}
                  strokeWidth="1.2"
                  strokeDasharray="4, 3"
                  rx="6"
                />
                <text
                  x={p1.x + 8}
                  y={p1.y + 16}
                  fill={zone.congestion === 'SEVERE' ? '#FCA5A5' : '#FDE68A'}
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {zone.name.split(' ')[0]} ({zone.congestion})
                </text>
              </g>
            );
          })}

          {/* Active Route Dash Line */}
          {routePoints.length >= 2 && (
            <g>
              <line
                x1={routePoints[0].x}
                y1={routePoints[0].y}
                x2={routePoints[1].x}
                y2={routePoints[1].y}
                stroke="#06B6D4"
                strokeWidth="3.5"
                className="route-dash-animate"
              />
              {routePoints[2] && (
                <line
                  x1={routePoints[1].x}
                  y1={routePoints[1].y}
                  x2={routePoints[2].x}
                  y2={routePoints[2].y}
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeDasharray="6, 4"
                  opacity="0.85"
                />
              )}
            </g>
          )}

          {/* Hospitals */}
          {hospitals.map(hosp => {
            const { x, y } = toXY(hosp.lat, hosp.lng);
            const isDivert = hosp.status === 'DIVERT';

            return (
              <g 
                key={hosp.id} 
                transform={`translate(${x}, ${y})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredEntity({ type: 'hospital', data: hosp })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {/* Hospital Box */}
                <rect
                  x="-16"
                  y="-16"
                  width="32"
                  height="32"
                  rx="8"
                  fill={isDivert ? 'rgba(239, 68, 68, 0.4)' : 'rgba(30, 58, 138, 0.6)'}
                  stroke={isDivert ? '#EF4444' : '#3B82F6'}
                  strokeWidth="1.8"
                />
                <path
                  d="M -6 -2 H 6 V 2 H -6 Z M -2 -6 H 2 V 6 H -2 Z"
                  fill={isDivert ? '#EF4444' : '#93C5FD'}
                />
                {/* ICU Beds Indicator badge */}
                <circle 
                  cx="12" 
                  cy="-12" 
                  r="5" 
                  fill={hosp.available_icu_beds > 2 ? '#10B981' : '#EF4444'} 
                />
                <text
                  x="0"
                  y="26"
                  textAnchor="middle"
                  fill="#E2E8F0"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                >
                  {hosp.name.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Ambulances */}
          {ambulances.map(amb => {
            const { x, y } = toXY(amb.lat, amb.lng);
            const ambColor = getAmbulanceColor(amb);

            return (
              <g
                key={amb.id}
                transform={`translate(${x}, ${y})`}
                style={{ cursor: 'pointer', transition: 'transform 0.4s ease-out' }}
                onMouseEnter={() => setHoveredEntity({ type: 'ambulance', data: amb })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {/* Pulse Aura if moving */}
                {amb.status !== 'AVAILABLE' && (
                  <circle cx="0" cy="0" r="16" fill="rgba(6, 182, 212, 0.25)" className="pulse-cyan-beacon" />
                )}
                
                {/* Vehicle Marker */}
                <circle
                  cx="0"
                  cy="0"
                  r="10"
                  fill="#0F172A"
                  stroke={ambColor}
                  strokeWidth="2.5"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="4"
                  fill={ambColor}
                />
                
                {/* Compact Call Sign Tag */}
                <rect
                  x="-22"
                  y="-22"
                  width="44"
                  height="12"
                  rx="3"
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke={ambColor}
                  strokeWidth="0.8"
                />
                <text
                  x="0"
                  y="-13"
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="8"
                  fontWeight="800"
                  fontFamily="var(--font-mono)"
                >
                  {amb.call_sign.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Emergency Incidents */}
          {incidents.filter(i => i.status !== 'RESOLVED').map(inc => {
            const { x, y } = toXY(inc.lat, inc.lng);
            const isSelected = selectedIncident && selectedIncident.id === inc.id;
            const isCritical = inc.severity === 1;

            return (
              <g
                key={inc.id}
                transform={`translate(${x}, ${y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectIncident(inc)}
                onMouseEnter={() => setHoveredEntity({ type: 'incident', data: inc })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? "22" : "15"}
                  fill="none"
                  stroke={isCritical ? "#EF4444" : "#F59E0B"}
                  strokeWidth="2"
                  className="pulse-red-beacon"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="7"
                  fill={isCritical ? "#EF4444" : "#F59E0B"}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />

                {/* Call Code Tag */}
                <rect
                  x="-24"
                  y="12"
                  width="48"
                  height="14"
                  rx="4"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke={isSelected ? "#38BDF8" : (isCritical ? "#EF4444" : "#F59E0B")}
                  strokeWidth={isSelected ? "1.8" : "1"}
                />
                <text
                  x="0"
                  y="22"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="800"
                  fontFamily="var(--font-mono)"
                >
                  {inc.code}
                </text>
              </g>
            );
          })}

        </svg>

        {/* Hover / Entity Info Banner (Top Right, never blocks map center) */}
        {hoveredEntity && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #38BDF8',
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            fontSize: '12px',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            {hoveredEntity.type === 'ambulance' && (
              <div>
                <span style={{ fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                  {hoveredEntity.data.call_sign}
                </span>
                <div style={{ color: '#94A3B8', marginTop: '2px' }}>
                  Status: <strong style={{ color: '#F8FAFC' }}>{hoveredEntity.data.status}</strong> • Fuel: {hoveredEntity.data.fuel_level}%
                </div>
              </div>
            )}

            {hoveredEntity.type === 'hospital' && (
              <div>
                <span style={{ fontWeight: 800, color: '#60A5FA' }}>
                  {hoveredEntity.data.name}
                </span>
                <div style={{ color: '#94A3B8', marginTop: '2px' }}>
                  ICU Beds: <strong style={{ color: '#10B981' }}>{hoveredEntity.data.available_icu_beds} Open</strong> • Status: {hoveredEntity.data.status}
                </div>
              </div>
            )}

            {hoveredEntity.type === 'incident' && (
              <div>
                <span style={{ fontWeight: 800, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
                  {hoveredEntity.data.code}
                </span>: {hoveredEntity.data.title}
                <div style={{ color: '#94A3B8', marginTop: '2px' }}>
                  Acuity: Level {hoveredEntity.data.severity} • {hoveredEntity.data.care_level_required}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
