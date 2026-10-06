import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { scenarios } from '../data/flowcharts';
import { ArrowLeft } from 'lucide-react';

export default function FlowchartView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const scenario = scenarios[id];

  if (!scenario) {
    return <div>Scenario not found</div>;
  }

  // Initialize with all edges visible, but you could implement stepping logic here later
  const [nodes, setNodes, onNodesChange] = useNodesState(scenario.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    scenario.edges.map(e => ({
      ...e,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent)' },
      style: { stroke: 'var(--accent)' }
    }))
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="glass-button" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ margin: 0 }}>{scenario.title}</h2>
      </div>
      
      <div className="glass-panel" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="rgba(255,255,255,0.1)" gap={16} />
          <Controls style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', fill: 'white' }} />
        </ReactFlow>
      </div>
    </div>
  );
}
