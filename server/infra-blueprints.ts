/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const dockerCompose = `version: "3.8"

services:
  federamed-coordinator:
    image: node:20-alpine
    container_name: federamed_coordinator
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - POSTGRES_URL=postgresql://fed_admin:SecurePass2026@postgres:5432/federamed
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    container_name: federamed_postgres
    environment:
      - POSTGRES_USER=fed_admin
      - POSTGRES_PASSWORD=SecurePass2026
      - POSTGRES_DB=federamed
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fed_admin -d federamed"]
      interval: 5s
      timeout: 5s
      retries: 5
    command: ["postgres", "-c", "shared_buffers=1024MB", "-c", "max_connections=200", "-c", "work_mem=16MB"]
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: federamed_redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    command: ["redis-server", "--appendonly", "yes", "--maxmemory", "512mb", "--maxmemory-policy", "allkeys-lru"]
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
`;

export const kubernetesYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: federamed-coordinator
  namespace: federamed-platform
  labels:
    app: federamed-coordinator
    compliance: hipaa
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: federamed-coordinator
  template:
    metadata:
      labels:
        app: federamed-coordinator
    spec:
      containers:
        - name: coordinator-node
          image: gcr.io/federamed-clinical-intel/coordinator:v2.5.0
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: POSTGRES_URL
              valueFrom:
                secretKeyRef:
                  name: federamed-db-secrets
                  key: database-url
            - name: REDIS_URL
              value: "redis://federamed-redis.federamed-platform.svc.cluster.local:6379/0"
          resources:
            limits:
              cpu: "2"
              memory: 4Gi
            requests:
              cpu: "1"
              memory: 2Gi
          readinessProbe:
            httpGet:
              path: /api/status
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /api/status
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: federamed-coordinator-service
  namespace: federamed-platform
spec:
  selector:
    app: federamed-coordinator
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
`;

export const helmChart = `# Helm Chart Values Configuration for FederaMed AI
global:
  environment: production
  complianceMode: true

replicaCount: 3

image:
  repository: gcr.io/federamed-clinical-intel/coordinator
  pullPolicy: IfNotPresent
  tag: "v2.5.0"

service:
  type: LoadBalancer
  port: 80
  targetPort: 3000

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-production"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: coordinator.federamed.org
      paths:
        - path: /
          pathType: ImplementationSpecific

resources:
  limits:
    cpu: 2000m
    memory: 4096Mi
  requests:
    cpu: 1000m
    memory: 2048Mi

nodeSelector:
  kubernetes.io/arch: amd64
  security: shielded-gke-nodes
`;

export const terraformCode = `# HashiCorp Terraform configuration for Secure GCP / AWS Clinical Landing Zone
terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "federamed_secure_vpc" {
  cidr_block           = "10.240.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  
  tags = {
    Name        = "FederaMed-Secure-Clinical-Zone"
    Compliance  = "HIPAA-HITECH-Section-164"
    Environment = "Production"
  }
}

resource "aws_security_group" "m_tls_ingress" {
  name        = "federamed-mtls-coordination-rules"
  description = "Allows secure 2048-bit mutual TLS exchanges with accredited hospitals"
  vpc_id      = aws_vpc.federamed_secure_vpc.id

  ingress {
    description = "Mutual TLS Secure Port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"] # Isolated private clinical IP space
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}
`;
