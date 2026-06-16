# System Design - FederaMed AI

## 1. Relational Database Schema Model (PostgreSQL Ledger)
The platform establishes relational structures managing client definitions, global checkpoints, and cryptographic audit trails:

### `HOSPITAL_METADATA` Table
Stores registered collaborative clinical nodes:
* `id` (VARCHAR, PRIMARY KEY): e.g., `hospital_a`
* `name` (VARCHAR): e.g., `Mayo Clinic Center for Health AI`
* `location` (VARCHAR): Rochester, MN
* `dataset_name` (VARCHAR): MIMIC-IV EHR
* `size` (INT): Total hospital patient record size
* `latency_ms` (INT): Heartbeat latency metric

### `AUDIT_LOGS` Table
Maintains compliance audit trails with cryptographic signatures:
* `timestamp` (TIMESTAMP): Time of execution
* `userId` (VARCHAR): Registered security/auditor ID
* `role` (VARCHAR): User authorization role
* `action` (VARCHAR): Set system parameter, check model
* `ipAddress` (VARCHAR): Access source IP
* `status` (VARCHAR): `SUCCESS` | `WARNING` | `FAILED`
* `details` (TEXT): Log description details
* `signature` (VARCHAR): SHA-256 seal of security

### `MODEL_METADATA` Table
Registers model checkpoints and promotion statuses:
* `version` (VARCHAR, PRIMARY KEY): e.g., `v1.2.0-candidate`
* `modelType` (VARCHAR): e.g., `DenseNet-121`
* `accuracy` (FLOAT): Evaluation statistic
* `loss` (FLOAT): Evaluation statistic
* `auc` (FLOAT): Area under ROC curve
* `approvedBy` (VARCHAR): Approving investigator or compliance agent
* `status` (VARCHAR): `Staging` | `Production` | `Retired`
* `weights` (JSON/TEXT): Vector parameters serialization

---

## 2. In-Memory K/V Cache Model (Redis Telemetry Store)
Redis scales fast-access properties protecting durable database systems from high polling volume:

```
[Key Pattern]                  -> [Cached Value Data Schema]
client_status:{id}             -> String ("idle" | "training" | "offline")
client_epsilon:{id}            -> Float (Spent privacy accumulator: e.g. 0.18)
client_drift:{id}              -> Float (Current features KS-distance metric)
client_logs:{id}               -> Array of Strings (Localized ETL logs)
rounds_history                 -> Structured Array of Consolidated FL rounds
is_training_active             -> Boolean (Global coordinator status flag)
```

---

## 3. High-Performance Optimization Engines

### 3.1 FedProx Optimization
* Minimizes a regularized local loss function to mitigate hospital dataset heterogeneity (non-IID data):
  $$h_k(w) = F_k(w) + \frac{\mu}{2} \| w - w^t \|^2$$
* Prevents localized optimizations from drifting too far from the global consensus weights ($w^t$) in underrepresented client subsets.

### 3.2 SCAFFOLD Variance Reduction
* Introduces control variates ($C$) to model client gradient directions and dynamically correct updates:
  $$g_i \leftarrow g_i - c_i + c_g$$
* Addresses client-drift, allowing fast convergence with far fewer communication rounds under highly non-IID hospital distributions.

---

## 4. Concurrency & Synchronization Safeguards
1. **Atomic Model Registry state transitions**: Dual approval signatures must be verified inside `ModelRegistryService` before shifting statuses.
2. **Buffer Safeguards**: Shared in-memory `systemState` arrays are locked and synced from DB pools prior to executing every sequential training step.
