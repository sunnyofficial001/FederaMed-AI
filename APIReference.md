# API Reference Manual - FederaMed AI

The Coordinator Server exposes a robust, RESTful HTTPS API on Port 3000 to manage parameter consolidation, model registries, data drift audits, and security validations. All requests and responses payload contents use Standard JSON serialization.

---

## 1. Global Platform State

### `GET /api/status`
Retrieves cumulative telemetry state, registered hospital metadata, historical rounds accuracy matrices, and database ledger logs.

#### Response Schema (`200 OK`)
```json
{
  "isTraining": false,
  "currentRound": 3,
  "targetRounds": 15,
  "activeAlgorithm": "FedAvg",
  "selectedModel": "DenseNet-121",
  "differentialPrivacy": true,
  "privacyBudgetAllocated": 1.5,
  "privacyBudgetSpent": 0.18,
  "secureAggregationEnabled": true,
  "activeClientsCount": 4,
  "clients": [
    {
      "id": "hospital_a",
      "name": "Mayo Clinic Center for Health AI",
      "location": "Rochester, MN",
      "datasetName": "MIMIC-IV EHR",
      "datasetSize": 74201,
      "driftStatus": "stable",
      "localDriftMetric": 0.021,
      "activeStatus": "idle",
      "privacyBudget": {
        "allocatedEpsilon": 1.5,
        "spentEpsilon": 0.15
      }
    }
  ],
  "roundsHistory": [],
  "modelVersions": [],
  "auditLogs": []
}
```

---

## 2. Platform Parameter Settings

### `POST /api/settings`
Updates backend ML metrics, selected model backbones, and budget constraints. This operation pauses any currently running training intervals.

#### Request Schema
```json
{
  "algorithm": "FedProx" | "SCAFFOLD" | "FedAvg",
  "selectedModel": "DenseNet-121" | "ResNet-50" | "ViT-Base" | "LSTM-Clinical-RNN",
  "differentialPrivacy": true,
  "privacyEpsilon": 2.5,
  "secureAggRequired": true,
  "targetRounds": 20
}
```

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "state": { ... }
}
```

---

## 3. Training Loop Controls

### `POST /api/train/start`
Triggers the synchronized multi-party training routine. The system executes a coordinate update round immediately, and subsequently runs a background polling sweep every 4000ms.

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "state": { ... }
}
```

### `POST /api/train/stop`
Clears active polling timers, preserving current model parameter matrices as state checkpoints.

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "state": { ... }
}
```

### `POST /api/train/step`
Performs a single-step gradient accumulation consolidation iteration.

---

## 4. Security & Compliance Proving Grounds

### `GET /api/security/audit`
Executes real-time mathematical threat modeling simulating malicious probes against local parameters:
* **MIA Probe**: Overfit metrics assessment.
* **Inversion Reconstruction**: Inverse gradient descent on weights.
* **Label Poisoning**: Verification of outlier aggregations.
* **Backdoor Intrusion**: Assessment of Trojan trigger watermarks.

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "attacks": [
    {
      "attackName": "Membership Inference Attack",
      "attackSuccessRate": 52.4,
      "defenseSuccessRate": 47.6,
      "privacyImpact": "Extremely Low Leakage. Renyi budget constraint prevents membership leakage."
    }
  ]
}
```

---

## 5. Statistical Distribution Checks

### `GET /api/drift/audit`
Runs live two-sample **Kolmogorov-Smirnov distance tests** and **Population Stability Index (PSI)** distributions checking current client data streams against baseline medical criteria.

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "audits": [
    {
      "clientCode": "hospital_a",
      "feature": "Mean Arterial Pressure (MAP)",
      "ksDistance": 0.042,
      "psiDistance": 0.015,
      "pValue": 0.941,
      "status": "stable"
    }
  ]
}
```
