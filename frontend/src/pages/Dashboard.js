import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHealthEntries, getHealthStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(0,200,255,0.3)',
        borderRadius: '12px', padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '0.75rem'
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: '2px 0' }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function HealthScore({ entries }) {
  if (!entries.length) return null;
  const latest = entries[0];
  let score = 60;
  if (latest.bmi >= 18.5 && latest.bmi < 25) score += 15;
  else if (latest.bmi >= 25 && latest.bmi < 30) score += 5;
  if (latest.sleepHours >= 7 && latest.sleepHours <= 9) score += 10;
  else if (latest.sleepHours >= 6) score += 5;
  if (latest.waterIntake >= 8) score += 10;
  else if (latest.waterIntake >= 5) score += 5;
  if (latest.steps >= 10000) score += 10;
  else if (latest.steps >= 5000) score += 5;
  if (latest.mood === 'Excellent') score += 5;
  else if (latest.mood === 'Good') score += 3;
  score = Math.min(100, score);
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--yellow)' : 'var(--red)';
  const label = score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : 'NEEDS ATTENTION';

  return (
    <div style={{
      background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(0,200,255,0.12)',
      borderRadius: '20px', padding: '1.8rem', gridColumn: 'span 2',
      display: 'flex', alignItems: 'center', gap: '2rem',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` }} />
      {/* Ring */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
          />
          <text x="50" y="46" textAnchor="middle" fill={color} fontSize="18" fontWeight="bold" fontFamily="var(--sans)">{score}</text>
          <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="var(--mono)">/100</text>
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '6px' }}>HEALTH SCORE</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color, marginBottom: '4px', letterSpacing: '-0.02em' }}>{label}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Based on BMI, sleep, hydration,<br />activity & mood from latest entry
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon, delay }) {
  return (
    <div className={`animate-fadeUp-${delay}`} style={{
      background: 'rgba(10,22,40,0.8)',
      border: `1px solid ${color}20`,
      borderRadius: '18px', padding: '1.4rem',
      position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s, border-color 0.2s',
      cursor: 'default'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = `${color}40`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${color}20`; }}
    >
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${color}15 0%, transparent 70%)` }} />
      <div style={{ fontFamily: 'var(--mono)', fontSize: '1.4rem', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color, opacity: 0.7, marginTop: '4px', fontFamily: 'var(--mono)' }}>{sub}</div>}
    </div>
  );
}

function BMIGauge({ bmi }) {
  if (!bmi) return null;
  const getBMIInfo = (b) => {
    if (b < 18.5) return { label: 'UNDERWEIGHT', color: 'var(--primary)', pct: (b / 18.5) * 20 };
    if (b < 25) return { label: 'NORMAL', color: 'var(--green)', pct: 20 + ((b - 18.5) / 6.5) * 35 };
    if (b < 30) return { label: 'OVERWEIGHT', color: 'var(--yellow)', pct: 55 + ((b - 25) / 5) * 25 };
    return { label: 'OBESE', color: 'var(--red)', pct: 80 + Math.min(20, ((b - 30) / 10) * 20) };
  };
  const info = getBMIInfo(bmi);
  return (
    <div style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(0,200,255,0.1)', borderRadius: '18px', padding: '1.4rem' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '1rem' }}>BMI ANALYSIS</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: info.color }}>{bmi}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: info.color }}>{info.label}</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{ height: '100%', width: `${info.pct}%`, background: `linear-gradient(90deg, var(--primary), ${info.color})`, borderRadius: '3px', transition: 'width 1s ease', boxShadow: `0 0 8px ${info.color}` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text-muted)' }}>
        <span>18.5</span><span>25</span><span>30</span><span>40</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('weight');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, entriesRes] = await Promise.all([getHealthStats(), getHealthEntries()]);
        setStats(statsRes.data);
        setEntries(entriesRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: '16px' }}>
      <div style={{ width: '50px', height: '50px', border: '3px solid rgba(0,200,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em', animation: 'pulse 1.5s infinite' }}>LOADING VITAL DATA...</p>
    </div>
  );

  const chartData = [...entries].reverse().slice(-10).map(e => ({
    date: new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    weight: e.weight,
    bmi: e.bmi,
    steps: e.steps,
    sleep: e.sleepHours,
    water: e.waterIntake,
    heartRate: e.heartRate
  }));

  const latestBMI = entries[0]?.bmi;

  const chartOptions = [
    { key: 'weight', label: 'Weight', color: 'var(--primary)', unit: 'kg' },
    { key: 'bmi', label: 'BMI', color: 'var(--green)', unit: '' },
    { key: 'steps', label: 'Steps', color: 'var(--purple)', unit: '' },
    { key: 'sleep', label: 'Sleep', color: '#60a5fa', unit: 'hrs' },
    { key: 'heartRate', label: 'Heart Rate', color: 'var(--red)', unit: 'bpm' },
  ];

  const activeOption = chartOptions.find(c => c.key === activeChart);

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fadeUp" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: '6px' }}>
            ◈ VITAL MONITORING DASHBOARD
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
            HELLO, <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0]?.toUpperCase()}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.88rem' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/add-entry" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg, var(--primary), #0088bb)',
          color: '#000', padding: '13px 24px',
          borderRadius: '12px', textDecoration: 'none',
          fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 0 25px rgba(0,200,255,0.35)',
          letterSpacing: '0.03em'
        }}>
          ⊕ LOG TODAY'S VITALS
        </Link>
      </div>

      {stats && stats.totalEntries > 0 ? (
        <>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <HealthScore entries={entries} />
            <StatCard label="AVG WEIGHT" value={`${stats.avgWeight}`} sub="KILOGRAMS" color="var(--primary)" icon="⚖" delay={1} />
            <StatCard label="AVG BMI" value={stats.avgBMI} sub={latestBMI < 18.5 ? 'UNDERWEIGHT' : latestBMI < 25 ? 'NORMAL ✓' : latestBMI < 30 ? 'OVERWEIGHT' : 'OBESE'} color={latestBMI < 18.5 ? 'var(--primary)' : latestBMI < 25 ? 'var(--green)' : latestBMI < 30 ? 'var(--yellow)' : 'var(--red)'} icon="◎" delay={2} />
            <StatCard label="AVG STEPS" value={Number(stats.avgSteps).toLocaleString()} sub={stats.avgSteps >= 10000 ? 'TARGET MET ✓' : 'BELOW TARGET'} color="var(--purple)" icon="👟" delay={3} />
            <StatCard label="AVG SLEEP" value={`${stats.avgSleep}`} sub="HOURS/NIGHT" color="#60a5fa" icon="◷" delay={4} />
            <StatCard label="TOTAL LOGS" value={stats.totalEntries} sub="ENTRIES RECORDED" color="var(--yellow)" icon="◉" delay={5} />
          </div>

          {/* BMI Gauge */}
          {latestBMI && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <BMIGauge bmi={latestBMI} />

              {/* Latest Entry Quick View */}
              {entries[0] && (
                <div style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(0,200,255,0.1)', borderRadius: '18px', padding: '1.4rem' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '1rem' }}>LATEST ENTRY SNAPSHOT</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {[
                      { label: 'HEART RATE', value: entries[0].heartRate ? `${entries[0].heartRate} bpm` : 'N/A', color: 'var(--red)' },
                      { label: 'BLOOD PRESSURE', value: entries[0].bloodPressure?.systolic ? `${entries[0].bloodPressure.systolic}/${entries[0].bloodPressure.diastolic}` : 'N/A', color: 'var(--yellow)' },
                      { label: 'WATER INTAKE', value: `${entries[0].waterIntake || 0} 🥤`, color: 'var(--primary)' },
                      { label: 'MOOD', value: entries[0].mood || 'N/A', color: entries[0].mood === 'Excellent' ? 'var(--green)' : entries[0].mood === 'Good' ? 'var(--primary)' : 'var(--yellow)' },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '12px', background: 'rgba(0,200,255,0.04)', borderRadius: '12px', border: '1px solid rgba(0,200,255,0.08)' }}>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '6px' }}>{item.label}</div>
                        <div style={{ fontWeight: 700, color: item.color, fontSize: '0.95rem' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chart */}
          {chartData.length > 1 && (
            <div className="animate-fadeUp-3" style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(0,200,255,0.1)', borderRadius: '20px', padding: '1.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '4px' }}>TREND ANALYSIS</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Health Metrics Over Time</h3>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {chartOptions.map(opt => (
                    <button key={opt.key} onClick={() => setActiveChart(opt.key)} style={{
                      padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                      fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: '0.05em',
                      border: `1px solid ${activeChart === opt.key ? opt.color : 'rgba(255,255,255,0.08)'}`,
                      background: activeChart === opt.key ? `${opt.color}15` : 'transparent',
                      color: activeChart === opt.key ? opt.color : 'var(--text-muted)',
                      transition: 'all 0.2s'
                    }}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeOption.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={activeOption.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,255,0.06)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11, fontFamily: 'var(--mono)' }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fontFamily: 'var(--mono)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey={activeChart} stroke={activeOption.color} strokeWidth={2.5}
                    fill="url(#colorGrad)" dot={{ fill: activeOption.color, r: 4, strokeWidth: 0 }}
                    name={`${activeOption.label}${activeOption.unit ? ` (${activeOption.unit})` : ''}`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.3)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>♥</div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>No Health Data Yet</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Begin logging your vitals to see your dashboard come alive</p>
          </div>
          <Link to="/add-entry" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, var(--primary), #0088bb)',
            color: '#000', padding: '14px 28px', borderRadius: '12px',
            textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
            boxShadow: '0 0 25px rgba(0,200,255,0.35)'
          }}>
            ⊕ LOG FIRST ENTRY
          </Link>
        </div>
      )}
    </div>
  );
}