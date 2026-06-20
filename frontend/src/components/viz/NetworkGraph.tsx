import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Node, Edge, Background, Controls, useNodesState, useEdgesState 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Server, Database, Cloud } from 'lucide-react';

// In production, these come from the /api/network/status endpoint
const initialNodes: Node[] = [
  { id: 'server', type: 'default', position: { x: 400, y: 50 },  { label: 'Global Aggregator', icon: Cloud, status: 'active' } },
  { id: 'h1', type: 'default', position: { x: 100, y: 250 },  { label: 'Mayo Clinic (Node 1)', icon: HospitalIcon, status: 'training' } },
  { id: 'h2', type: 'default', position: { x: 400, y: 250 }, data: { label: 'Cleveland Clinic (Node 2)', icon: HospitalIcon, status: 'idle' } },
  { id: 'h3', type: 'default', position: { x: 700, y: 250 },  { label: 'Johns Hopkins (Node 3)', icon: HospitalIcon, status: 'error' } },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'h1', target: 'server', animated: true, style: { stroke: '#10B981' } },
  { id: 'e2', source: 'h2', target: 'server', animated: true, style: { stroke: '#94A3B8' } },
  { id: 'e3', source: 'h3', target: 'server', style: { stroke: '#EF4444', strokeWidth: 2 } },
];

function HospitalIcon({ color }: { color?: string }) {
  return <Server size={16} color={color || '#94A3B8'} />;
}

const nodeStyle = {
  background: '#1E293B',
  border: '1px solid #334155',
  color: '#F8FAFC',
  borderRadius: '8px',
  padding: '10px',
  fontSize: '12px',
  width: 180,
};

export default function NetworkGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[600px] bg-surface rounded-lg border border-border overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        className="bg-surface"
      >
        <Background color="#334155" gap={20} />
        <Controls className="bg-surface border-border text-white" />
      </ReactFlow>
    </div>
  );
}