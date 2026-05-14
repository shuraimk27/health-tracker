import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(formData);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative', overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: i % 2 === 0 ? '300px' : '200px',
            height: i % 2 === 0 ? '300px' : '200px',
            borderRadius: '50%',
            border: `1px solid rgba(0,200,255,${0.03 + i * 0.01})`,
            top: `${[10, 60, 80, 20, 50, 30][i]}%`,
            left: `${[10, 80, 30, 70, 50, 20][i]}%`,
            transform: 'translate(-50%, -50%)',
            animation: `spin ${20 + i * 5}s linear infinite`,
          }} />
        ))}
        {/* Pulse rings */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,200,255,0.04) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: '440px',
        animation: 'fadeUp 0.5s ease forwards',
        position: 'relative'
      }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '70px', height: '70px', margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, rgba(0,200,255,0.2), rgba(0,255,136,0.1))',
            border: '1px solid rgba(0,200,255,0.3)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: '0 0 40px rgba(0,200,255,0.2)',
            animation: 'heartbeat 2s ease infinite'
          }}>♥</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>
            HEALTH<span style={{ color: 'var(--primary)' }}>TRACK</span>
          </h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.15em', marginTop: '4px' }}>
            VITAL MONITORING SYSTEM v2.0
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(10,22,40,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,200,255,0.15)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,200,255,0.05) inset',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Corner accents */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)', borderRadius: '24px 0 0 0', opacity: 0.5 }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '2px solid var(--green)', borderRight: '2px solid var(--green)', borderRadius: '0 0 24px 0', opacity: 0.5 }} />

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>Access Portal</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enter your credentials to continue</p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,56,96,0.1)', border: '1px solid rgba(255,56,96,0.3)',
              borderRadius: '10px', padding: '12px 16px', marginBottom: '1.2rem',
              color: 'var(--red)', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { name: 'email', label: 'EMAIL ADDRESS', type: 'email', placeholder: 'user@example.com', icon: '✉' },
              { name: 'password', label: 'PASSWORD', type: 'password', placeholder: '••••••••••', icon: '◉' },
            ].map(field => (
              <div key={field.name} style={{ marginBottom: '1.2rem' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: 'var(--mono)', fontSize: '0.65rem',
                  color: focused === field.name ? 'var(--primary)' : 'var(--text-muted)',
                  letterSpacing: '0.1em', marginBottom: '8px',
                  transition: 'color 0.2s'
                }}>
                  <span>{field.icon}</span> {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  onFocus={() => setFocused(field.name)}
                  onBlur={() => setFocused('')}
                  required
                  style={{
                    width: '100%', padding: '13px 16px',
                    background: 'rgba(0,200,255,0.04)',
                    border: `1px solid ${focused === field.name ? 'rgba(0,200,255,0.5)' : 'rgba(0,200,255,0.12)'}`,
                    borderRadius: '12px', color: 'var(--text)',
                    fontSize: '0.95rem', outline: 'none',
                    transition: 'all 0.2s', boxSizing: 'border-box',
                    boxShadow: focused === field.name ? '0 0 0 3px rgba(0,200,255,0.1)' : 'none'
                  }}
                />
              </div>
            ))}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(0,200,255,0.1)' : 'linear-gradient(135deg, var(--primary), #0088bb)',
              border: '1px solid rgba(0,200,255,0.4)',
              borderRadius: '12px', color: loading ? 'var(--text-muted)' : '#000',
              fontSize: '0.95rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em', marginTop: '0.5rem',
              transition: 'all 0.2s',
              fontFamily: 'var(--sans)',
              boxShadow: loading ? 'none' : '0 0 20px rgba(0,200,255,0.3)'
            }}>
              {loading ? '◌ AUTHENTICATING...' : '→ ACCESS SYSTEM'}
            </button>
          </form>

          <div style={{
            textAlign: 'center', marginTop: '1.5rem',
            fontFamily: 'var(--mono)', fontSize: '0.72rem',
            color: 'var(--text-muted)', letterSpacing: '0.05em'
          }}>
            NO ACCOUNT?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>
              REGISTER HERE →
            </Link>
          </div>
        </div>

        {/* Bottom status bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '16px', marginTop: '1.5rem',
          fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-muted)',
          letterSpacing: '0.08em'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span className="status-dot" /> SYSTEM ONLINE
          </span>
          <span>|</span>
          <span>256-BIT ENCRYPTED</span>
          <span>|</span>
          <span>v2.0.1</span>
        </div>
      </div>
    </div>
  );
}

export default Login;