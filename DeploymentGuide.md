# Deployment Engineering Guide - FederaMed AI

This guide covers production-ready environment setup, containerization, orchestration, and Infrastructure-as-Code (IaC) templates for the FederaMed AI platform.

---

## 1. Production Docker Containerization
The service relies on a **low-footprint multi-stage Docker build** that bundles the precompiled React single-page frontend alongside compiling the Express back-end via `esbuild` into a single CommonJS package.

### `Dockerfile`
Create the following `Dockerfile` inside the root directory:
```dockerfile
# --- Stage 1: Dependency Assembly & Compiler ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Low-Footprint Lightweight Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server_data ./server_data

EXPOSE 3000
CMD ["npm", "start"]
```

To build and run the image locally:
```bash
docker build -t federamed-ai:latest .
docker run -p 3000:3000 --env-file .env federamed-ai:latest
```

---

## 2. Docker Compose Orchestration Setup
To provision both the central coordination service, a persistent PostgreSQL container, and an in-memory Redis cache instance:

```yaml
version: '3.8'

services:
  coordinator-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - federadb
      - federacache
    networks:
      - federanet

  federadb:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: federamed
      POSTGRES_USER: medical_coordinator
      POSTGRES_PASSWORD: SecretPassword123
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - federanet

  federacache:
    image: redis:7-alpine
    networks:
      - federanet

volumes:
  pgdata:

networks:
  federanet:
    driver: bridge
```

---

## 3. Kubernetes Orchestration Blueprints (Helm)
The platform is fully deployable onto enterprise clusters (Google Kubernetes Engine - GKE) under isolated namespace policies.

### Kubernetes Deployment Spec (`deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: federamed-coordinator
  namespace: clinical-federation
  labels:
    app: federamed-coordinator
spec:
  replicas: 3
  selector:
    matchLabels:
      app: federamed-coordinator
  template:
    metadata:
      labels:
        app: federamed-coordinator
    spec:
      containers:
      - name: coordinator
        image: gcr.io/clinical-federation/federamed-coordinator:v2.0.0
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "2"
            memory: 4Gi
          requests:
            cpu: "500m"
            memory: 1Gi
        env:
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: gemini-secrets
              key: api-key
---
apiVersion: v1
kind: Service
metadata:
  name: federamed-coordinator-service
  namespace: clinical-federation
spec:
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: federamed-coordinator
  type: LoadBalancer
```

---

## 4. Cloud Infrastructure Provisioning (Terraform)
To spin up compliant Google Cloud Platform (GCP) resources:

```hcl
provider "google" {
  project = "clinical-federation-project"
  region  = "us-central1"
}

# Protected Private GKE Cluster
resource "google_container_cluster" "gke_cluster" {
  name     = "federamed-clinical-gke"
  location = "us-central1-a"

  initial_node_count = 3

  node_config {
    machine_type = "e2-standard-4"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

# HIPAA-Compliant SQL Database
resource "google_sql_database_instance" "postgresql_instance" {
  name             = "federamed-durable-postgres"
  database_version = "POSTGRES_15"
  region           = "us-central1"

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled    = false
      private_network = "projects/clinical-federation-project/global/networks/default"
    }
  }
}
```
---

## 5. Deployment Verification Checklist
* Run `nc -zv {HOST} 3000` to confirm external ingress port connectivity.
* Verify Prometheus scraping targets are reporting positive states (`UP`) inside GKE target logs.
* Inspect that shared secret keys are sealed with AES-256 before committing to local config repositories.
