/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HospitalClient {
  id: string;
  name: string;
  location: string;
  datasetName: string; // MIMIC-IV, CheXpert, eICU, UCI Healthcare, COVID-19 Open Data
  datasetSize: number;
  dataQualityScore: number;
  driftStatus: 'stable' | 'warning' | 'drift_detected';
  localDriftMetric: number; // Kolmogorov-Smirnov distance
  latencyMs: number;
  activeStatus: 'idle' | 'preprocessing' | 'training' | 'uploading' | 'completed';
  privacyBudget: {
    allocatedEpsilon: number;
    spentEpsilon: number;
    allocatedDelta: number;
    spentDelta: number;
  };
  localModelHash: string;
  preprocessingLogs: string[];
}

export type FederatedAlgorithm = 'FedAvg' | 'FedProx' | 'FedNova' | 'SCAFFOLD' | 'FedSGD';

export interface FederatedRoundMetrics {
  round: number;
  globalAccuracy: number;
  globalLoss: number;
  globalAUC: number;
  globalF1: number;
  clientMetrics: {
    [clientId: string]: {
      accuracy: number;
      loss: number;
      epsilonSpent: number;
    };
  };
  aggregatedAt: string;
  algorithmUsed: FederatedAlgorithm;
}

export interface ModelLineage {
  version: string;
  createdTime: string;
  modelType: string; // ResNet-50, ViT-Base, LSTM-Clinical, DenseNet-121
  loss: number;
  accuracy: number;
  auc: number;
  status: 'Draft' | 'Staging' | 'Production' | 'Archived';
  sha256: string;
  approvedBy: string;
  complianceChecked: boolean;
}

export interface SecurityAuditEvent {
  timestamp: string;
  userId: string;
  role: string;
  action: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
  signature: string; // simulated HMAC-SHA256
}

export interface TrainingParams {
  selectedModel: string; // DenseNet-121 | ViT-Base | LSTM-Clinical
  algorithm: FederatedAlgorithm;
  differentialPrivacy: boolean;
  privacyEpsilon: number; // allocated target e.g. 1.2
  privacyDelta: number; // e.g. 1e-5
  gradientClipping: number; // budget-bound max norm e.g. 1.0
  secureAggRequired: boolean;
  targetRounds: number;
  clientFraction: number; // percentage selected per round
}

export interface SimulatedState {
  isTraining: boolean;
  currentRound: number;
  targetRounds: number;
  activeAlgorithm: FederatedAlgorithm;
  selectedModel: string;
  differentialPrivacy: boolean;
  privacyBudgetAllocated: number;
  privacyBudgetSpent: number;
  secureAggregationEnabled: boolean;
  activeClientsCount: number;
  clients: HospitalClient[];
  roundsHistory: FederatedRoundMetrics[];
  modelVersions: ModelLineage[];
  auditLogs: SecurityAuditEvent[];
}
