export const dockerCompose = `
version: '3.8'
services:
  coordinator-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
`;

export const kubernetesYaml = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: federamed-coordinator
`;

export const helmChart = `
apiVersion: v2
name: federamed-chart
`;

export const terraformCode = `
provider "google" {
  project = "clinical-federation"
}
`;
