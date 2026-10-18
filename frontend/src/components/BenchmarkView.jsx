import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, ShieldCheck, RotateCcw } from 'lucide-react';

export default function BenchmarkView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBenchmark = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/analytics/benchmark')
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error("Benchmark fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBenchmark();
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={24} color="#06B6D4" />
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#F8FAFC' }}>
              VectorVision AI vs. Baseline Evaluation
            </h2>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              Comparative benchmark across 50 simulated emergency scenarios
            </p>
          </div>
        </div>

        <button 
          className="btn-action btn-secondary"
          onClick={fetchBenchmark}
          disabled={loading}
        >
          <RotateCcw size={14} /> {loading ? 'Running...' : 'Re-Run Benchmark'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
          <TrendingUp size={36} color="#06B6D4" style={{ margin: '0 auto 12px auto' }} />
          <p>Evaluating scenarios on multi-criteria engine...</p>
        </div>
      ) : data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
          
          {/* Key Metric Comparison Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                Average Response Time
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                  {data.metrics.mean_response_time_minutes.vectorvision_ai}m
                </span>
                <span style={{ fontSize: '16px', color: '#EF4444', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>
                  {data.metrics.mean_response_time_minutes.naive_baseline}m
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#38BDF8', fontWeight: 700, marginTop: '6px' }}>
                ⚡ {data.metrics.mean_response_time_minutes.improvement_pct}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                ALS Critical Care Match
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#C084FC', fontFamily: 'var(--font-mono)' }}>
                  {data.metrics.als_critical_care_accuracy.vectorvision_ai}
                </span>
                <span style={{ fontSize: '16px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                  vs {data.metrics.als_critical_care_accuracy.naive_baseline}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#A855F7', fontWeight: 700, marginTop: '6px' }}>
                Zero BLS units assigned to cardiac arrests
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                Specialty Surgical Facility
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#60A5FA', fontFamily: 'var(--font-mono)' }}>
                  {data.metrics.specialty_hospital_matching.vectorvision_ai}
                </span>
                <span style={{ fontSize: '16px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                  vs {data.metrics.specialty_hospital_matching.naive_baseline}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 700, marginTop: '6px' }}>
                Cath Lab, Stroke & Trauma Alignment
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                Hospital Divert Avoidance
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                  {data.metrics.divert_congestion_avoidance.vectorvision_ai}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#34D399', fontWeight: 700, marginTop: '6px' }}>
                Zero ambulance turnaround rejections
              </div>
            </div>

          </div>

          {/* IBM LinuxONE Infrastructure Banner */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '18px'
          }}>
            <img 
              src="/images/linuxone_rack.jpg" 
              alt="IBM LinuxONE Mainframe" 
              style={{
                width: '200px',
                height: '110px',
                objectFit: 'cover',
                flexShrink: 0
              }} 
            />
            <div style={{ padding: '12px 18px 12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#38BDF8' }}>
                  IBM LinuxONE Emperor 4 Architecture
                </span>
                <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#67E8F9' }}>
                  s390x Multi-Arch
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '4px', lineHeight: '1.4' }}>
                Delivering microsecond triage scoring, real-time combinatorial vehicle routing, and CPACF hardware-accelerated data security during citywide mass-casualty surges.
              </p>
            </div>
          </div>

          {/* Key Findings Card */}
          <div style={{ background: 'rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.4)', borderRadius: '10px', padding: '16px', fontSize: '13px', color: '#E2E8F0', lineHeight: '1.6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#38BDF8', marginBottom: '6px' }}>
              <ShieldCheck size={18} /> Evaluation Conclusion:
            </div>
            {data.conclusion}
          </div>

        </div>
      ) : null}

    </div>
  );
}
