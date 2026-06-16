# Architecture Specification - FederaMed AI

## 1. System Topology Overview
FederaMed AI is structured as a **Hub-and-Spoke Federated Learning Coordination Topology**. The central Hub (Coordinator node) acts as the parameter registry, global aggregator, and supervisor. The Spoke nodes (Hospitals and Medical centers) run localized workflows directly bordering secure health data storage, ensuring raw patient telemetry is never processed outside private institutional boundaries.

```
                  ┌──────────────────────┐
                  │ Central Coordinator  │
                  │ (Parameter Server)   │
                  └──────────┬───────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼ (Secure Agg)   ▼ (Secure Agg)   ▼ (Secure Agg)
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │  Mayo Clinic │ │  Stanford.Med│ │  Johns Hopk. │
     │  (MIMIC-IV)  │ │ (CheXpert)   │ │    (eICU)    │
     └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 2. Core Operational Modules

```
  +─────────────────────────────────────────────────────────────+
  |                   FEDERAMED COOPERATIVE STACK               |
  +─────────────────────────────────────────────────────────────+
  |  1. Data Ingestion Layer: EHR/Waveform Preprocessing        |
  |  2. Neural Engine: DiagnosticNeuralNetwork Weight Tracker   |
  |  3. Privacy Engine: Rényi Differential Privacy Accountant   |
  |  4. Aggregation Layer: Pairwise Secure Aggregator           |
  |  5. Governance Layer: PostgreSQL Ledger Database Sync       |
  +─────────────────────────────────────────────────────────────+
```

### 2.1 Ingestion & Normalization Layer (`MedicalDataPipeline`)
Standardizes clinical data arrays into flat feature vectors matching the network architecture requirements:
* **MIMIC-IV Preprocessor**: Extracts bio-values (age, MAP, blood ph, oxygen), projects them via normalisation coefficients, and assigns acute kidney failure risk classifications.
* **eICU Waveform Preprocessor**: Leverages signal processing averages and slopes to project physiological trend vectors.
* **CheXpert Intensity Preprocessor**: Computes dynamic ranges and intensity properties across radiological pixels.

### 2.2 Neural Weight Tracking (`DiagnosticNeuralNetwork`)
Built on custom gradient backpropagation layers running Xavier Glorot initialization.
* Computes local binary cross-entropy (BCE) loss gradients:
  $$L(y, \hat{y}) = -[y \log(\hat{y}) + (1 - y) \log(1 - \hat{y})]$$
* Generates localized weight updates using standard gradient descent parameterized by custom learning rates ($\eta = 0.05$).

### 2.3 Rényi Differential Privacy Accountant (`PrivacyEngine`)
Enforces mathematical privacy bounds protecting against model inversion threats:
* **L2 Gradient Clipping**: Limits gradient contribution norms:
  $$g \leftarrow g \cdot \min\left(1, \frac{C}{\|g\|_2}\right)$$
* **Gaussian Noise Mechanism**: Adds calibrated Gaussian noise derived from the clipping threshold ($C$) and noise multiplier ($\sigma$):
  $$\tilde{g} \leftarrow g + \mathcal{N}(0, \sigma^2 I)$$
* **Rényi accountant validation**: Calculates Spend Epsilon bounds dynamically across training steps ensuring the strict budget threshold ($\varepsilon \le 2.5$) is never breached.

### 2.4 Cryptographic Zero-Sum Secure Aggregation (`SecureAggregator`)
To prevent the central coordinator from inspecting localized Spoke updates, a pairwise secret-sharing protocol is utilized:
1. Spoke $A$ and Spoke $B$ generate a cryptographically symmetric mutual seed.
2. Node $A$ adds the deterministic noise mask to its local parameters:
   $$W_{A}^{masked} = W_{A} + \Delta_{A,B}$$
3. Node $B$ subtracts the exact same mask from its parameters:
   $$W_{B}^{masked} = W_{B} - \Delta_{A,B}$$
4. Upon linear central summation, mutual masks perfectly cancel out, yielding standard aggregated parameters:
   $$\sum_{i} W_{i}^{masked} = \sum_{i} W_{i}$$

---

## 3. Communication Pattern Sequence

```
Hospital Node A              Coordinator Server               Hospital Node B
      │                              │                               │
      │ ◄───── GET systemState ──────│─────── GET systemState ─────► │
      │                              │                               │
      │ ─── POST local weights ─────►│◄──── POST local weights ──────│
      │      (with SecAgg masks)     │      (with SecAgg masks)      │
      │                              │                               │
      │                              │── Consolidation (Summation)   │
      │                              │   - Masks cancel out          │
      │                              │   - DP Noise Injected         │
      │                              │   - Budget spent recorded     │
      │                              │                               │
      │ ◄─── GET updated global ─────│─────── GET updated global ──► │
```

---

## 4. Security Verification Assertions
* **Raw Feature Isolation**: Spokes maintain local physical and logical database Isolation. Raw tables are never exposed inside HTTP payloads.
* **No Side-Channel Leakage**: Pairwise masking prevents intermediate spoofing. If a rogue administrator sniffs active payloads, they only inspect un-decipherable masked matrices.
