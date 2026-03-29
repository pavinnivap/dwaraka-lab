import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beaker } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Fallback simple admin login for local testing before supabase auth is wired
    if (email === 'dwarakalab@gmail.com' && password === 'dwaraka') {
      localStorage.setItem('supabase-auth-token', 'true');
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }

    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <svg width="70" height="70" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }}>
            <path d="M25,10 L60,10 C85,10 95,30 95,50 C95,70 85,90 60,90 L25,90 Z M35,20 L35,80 L60,80 C75,80 82,60 82,50 C82,40 75,20 60,20 Z" fill="#0d2b7c" />
            <rect x="8" y="10" width="10" height="80" fill="#0d2b7c" />
            <path d="M52,35 C44,48 44,60 52,65 C60,60 60,48 52,35 Z" fill="#0d2b7c" />
          </svg>
          <h2 style={{ fontSize: '1.75rem', color: '#0d2b7c', fontWeight: '800', letterSpacing: '1px', margin: 0 }}>DWARAKA LAB</h2>
        </div>

        {error && <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}

            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}

            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
