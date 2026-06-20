# CHANGELOG

## [v2.0.0] - 2026-06-20
**Release Title:** FederaMed AI v2.0 — Enterprise Federated Healthcare Intelligence Platform

### Release Notes
We are thrilled to announce the v2.0 release of FederaMed AI, marking a massive architectural and design overhaul. This release transforms the project into a fully enterprise-ready platform capable of secure, privacy-preserving federated healthcare intelligence using state-of-the-art MLOps practices.

### Feature Summary
- **Federated Learning Support**: Upgraded to support advanced simulated multi-node FedAvg and FedProx strategies.
- **Explainable AI Integration**: Built-in SHAP (SHapley Additive exPlanations) values for every patient prediction to enhance clinical trust.
- **Differential Privacy**: Mathematical guarantees (ε=1.5, δ=1e-5) over gradient updates sent to the central aggregator.
- **MLOps Governance**: Deep integration with MLflow for experiment tracking and rigorous model lifecycle management.

### Major Improvements
- Migrated the frontend to a high-performance React 19 + Vite architecture.
- Containerized the entire infrastructure using Docker and docker-compose for one-click deployments.
- Implemented real-time tracking of data and concept drift using the Kolmogorov-Smirnov (K-S) statistic.

### Architecture Enhancements
- Decoupled the ML training engine from the Inference REST API (FastAPI).
- Added dedicated gRPC communication protocols for hospital node synchronization.
- Introduced an Enterprise Data Governance dashboard for auditing HIPAA and GDPR compliance.

### UI Improvements
- Completely redesigned all 8 primary dashboards with a dark-mode, premium healthcare aesthetic.
- Added localized Waterfall charts and dynamic risk score visualizers to the Clinical Decision Support dashboard.
- Enhanced the interactive System Topology map in the Architecture dashboard.
