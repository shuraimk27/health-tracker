import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '◈' },
    { path: '/add-entry', label: 'Log Health', icon: '⊕' },
    { path: '/history', label: 'History', icon: '◷' },
    { path: '/analytics', label: 'Analytics', icon: '◉' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(2,8,23,0.95)' : 'rgba(2,8,23,0.7)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(0,200,255,0.2)' : 'rgba(0,200,255,0.08)'}`,
      transition: 'all 0.3s ease',
      padding: '0 2rem',
    }}>
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--primary), var(--green), transparent)',
        opacity: 0.6
      }} />

      <div style={{
        maxWidth: '1300px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '64px'
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, var(--primary), var(--green))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
            animation: 'heartbeat 2s ease infinite',
            boxShadow: '0 0 20px rgba(0,200,255,0.4)'
          }}>♥</div>
          <div>
            <div style={{ fontFamily: 'var(--sans)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              HEALTH<span style={{ color: 'var(--green)' }}>TRACK</span>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              VITAL MONITORING SYSTEM
            </div>
          </div>
        </Link>

        {/* Nav links */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem', fontWeight: 500,
                color: isActive(link.path) ? 'var(--primary)' : 'var(--text-muted)',
                background: isActive(link.path) ? 'rgba(0,200,255,0.1)' : 'transparent',
                border: `1px solid ${isActive(link.path) ? 'rgba(0,200,255,0.3)' : 'transparent'}`,
                transition: 'all 0.2s',
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '14px' }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Live clock */}
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '0.75rem',
              color: 'var(--text-muted)',
              background: 'rgba(0,200,255,0.05)',
              border: '1px solid var(--border)',
              padding: '6px 12px', borderRadius: '8px',
              letterSpacing: '0.05em'
            }}>
              <span style={{ color: 'var(--primary)' }}>
                {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </span>
            </div>

            {/* User badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,200,255,0.06)',
              border: '1px solid var(--border)',
              borderRadius: '10px', padding: '6px 12px'
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: '#000'
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-dim)' }}>
                {user.name?.split(' ')[0]}
              </span>
            </div>

            <button onClick={handleLogout} style={{
              background: 'rgba(255,56,96,0.1)',
              border: '1px solid rgba(255,56,96,0.25)',
              color: 'var(--red)', padding: '7px 14px',
              borderRadius: '8px', fontSize: '0.82rem',
              fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--sans)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              ⏻ Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;