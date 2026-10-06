import React from 'react';
import { useNavigate } from 'react-router-dom';
import { scenarios } from '../data/flowcharts';
import { Brain, MessageCircleWarning, Activity } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  const iconMap = {
    sonNotListening: <MessageCircleWarning size={32} color="var(--accent)" />,
    rumbleStage: <Activity size={32} color="var(--warning)" />
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome to DropAnchor</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Select a scenario below when you need guidance, or visit your Corkboard for grounding.</p>
      </div>
      
      <div className="dashboard-grid">
        {Object.values(scenarios).map(scenario => (
          <div 
            key={scenario.id} 
            className="glass-panel card"
            onClick={() => navigate(`/flowchart/${scenario.id}`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {iconMap[scenario.id] || <Brain size={32} color="var(--accent)" />}
              <h3>{scenario.title}</h3>
            </div>
            <p>{scenario.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
