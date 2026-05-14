import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addHealthEntry } from '../services/api';

const Section = ({ title, icon, color, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem', paddingBottom: '10px', borderBottom: `1px solid ${color}20` }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color, letterSpacing: '0.12em', fontWeight: 700 }}>{title}</span>
    </div>
    {children}
  </div>
);

const Field = ({ label, name, type, placeholder, min, max, step, value, onChange, unit, required }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '0.62rem', color: focused ? 'var(--primary)' : 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '7px', transition: 'color 0.2s' }}>
        <span>{label}{required && <span style={{ color: 'var(--red)' }}> *</span>}</span>
        {unit && <span style={{ color: 'var(--text-muted)' }}>{unit}</span>}
      </label>
      <input
        type={type} name={name} placeholder={placeholder}
        min={min} max={max} step={step} value={value}
        onChange={onChange} required={required}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '12px 14px',
          background: focused ? 'rgba(0,200,255,0.06)' : 'rgba(0,200,255,0.02)',
          border: `1px solid ${focused ? 'rgba(0,200,255,0.4)' : 'rgba(0,200,255,0.1)'}`,
          borderRadius: '10px', color: 'var(--text)',
          fontSize: '0.92rem', outline: 'none',
          boxSizing: 'border-box', transition: 'all 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(0,200,255,0.08)' : 'none',
          fontFamily: 'var(--sans)'
        }}
      />
    </div>
  );
};

