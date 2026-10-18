import React from 'react';
import { 
  Activity, Cpu, Radio, AlertTriangle, 
  Hospital as HospitalIcon, Zap, BarChart3, Map, ListFilter, Users
} from 'lucide-react';

export default function Header({ 
  summary, 
  wsConnected, 
  activeTab,
  onTabChange,
  onTriggerEmergency, 
  onTriggerTraffic, 
  onToggleDivert,
  incidentsCount = 0
}) {
  return (
    <header className="glass-panel" style={{ padding: '14px 20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & LinuxONE Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284C7, #4F46E5)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(2, 132, 199, 0.5)'
          }}>
            <Activity color="#fff" size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
                VECTOR<span style={{ color: '#06B6D4' }}>VISION</span>
              </h1>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#38BDF8',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Cpu size={12} /> IBM LinuxONE s390x
              </span>
            </div>
          </div>
        </div>

        {/* Organized Navigation Sections (Tabs) */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid rgba(51, 65, 85, 0.6)',
          gap: '4px'
        }}>
          <button 
            className={`nav-tab-btn ${activeTab === 'RADAR' ? 'active' : ''}`}
            onClick={() => onTabChange('RADAR')}
          >
            <Map size={15} /> Live Dispatch Radar
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'QUEUE' ? 'active' : ''}`}
            onClick={() => onTabChange('QUEUE')}
          >
            <ListFilter size={15} /> Call Registry ({incidentsCount})
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'NETWORK' ? 'active' : ''}`}
            onClick={() => onTabChange('NETWORK')}
          >
            <Users size={15} /> Fleet & Hospitals
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'BENCHMARK' ? 'active' : ''}`}
            onClick={() => onTabChange('BENCHMARK')}
          >
            <BarChart3 size={15} /> AI Benchmark
          </button>
        </div>

        {/* Quick Simulation Trigger Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn-action btn-primary"
            onClick={onTriggerEmergency}
            title="Spawn new incoming 911 emergency"
          >
            <Zap size={15} /> + New Emergency
          </button>
          
          <button 
            className="btn-action btn-secondary"
            onClick={onTriggerTraffic}
            title="Simulate sudden traffic bottleneck"
          >
            <AlertTriangle size={15} color="#F59E0B" /> FDR Gridlock
          </button>

          <button 
            className="btn-action btn-secondary"
            onClick={onToggleDivert}
            title="Toggle Metro Central Hospital divert status"
          >
            <HospitalIcon size={15} color="#EF4444" /> Toggle Divert
          </button>
        </div>

      </div>
    </header>
  );
}
