import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Anchor } from 'lucide-react';
import Dashboard from './components/Dashboard';
import FlowchartView from './components/FlowchartView';
import Corkboard from './components/Corkboard';
import PasswordGate from './components/PasswordGate';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <PasswordGate onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="app-container">
        <header>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="logo">
              <Anchor size={28} />
              <span>Project DropAnchor</span>
            </div>
          </Link>
          <nav>
            <Link to="/corkboard" className="glass-button">My Corkboard</Link>
          </nav>
        </header>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/flowchart/:id" element={<FlowchartView />} />
            <Route path="/corkboard" element={<Corkboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
