import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, Clock, ShieldCheck, X, TrendingUp, Cpu } from 'lucide-react';

export default function BenchmarkModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '640px', maxWidth: '100%', padding: '24px', background: '#0F172A', border: '1px solid #38BDF8' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={22} color="#06B6D4" />
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#F8FAFC' }}>
                Algorithmic Performance Benchmark
              </h2>
              <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                VectorVision Multi-Criteria AI vs Naive Nearest-Unit Baseline (50 Simulated Scenarios)
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
            <TrendingUp size={32} color="#06B6D4" style={{ margin: '0 auto 12px auto', animation: 'spin 1s linear infinite' }} />
            <p>Running Monte Carlo emergency dispatch benchmark...</p>
          </div>
        ) : data ? (
          <div>
            {/* Metric Comparison Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              
              {/* Response Time Card */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Mean Emergency Response Time
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                    {data.metrics.mean_response_time_minutes.vectorvision_ai}m
                  </span>
                  <span style={{ fontSize: '14px', color: '#EF4444', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>
                    {data.metrics.mean_response_time_minutes.naive_baseline}m
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 600, marginTop: '4px' }}>
                  ⚡ {data.metrics.mean_response_time_minutes.improvement_pct}
                </div>
              </div>

              {/* ALS Match Rate Card */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Critical Care Equipment Match
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#C084FC', fontFamily: 'var(--font-mono)' }}>
                    {data.metrics.als_critical_care_accuracy.vectorvision_ai}
                  </span>
                  <span style={{ fontSize: '14px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                    vs {data.metrics.als_critical_care_accuracy.naive_baseline}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#A855F7', fontWeight: 600, marginTop: '4px' }}>
                  Prevents dispatching BLS units to cardiac arrests
                </div>
              </div>

              {/* Specialty Hospital Card */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Specialty Facility Alignment
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#60A5FA', fontFamily: 'var(--font-mono)' }}>
                    {data.metrics.specialty_hospital_matching.vectorvision_ai}
                  </span>
                  <span style={{ fontSize: '14px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                    vs {data.metrics.specialty_hospital_matching.naive_baseline}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 600, marginTop: '4px' }}>
                  Matches Cath Lab, Stroke & Trauma Level 1
                </div>
              </div>

              {/* Hospital Divert Avoidance */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Hospital Divert Avoidance
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                    {data.metrics.divert_congestion_avoidance.vectorvision_ai}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#34D399', fontWeight: 600, marginTop: '4px' }}>
                  Zero ambulance turnaround rejections
                </div>
              </div>

            </div>

            {/* Conclusion text */}
            <div style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#E2E8F0', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#38BDF8', marginBottom: '4px' }}>
                <ShieldCheck size={16} /> Key Finding:
              </div>
              {data.conclusion}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-action btn-secondary" onClick={onClose}>
            Close Benchmark
          </button>
        </div>

      </div>
    </div>
  );
}
