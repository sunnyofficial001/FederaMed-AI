import React from 'react';
import LineageTree from '../components/viz/LineageTree';
import { GitCommit, Scale, History, CheckCircle } from 'lucide-react';

export default function ModelGovernanceStudio() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Model Governance Studio</h1>
        <p className="text-text-dim text-sm mt-1">Lifecycle management, approval workflows, and lineage tracking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Workflow Status */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface p-4 rounded-lg border border-border">
            <h3 className="text-sm font-semibold text-white mb-3">Pending Approvals</h3>
            <div className="space-y-3">
              <div className="p-3 bg-surfaceHighlight rounded border-l-2 border-warning">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-white">Sepsis v1.4</span>
                  <span className="text-[10px] text-warning">Review</span>
                </div>
                <p className="text-[10px] text-text-dim mt-1">Waiting for Chief Data Officer</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface p-4 rounded-lg border border-border">
            <h3 className="text-sm font-semibold text-white mb-3">Compliance Checks</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-success">
                <CheckCircle size={14} /> HIPAA Compliant
              </div>
              <div className="flex items-center gap-2 text-xs text-success">
                <CheckCircle size={14} /> GDPR Right to Erasure
              </div>
              <div className="flex items-center gap-2 text-xs text-success">
                <CheckCircle size={14} /> DP Budget Verified
              </div>
            </div>
          </div>
        </div>

        {/* Lineage Viz */}
        <div className="lg:col-span-3 bg-surface rounded-lg border border-border p-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Model Lineage Explorer</h3>
            <div className="flex gap-2">
               <button className="text-xs bg-surfaceHighlight px-2 py-1 rounded text-white">Compare Versions</button>
               <button className="text-xs bg-surfaceHighlight px-2 py-1 rounded text-white">Rollback</button>
            </div>
          </div>
          <LineageTree />
        </div>
      </div>
    </div>
  );
}