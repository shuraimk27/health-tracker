import React, { useState, useEffect } from 'react';
import { getHealthEntries } from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(10,22,40,0.97)', border: '1px solid rgba(0,200,255,0.25)', borderRadius: '12px', padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '0.72rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color, margin: '2px 0' }}>{p.name}: <strong>{p.value}</strong></p>)}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHealthEntries().then(r => setEntries(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
      <div style={{ width: '50px', height: '50px', border: '3px solid rgba(0,200,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>PROCESSING DATA...</p>
    </div>
  );

  if (entries.length < 2) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem' }}>◉</div>
      <h2 style={{ fontWeight: 800 }}>Not Enough Data</h2>
      <p style={{ color: 'var(--text-muted)' }}>Log at least 2 health entries to see analytics</p>
    </div>
  );

  const sorted = [...entries].reverse();
  const chartData = sorted.slice(-14).map(e => ({
    date: new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    weight: e.weight, bmi: e.bmi,
    steps: e.steps || 0,
    sleep: e.sleepHours || 0,
    water: e.waterIntake || 0,
    heartRate: e.heartRate || 0
  }));

  // Mood distribution
  const moodCounts = entries.reduce((acc, e) => { acc[e.mood] = (acc[e.mood] || 0) + 1; return acc; }, {});
  const moodData = Object.entries(moodCounts).map(([name, value]) => ({ name, value }));
  const moodColors = { Excellent: '#00ff88', Good: '#00c8ff', Fair: '#ffd60a', Poor: '#ff3860' };

  // Wellness targets
  const avgSteps = entries.reduce((s, e) => s + (e.steps || 0), 0) / entries.length;
  const avgSleep = entries.reduce((s, e) => s + (e.sleepHours || 0), 0) / entries.length;
  const avgWater = entries.reduce((s, e) => s + (e.waterIntake || 0), 0) / entries.length;
  const avgBMI = entries.reduce((s, e) => s + (e.bmi || 0), 0) / entries.length;

  const radarData = [
    { metric: 'Steps', value: Math.min(100, (avgSteps / 10000) * 100) },
    { metric: 'Sleep', value: Math.min(100, (avgSleep / 8) * 100) },
    { metric: 'Hydration', value: Math.min(100, (avgWater / 8) * 100) },
    { metric: 'BMI', value: avgBMI >= 18.5 && avgBMI < 25 ? 100 : avgBMI >= 25 && avgBMI < 30 ? 60 : 30 },
    { metric: 'Mood', value: (moodCounts['Excellent'] || 0) * 25 + (moodCounts['Good'] || 0) * 18 + (moodCounts['Fair'] || 0) * 10 },
  ];

  const Card = ({ title, sub, children, span }) => (
    <div style={{ background: 'rgba(10,22,40,0.85)', border: '1px solid rgba(0,200,255,0.1)', borderRadius: '20px', padding: '1.6rem', gridColumn: span ? `span ${span}` : 'auto' }}>
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '4px' }}>{sub}</div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="animate-fadeUp" style={{ marginBottom: '2rem' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: '6px' }}>◉ DATA ANALYTICS MODULE</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em' }}>HEALTH <span style={{ color: 'var(--yellow)' }}>ANALYTICS</span></h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.88rem' }}>Deep analysis of {entries.length} entries</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem' }}>

        {/* Weight & BMI trend */}
        <Card title="Weight & BMI Trend" sub="BODY METRICS OVER TIME" span={2}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 10, fontFamily: 'var(--mono)' }} />
              <YAxis yAxisId="left" stroke="var(--text-muted)" tick={{ fontSize: 10, fontFamily: 'var(--mono)' }} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" tick={{ fontSize: 10, fontFamily: 'var(--mono)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line yAxisId="left" type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 3 }} name="Weight (kg)" />
              <Line yAxisId="right" type="monotone" dataKey="bmi" stroke="var(--green)" strokeWidth={2} dot={{ fill: 'var(--green)', r: 3 }} name="BMI" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Steps Bar Chart */}
        <Card title="Daily Steps" sub="ACTIVITY TRACKING">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 9, fontFamily: 'var(--mono)' }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 9, fontFamily: 'var(--mono)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="steps" fill="var(--purple)" radius={[4, 4, 0, 0]} name="Steps">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.steps >= 10000 ? 'var(--green)' : entry.steps >= 5000 ? 'var(--purple)' : 'var(--red)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '10px', flexWrap: 'wrap' }}>
            {[{ color: 'var(--green)', label: '≥10k (Goal)' }, { color: 'var(--purple)', label: '5k-10k' }, { color: 'var(--red)', label: '<5k' }].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </Card>

        {/* Mood Pie */}
        <Card title="Mood Distribution" sub="EMOTIONAL WELLNESS">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={moodData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {moodData.map((entry, i) => (
                    <Cell key={i} fill={moodColors[entry.name] || 'var(--text-muted)'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {moodData.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: moodColors[m.name] }} />
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.name.toUpperCase()}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', fontWeight: 700, color: moodColors[m.name] }}>
                    {Math.round((m.value / entries.length) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Sleep Bar Chart */}
        <Card title="Sleep Quality" sub="SLEEP DURATION TRACKING">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 9, fontFamily: 'var(--mono)' }} />
              <YAxis domain={[0, 12]} stroke="var(--text-muted)" tick={{ fontSize: 9, fontFamily: 'var(--mono)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sleep" radius={[4, 4, 0, 0]} name="Sleep (hrs)">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.sleep >= 7 && entry.sleep <= 9 ? '#60a5fa' : entry.sleep >= 6 ? 'var(--yellow)' : 'var(--red)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Wellness Radar */}
        <Card title="Wellness Radar" sub="OVERALL HEALTH PROFILE">
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(0,200,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--mono)' }} />
              <Radar name="Wellness" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Summary stats */}
        <Card title="Period Summary" sub={`AVERAGES ACROSS ${entries.length} ENTRIES`} span={2}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'AVG STEPS/DAY', value: Math.round(avgSteps).toLocaleString(), target: '10,000', met: avgSteps >= 10000, color: 'var(--purple)' },
              { label: 'AVG SLEEP/NIGHT', value: `${avgSleep.toFixed(1)} hrs`, target: '7-9 hrs', met: avgSleep >= 7 && avgSleep <= 9, color: '#60a5fa' },
              { label: 'AVG WATER/DAY', value: `${avgWater.toFixed(1)} glasses`, target: '8 glasses', met: avgWater >= 8, color: 'var(--primary)' },
              { label: 'AVG BMI', value: avgBMI.toFixed(1), target: '18.5–24.9', met: avgBMI >= 18.5 && avgBMI < 25, color: 'var(--green)' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '14px', background: `${item.color}08`, border: `1px solid ${item.color}20`, borderRadius: '12px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '6px' }}>{item.label}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: item.color, marginBottom: '4px' }}>{item.value}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: item.met ? 'var(--green)' : 'var(--red)' }}>
                    {item.met ? '✓ TARGET MET' : '✗ BELOW TARGET'}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.52rem', color: 'var(--text-muted)', marginTop: '2px' }}>TARGET: {item.target}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}