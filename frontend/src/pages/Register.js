import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await registerUser(formData);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const strength = formData.password.length === 0 ? 0 : formData.password.length < 6 ? 1 : formData.password.length < 10 ? 2 : 3;
  const strengthColor = ['transparent', 'var(--red)', 'var(--yellow)', 'var(--green)'][strength];
  const strengthLabel = ['', 'WEAK', 'MODERATE', 'STRONG'][strength];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '30%', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,255,0.05) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '460px', animation: 'fadeUp 0.5s ease forwards', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '70px', height: '70px', margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,200,255,0.1))',
            border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', boxShadow: '0 0 40px rgba(0,255,136,0.2)'
          }}>⊕</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-0.03em' }}>
            CREATE <span style={{ color: 'var(--green)' }}>ACCOUNT</span>
          </h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.12em', marginTop: '4px' }}>
            BEGIN YOUR HEALTH JOURNEY
          </p>
        </div>

        <div style={{
          background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,255,136,0.12)', borderRadius: '24px', padding: '2.5rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '2px solid var(--green)', borderLeft: '2px solid var(--green)', borderRadius: '24px 0 0 0', opacity: 0.5 }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '2px solid var(--primary)', borderRight: '2px solid var(--primary)', borderRadius: '0 0 24px 0', opacity: 0.5 }} />

          {error && (
            <div style={{
              background: 'rgba(255,56,96,0.1)', border: '1px solid rgba(255,56,96,0.3)',
              borderRadius: '10px', padding: '12px 16px', marginBottom: '1.2rem',
              color: 'var(--red)', fontSize: '0.85rem'
            }}>⚠ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { name: 'name', label: 'FULL NAME', type: 'text', placeholder: 'Your Full Name', icon: '◈' },
              { name: 'email', label: 'EMAIL ADDRESS', type: 'email', placeholder: 'user@example.com', icon: '✉' },
              { name: 'password', label: 'PASSWORD', type: 'password', placeholder: 'Min. 6 characters', icon: '◉' },
            ].map(field => (
              <div key={field.name} style={{ marginBottom: '1.2rem' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: 'var(--mono)', fontSize: '0.65rem',
                  color: focused === field.name ? 'var(--green)' : 'var(--text-muted)',
                  letterSpacing: '0.1em', marginBottom: '8px', transition: 'color 0.2s'
                }}>
                  {field.icon} {field.label}
                  {field.name === 'password' && formData.password && (
                    <span style={{ marginLeft: 'auto', color: strengthColor, fontSize: '0.6rem' }}>
                      {strengthLabel}
                    </span>
                  )}
                </label>
                <input
                  type={field.type} name={field.name} placeholder={field.placeholder}
                  value={formData[field.name]} onChange={handleChange}
                  onFocus={() => setFocused(field.name)} onBlur={() => setFocused('')}
                  required
                  style={{
                    width: '100%', padding: '13px 16px',
                    background: 'rgba(0,255,136,0.03)',
                    border: `1px solid ${focused === field.name ? 'rgba(0,255,136,0.4)' : 'rgba(0,255,136,0.1)'}`,
                    borderRadius: '12px', color: 'var(--text)',
                    fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    boxShadow: focused === field.name ? '0 0 0 3px rgba(0,255,136,0.08)' : 'none'
                  }}
                />
                {field.name === 'password' && formData.password && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(0,255,136,0.08)' : 'linear-gradient(135deg, var(--green), #00aa55)',
              border: '1px solid rgba(0,255,136,0.4)',
              borderRadius: '12px', color: loading ? 'var(--text-muted)' : '#000',
              fontSize: '0.95rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em', marginTop: '0.5rem',
              fontFamily: 'var(--sans)',
              boxShadow: loading ? 'none' : '0 0 20px rgba(0,255,136,0.25)',
              transition: 'all 0.2s'
            }}>
              {loading ? '◌ CREATING PROFILE...' : '→ INITIALIZE TRACKING'}
            </button>
          </form>

          <div style={{
            textAlign: 'center', marginTop: '1.5rem',
            fontFamily: 'var(--mono)', fontSize: '0.72rem',
            color: 'var(--text-muted)', letterSpacing: '0.05em'
          }}>
            HAVE AN ACCOUNT?{' '}
            <Link to="/login" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 700 }}>
              LOGIN →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;