import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export default function PasswordGate({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For PoC, simple hardcoded password
    if (password === 'anchor') {
      onLogin();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="password-gate">
      <div className="glass-panel password-box">
        <Lock size={48} color="var(--accent)" style={{ margin: '0 auto 1rem' }} />
        <h2>Project DropAnchor</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Please enter your access code</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (hint: anchor)"
            autoFocus
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
          <button type="submit" className="glass-button primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
