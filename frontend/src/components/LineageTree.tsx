import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface NodeData {
  id: string;
  type: 'dataset' | 'model' | 'run';
  name: string;
  version?: string;
}

const mockLineage: NodeData[] = [
  { id: 'd1', type: 'dataset', name: 'MIMIC-IV v2.2' },
  { id: 'r1', type: 'run', name: 'Training Run #402' },
  { id: 'm1', type: 'model', name: 'Sepsis Predictor', version: 'v1.2' },
  { id: 'd2', type: 'dataset', name: 'eICU-CRD v2.0' },
  { id: 'r2', type: 'run', name: 'Fine-tuning #405' },
  { id: 'm2', type: 'model', name: 'Sepsis Predictor', version: 'v1.3' },
];

export default function LineageTree() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = 800;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Simple hierarchical layout simulation
    const g = svg.append("g").attr("transform", "translate(50,20)");
    
    // Nodes
    const nodes = g.selectAll(".node")
      .data(mockLineage)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d, i) => `translate(${i * 150}, ${d.type === 'model' ? 300 : d.type === 'run' ? 150 : 0})`);

    nodes.append("rect")
      .attr("width", 120)
      .attr("height", 40)
      .attr("rx", 6)
      .attr("fill", d => d.type === 'model' ? '#3B82F6' : d.type === 'run' ? '#1E293B' : '#064E3B')
      .attr("stroke", "#475569");

    nodes.append("text")
      .attr("dy", 20)
      .attr("dx", 60)
      .attr("text-anchor", "middle")
      .attr("fill", "#F8FAFC")
      .attr("font-size", "12px")
      .text(d => d.name);

    // Links (Simplified)
    const linkGenerator = d3.linkVertical().x(d => d[0]).y(d => d[1]);
    // In a real app, we'd compute positions dynamically based on parent/child relationships
    
  }, []);

  return (
    <div className="w-full h-[400px] bg-surface rounded-lg border border-border flex items-center justify-center">
      <svg ref={svgRef} width="800" height="400" className="overflow-visible" />
      <p className="absolute text-xs text-text-dim mt-40">Interactive Lineage Graph (D3)</p>
    </div>
  );
}