import React, { useState, useEffect } from 'react';
import { getHealthEntries, deleteHealthEntry } from '../services/api';

const moodEmoji = { Excellent: '😄', Good: '😊', Fair: '😐', Poor: '😔' };
const moodColor = { Excellent: 'var(--green)', Good: 'var(--primary)', Fair: 'var(--yellow)', Poor: 'var(--red)' };
const bmiColor = (b) => !b ? 'var(--text-muted)' : b < 18.5 ? 'var(--primary)' : b < 25 ? 'var(--green)' : b < 30 ? 'var(--yellow)' : 'var(--red)';
const bmiLabel = (b) => !b ? '' : b < 18.5 ? 'UW' : b < 25 ? 'NL' : b < 30 ? 'OW' : 'OB';

export default function History() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getHealthEntries()
      .then(res => setEntries(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteHealthEntry(id);
      setEntries(prev => prev.filter(e => e._id !== id));
      if (expanded === id) setExpanded(null);
    } catch { alert('Failed to delete entry'); }
    finally { setDeleting(null); }
  };

  const filtered = entries.filter(e => {
    const matchSearch = !search || new Date(e.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase().includes(search.toLowerCase()) || (e.notes || '').toLowerCase().includes(search.toLowerCase()) || (e.mood || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || e.mood === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
      <div style={{ width: '50px', height: '50px', border: '3px solid rgba(0,200,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>LOADING RECORDS...</p>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: '2rem' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: '6px' }}>◷ HEALTH LOG ARCHIVE</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em' }}>ENTRY <span style={{ color: 'var(--purple)' }}>HISTORY</span></h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.88rem' }}>{entries.length} total entries recorded</p>
      </div>

      {/* Search & Filter */}
      <div className="animate-fadeUp-1" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px' }}>⌕</span>
          <input
            type="text" placeholder="Search entries..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px 11px 38px',
              background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(0,200,255,0.12)',
              borderRadius: '10px', color: 'var(--text)', fontSize: '0.88rem',
              outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--sans)'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'Excellent', 'Good', 'Fair', 'Poor'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'var(--mono)', fontSize: '0.62rem', letterSpacing: '0.05em',
              border: `1px solid ${filter === f ? 'rgba(0,200,255,0.4)' : 'rgba(0,200,255,0.1)'}`,
              background: filter === f ? 'rgba(0,200,255,0.1)' : 'transparent',
              color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}>
              {f === 'all' ? 'ALL' : `${moodEmoji[f]} ${f.toUpperCase()}`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats mini bar */}
      {entries.length > 0 && (
        <div className="animate-fadeUp-2" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem'
        }}>
          {[
            { label: 'TOTAL ENTRIES', value: entries.length, color: 'var(--primary)' },
            { label: 'THIS WEEK', value: entries.filter(e => (Date.now() - new Date(e.date)) < 7 * 86400000).length, color: 'var(--green)' },
            { label: 'AVG WEIGHT', value: `${(entries.reduce((s, e) => s + e.weight, 0) / entries.length).toFixed(1)} kg`, color: 'var(--yellow)' },
            { label: 'AVG BMI', value: (entries.reduce((s, e) => s + (e.bmi || 0), 0) / entries.length).toFixed(1), color: 'var(--purple)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(10,22,40,0.8)', border: `1px solid ${s.color}15`, borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Entries */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◷</div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            {search || filter !== 'all' ? 'NO MATCHING ENTRIES' : 'NO ENTRIES YET'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((entry, idx) => (
            <div key={entry._id} className={`animate-fadeUp-${Math.min(idx + 1, 5)}`} style={{
              background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(10px)',
              border: `1px solid ${expanded === entry._id ? 'rgba(0,200,255,0.25)' : 'rgba(0,200,255,0.1)'}`,
              borderRadius: '16px', overflow: 'hidden',
              transition: 'border-color 0.2s',
              boxShadow: expanded === entry._id ? '0 0 30px rgba(0,200,255,0.08)' : 'none'
            }}>
              {/* Entry header */}
              <div
                onClick={() => setExpanded(expanded === entry._id ? null : entry._id)}
                style={{ padding: '1.2rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
              >
                {/* Date */}
                <div style={{ minWidth: '140px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '3px' }}>DATE</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                    {new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'long' })}
                  </div>
                </div>

                {/* Key metrics */}
                <div style={{ display: 'flex', gap: '1.5rem', flex: 1, flexWrap: 'wrap' }}>
                  {[
                    { label: 'WEIGHT', value: `${entry.weight} kg`, color: 'var(--primary)' },
                    { label: 'BMI', value: entry.bmi, sub: bmiLabel(entry.bmi), color: bmiColor(entry.bmi) },
                    entry.heartRate && { label: 'HEART RATE', value: `${entry.heartRate}`, sub: 'bpm', color: 'var(--red)' },
                    entry.steps > 0 && { label: 'STEPS', value: entry.steps.toLocaleString(), color: 'var(--purple)' },
                  ].filter(Boolean).map((m, i) => (
                    <div key={i}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '3px' }}>{m.label}</div>
                      <div style={{ fontWeight: 700, color: m.color, fontSize: '1rem', lineHeight: 1 }}>{m.value}</div>
                      {m.sub && <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: m.color, opacity: 0.7 }}>{m.sub}</div>}
                    </div>
                  ))}
                </div>

                {/* Mood & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: `${moodColor[entry.mood]}15`,
                    border: `1px solid ${moodColor[entry.mood]}30`,
                    borderRadius: '8px', padding: '5px 10px'
                  }}>
                    <span>{moodEmoji[entry.mood]}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: moodColor[entry.mood] }}>{entry.mood?.toUpperCase()}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(entry._id); }}
                    disabled={deleting === entry._id}
                    style={{
                      background: 'rgba(255,56,96,0.1)', border: '1px solid rgba(255,56,96,0.2)',
                      color: 'var(--red)', padding: '7px 10px', borderRadius: '8px',
                      cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '0.65rem',
                      transition: 'all 0.2s', opacity: deleting === entry._id ? 0.5 : 1
                    }}
                  >
                    {deleting === entry._id ? '◌' : '⊗ DEL'}
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px', transition: 'transform 0.2s', transform: expanded === entry._id ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === entry._id && (
                <div style={{ borderTop: '1px solid rgba(0,200,255,0.08)', padding: '1.2rem 1.5rem', background: 'rgba(0,200,255,0.02)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: entry.notes ? '1rem' : 0 }}>
                    {[
                      entry.bloodPressure?.systolic && { label: 'BLOOD PRESSURE', value: `${entry.bloodPressure.systolic}/${entry.bloodPressure.diastolic} mmHg`, color: 'var(--yellow)' },
                      entry.waterIntake != null && { label: 'WATER INTAKE', value: `${entry.waterIntake} glasses 🥤`, color: 'var(--primary)' },
                      entry.sleepHours && { label: 'SLEEP', value: `${entry.sleepHours} hours`, color: '#60a5fa' },
                      { label: 'HEIGHT', value: `${entry.height} cm`, color: 'var(--text-dim)' },
                    ].filter(Boolean).map((m, i) => (
                      <div key={i} style={{ padding: '10px 14px', background: 'rgba(0,200,255,0.04)', borderRadius: '10px', border: '1px solid rgba(0,200,255,0.06)' }}>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '4px' }}>{m.label}</div>
                        <div style={{ fontWeight: 600, color: m.color, fontSize: '0.9rem' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  {entry.notes && (
                    <div style={{ padding: '12px 16px', background: 'rgba(191,95,255,0.05)', border: '1px solid rgba(191,95,255,0.1)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--purple)', letterSpacing: '0.08em' }}>NOTES: </span>
                      {entry.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}