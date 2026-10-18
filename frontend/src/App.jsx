import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import InteractiveMap from './components/InteractiveMap';
import AIRecommendationPanel from './components/AIRecommendationPanel';
import IncidentQueueView from './components/IncidentQueueView';
import FleetHospitalView from './components/FleetHospitalView';
import BenchmarkView from './components/BenchmarkView';
import AlertsTicker from './components/AlertsTicker';

const API_BASE = 'http://localhost:8000/api/v1';
const WS_URL = 'ws://localhost:8000/ws/dispatch';

export default function App() {
  const [activeTab, setActiveTab] = useState('RADAR'); // 'RADAR', 'QUEUE', 'NETWORK', 'BENCHMARK'
  const [summary, setSummary] = useState({});
  const [ambulances, setAmbulances] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [trafficZones, setTrafficZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeRecommendation, setActiveRecommendation] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef(null);

  // Connect WebSocket for live telemetry streaming
  useEffect(() => {
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("[VectorVision WS] Connected");
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'INITIAL_STATE' || data.type === 'TICK') {
              if (data.summary) setSummary(data.summary);
              if (data.ambulances) setAmbulances(data.ambulances);
              if (data.incidents) {
                setIncidents(data.incidents);
                // Keep selected incident reference updated
                setSelectedIncident(prev => {
                  if (!prev) {
                    const firstPending = data.incidents.find(i => i.status === 'PENDING_DISPATCH');
                    return firstPending || data.incidents[0] || null;
                  }
                  return data.incidents.find(i => i.id === prev.id) || prev;
                });
              }
              if (data.hospitals) setHospitals(data.hospitals);
              if (data.traffic_zones) setTrafficZones(data.traffic_zones);
              if (data.alerts) setAlerts(data.alerts);
            }
          } catch (err) {
            console.error("[WS Message Parse Error]:", err);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 2500);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectWebSocket, 2500);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Fetch AI recommendation whenever selectedIncident changes
  useEffect(() => {
    if (!selectedIncident) {
      setActiveRecommendation(null);
      return;
    }

    fetch(`${API_BASE}/dispatch/recommendation/${selectedIncident.id}`)
      .then(res => {
        if (!res.ok) throw new Error("No active recommendation");
        return res.json();
      })
      .then(data => setActiveRecommendation(data))
      .catch(err => {
        console.log("Recommendation note:", err.message);
      });
  }, [selectedIncident?.id]);

  // Dispatch Action Handlers
  const handleApproveDispatch = async (incidentId, ambulanceId, hospitalId) => {
    try {
      const res = await fetch(`${API_BASE}/dispatch/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: incidentId,
          ambulance_id: ambulanceId,
          hospital_id: hospitalId,
          action: 'APPROVE',
          notes: 'Dispatcher approved AI recommendation'
        })
      });
      if (res.ok) {
        // Move selection to next pending call if available
        const nextPending = incidents.find(i => i.id !== incidentId && i.status === 'PENDING_DISPATCH');
        if (nextPending) {
          setSelectedIncident(nextPending);
        }
      }
    } catch (err) {
      console.error("Dispatch execution failed:", err);
    }
  };

  const handleModifyDispatch = async (incidentId, ambulanceId, hospitalId) => {
    try {
      await fetch(`${API_BASE}/dispatch/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: incidentId,
          ambulance_id: ambulanceId,
          hospital_id: hospitalId,
          action: 'MODIFY',
          notes: 'Dispatcher modified unit assignment'
        })
      });
    } catch (err) {
      console.error("Modify dispatch failed:", err);
    }
  };

  const handleTriggerEmergency = async () => {
    try {
      const res = await fetch(`${API_BASE}/incidents/spawn-demo`, { method: 'POST' });
      const newInc = await res.json();
      if (newInc) {
        setSelectedIncident(newInc);
      }
    } catch (err) {
      console.error("Failed to spawn emergency:", err);
    }
  };

  const handleTriggerTraffic = async () => {
    try {
      await fetch(`${API_BASE}/analytics/simulation/traffic-spike`, { method: 'POST' });
    } catch (err) {
      console.error("Failed to trigger traffic spike:", err);
    }
  };

  const handleToggleDivert = async (hospitalId = 'hosp-01') => {
    try {
      await fetch(`${API_BASE}/hospitals/${hospitalId}/toggle-divert`, { method: 'POST' });
    } catch (err) {
      console.error("Failed to toggle divert:", err);
    }
  };

  const handleSelectAndSwitchToMap = (incident) => {
    setSelectedIncident(incident);
    setActiveTab('RADAR');
  };

  const handleSelectNextIncident = () => {
    const nextPending = incidents.find(i => i.id !== selectedIncident?.id && i.status === 'PENDING_DISPATCH');
    if (nextPending) {
      setSelectedIncident(nextPending);
    }
  };

  const pendingCalls = incidents.filter(i => i.status === 'PENDING_DISPATCH');

  return (
    <div style={{ padding: '16px 20px', maxWidth: '1720px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Organized Navigation Header */}
      <Header 
        summary={summary}
        wsConnected={wsConnected}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onTriggerEmergency={handleTriggerEmergency}
        onTriggerTraffic={handleTriggerTraffic}
        onToggleDivert={() => handleToggleDivert('hosp-01')}
        incidentsCount={incidents.length}
      />

      {/* Main View Area Organized by Section */}
      <div style={{ flex: 1, minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        
        {/* SECTION 1: LIVE RADAR & DISPATCH */}
        {activeTab === 'RADAR' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            
            {/* Quick Call Switcher Bar if multiple pending calls */}
            {pendingCalls.length > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                overflowX: 'auto'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Pending Calls ({pendingCalls.length}):
                </span>
                {pendingCalls.map(inc => (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="btn-action"
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      background: selectedIncident?.id === inc.id ? 'rgba(6, 182, 212, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                      color: selectedIncident?.id === inc.id ? '#38BDF8' : '#94A3B8',
                      border: selectedIncident?.id === inc.id ? '1px solid #06B6D4' : '1px solid #334155',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {inc.code} - {inc.incident_type.split('-')[0]}
                  </button>
                ))}
              </div>
            )}

            {/* 2-Column Spacious Radar & Clean Action Panel */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: '16px',
              flex: 1
            }}>
              {/* Map */}
              <InteractiveMap 
                ambulances={ambulances}
                incidents={incidents}
                hospitals={hospitals}
                trafficZones={trafficZones}
                selectedIncident={selectedIncident}
                activeRecommendation={activeRecommendation}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
              />

              {/* Clean User-Friendly Action Panel (Zero AI Wall of Text) */}
              <AIRecommendationPanel 
                selectedIncident={selectedIncident}
                recommendation={activeRecommendation}
                onApproveDispatch={handleApproveDispatch}
                onModifyDispatch={handleModifyDispatch}
                onSelectNextIncident={handleSelectNextIncident}
                ambulances={ambulances}
                hospitals={hospitals}
              />
            </div>

          </div>
        )}

        {/* SECTION 2: INCIDENT CALL REGISTRY */}
        {activeTab === 'QUEUE' && (
          <IncidentQueueView 
            incidents={incidents}
            onSelectAndSwitchToMap={handleSelectAndSwitchToMap}
          />
        )}

        {/* SECTION 3: FLEET & HOSPITAL NETWORK */}
        {activeTab === 'NETWORK' && (
          <FleetHospitalView 
            ambulances={ambulances}
            hospitals={hospitals}
            onToggleDivert={handleToggleDivert}
          />
        )}

        {/* SECTION 4: ALGORITHMIC BENCHMARK */}
        {activeTab === 'BENCHMARK' && (
          <BenchmarkView />
        )}

      </div>

      {/* Bottom Live Alerts Ticker */}
      <AlertsTicker alerts={alerts} />

    </div>
  );
}