export default function AddEntry() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    weight: '', height: '', heartRate: '',
    systolic: '', diastolic: '',
    waterIntake: '', sleepHours: '', steps: '',
    mood: 'Good', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Live BMI preview
  const bmi = formData.weight && formData.height
    ? (parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)
    : null;
  const getBMIInfo = (b) => {
    if (!b) return null;
    const n = parseFloat(b);
    if (n < 18.5) return { label: 'UNDERWEIGHT', color: 'var(--primary)' };
    if (n < 25) return { label: 'NORMAL ✓', color: 'var(--green)' };
    if (n < 30) return { label: 'OVERWEIGHT', color: 'var(--yellow)' };
    return { label: 'OBESE', color: 'var(--red)' };
  };
  const bmiInfo = getBMIInfo(bmi);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
        bloodPressure: {
          systolic: formData.systolic ? parseInt(formData.systolic) : undefined,
          diastolic: formData.diastolic ? parseInt(formData.diastolic) : undefined
        },
        waterIntake: formData.waterIntake ? parseInt(formData.waterIntake) : 0,
        sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : undefined,
        steps: formData.steps ? parseInt(formData.steps) : 0,
        mood: formData.mood, notes: formData.notes
      };
      await addHealthEntry(payload);
      setSuccess('ENTRY SAVED SUCCESSFULLY');
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'FAILED TO SAVE — TRY AGAIN');
    } finally { setLoading(false); }
  };

  const moods = [
    { val: 'Excellent', icon: '😄', color: 'var(--green)' },
    { val: 'Good', icon: '😊', color: 'var(--primary)' },
    { val: 'Fair', icon: '😐', color: 'var(--yellow)' },
    { val: 'Poor', icon: '😔', color: 'var(--red)' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="animate-fadeUp" style={{ marginBottom: '2rem' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: '6px' }}>⊕ HEALTH DATA ENTRY</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em' }}>LOG TODAY'S <span style={{ color: 'var(--green)' }}>VITALS</span></h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.88rem' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Live BMI Preview */}
      {bmi && bmiInfo && (
        <div className="animate-fadeUp" style={{
          background: `${bmiInfo.color}10`, border: `1px solid ${bmiInfo.color}30`,
          borderRadius: '14px', padding: '14px 18px', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '16px'
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>LIVE BMI PREVIEW</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: bmiInfo.color }}>{bmi}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: bmiInfo.color }}>{bmiInfo.label}</div>
          <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>auto-calculated from weight & height</div>
        </div>
      )}

      <div style={{
        background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,200,255,0.12)', borderRadius: '24px', padding: '2.5rem',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '2px solid var(--green)', borderLeft: '2px solid var(--green)', borderRadius: '24px 0 0 0', opacity: 0.4 }} />

        {error && (
          <div style={{ background: 'rgba(255,56,96,0.1)', border: '1px solid rgba(255,56,96,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '1.5rem', color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
            ⚠ {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '1.5rem', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '0.8rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Section title="BODY MEASUREMENTS" icon="⚖" color="var(--primary)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="WEIGHT" name="weight" type="number" placeholder="70.5" min={20} max={300} step={0.1} value={formData.weight} onChange={handleChange} unit="kg" required />
              <Field label="HEIGHT" name="height" type="number" placeholder="170" min={100} max={250} step={0.1} value={formData.height} onChange={handleChange} unit="cm" required />
            </div>
          </Section>

          <Section title="CARDIOVASCULAR VITALS" icon="♥" color="var(--red)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Field label="HEART RATE" name="heartRate" type="number" placeholder="72" min={40} max={200} step={1} value={formData.heartRate} onChange={handleChange} unit="bpm" />
              <Field label="BP SYSTOLIC" name="systolic" type="number" placeholder="120" min={70} max={200} step={1} value={formData.systolic} onChange={handleChange} unit="mmHg" />
              <Field label="BP DIASTOLIC" name="diastolic" type="number" placeholder="80" min={40} max={130} step={1} value={formData.diastolic} onChange={handleChange} unit="mmHg" />
            </div>
          </Section>

          <Section title="LIFESTYLE METRICS" icon="◉" color="var(--green)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
              <Field label="WATER INTAKE" name="waterIntake" type="number" placeholder="8" min={0} max={20} step={1} value={formData.waterIntake} onChange={handleChange} unit="glasses" />
              <Field label="SLEEP DURATION" name="sleepHours" type="number" placeholder="7.5" min={0} max={24} step={0.5} value={formData.sleepHours} onChange={handleChange} unit="hours" />
              <Field label="STEP COUNT" name="steps" type="number" placeholder="8000" min={0} max={100000} step={1} value={formData.steps} onChange={handleChange} unit="steps" />
            </div>

            {/* Mood selector */}
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>MOOD STATUS</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {moods.map(m => (
                  <button type="button" key={m.val} onClick={() => setFormData(prev => ({ ...prev, mood: m.val }))} style={{
                    flex: 1, padding: '12px 8px',
                    background: formData.mood === m.val ? `${m.color}15` : 'rgba(0,200,255,0.02)',
                    border: `1px solid ${formData.mood === m.val ? m.color : 'rgba(0,200,255,0.1)'}`,
                    borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    transition: 'all 0.2s',
                    boxShadow: formData.mood === m.val ? `0 0 15px ${m.color}25` : 'none'
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>{m.icon}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', color: formData.mood === m.val ? m.color : 'var(--text-muted)', letterSpacing: '0.05em' }}>{m.val.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="ADDITIONAL NOTES" icon="◷" color="var(--purple)">
            <textarea
              name="notes" value={formData.notes} onChange={handleChange}
              placeholder="Any symptoms, observations, or notes about today's health..."
              maxLength={500}
              style={{
                width: '100%', padding: '14px', minHeight: '90px',
                background: 'rgba(191,95,255,0.03)',
                border: '1px solid rgba(191,95,255,0.1)',
                borderRadius: '12px', color: 'var(--text)',
                fontSize: '0.9rem', outline: 'none', resize: 'vertical',
                fontFamily: 'var(--sans)', boxSizing: 'border-box',
                lineHeight: 1.6
              }}
            />
            <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {formData.notes.length}/500
            </div>
          </Section>

          <button type="submit" disabled={loading || !!success} style={{
            width: '100%', padding: '15px',
            background: success ? 'rgba(0,255,136,0.15)' : loading ? 'rgba(0,200,255,0.08)' : 'linear-gradient(135deg, var(--green), #00aa55)',
            border: `1px solid ${success ? 'rgba(0,255,136,0.4)' : 'rgba(0,255,136,0.3)'}`,
            borderRadius: '14px',
            color: success ? 'var(--green)' : loading ? 'var(--text-muted)' : '#000',
            fontSize: '0.95rem', fontWeight: 700,
            cursor: loading || success ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--sans)', letterSpacing: '0.05em',
            boxShadow: loading || success ? 'none' : '0 0 25px rgba(0,255,136,0.25)',
            transition: 'all 0.3s'
          }}>
            {success ? '✓ SAVED — RETURNING TO DASHBOARD' : loading ? '◌ SAVING DATA...' : '→ SAVE HEALTH ENTRY'}
          </button>
        </form>
      </div>
    </div>
  );
}