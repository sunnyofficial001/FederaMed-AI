import { describe, it, expect } from "vitest";
import { randomNormal, SecureAggregator, PrivacyEngine, DiagnosticNeuralNetwork } from "../server/ml";

describe("ML Core Mathematical Modules", () => {
  describe("randomNormal (Box-Muller Transform)", () => {
    it("should generate values near the requested mean and standard deviation", () => {
      const samples: number[] = [];
      const mean = 10;
      const stdDev = 2;
      for (let i = 0; i < 500; i++) {
        samples.push(randomNormal(mean, stdDev));
      }
      
      const observedMean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const squaredDiffs = samples.map(val => Math.pow(val - observedMean, 2));
      const observedVariance = squaredDiffs.reduce((a, b) => a + b, 0) / samples.length;
      const observedStdDev = Math.sqrt(observedVariance);

      expect(observedMean).toBeCloseTo(mean, 0); // mean should be roughly 10
      expect(observedStdDev).toBeCloseTo(stdDev, 0); // stdDev should be roughly 2
    });
  });

  describe("SecureAggregator", () => {
    it("should generate mutually canceling zero-sum masks across collaborative nodes", () => {
      const nodes = ["hospital_a", "hospital_b", "hospital_c"];
      const numWeights = 100;
      const masksByNode = SecureAggregator.generatePairwiseMasks(nodes, numWeights);

      expect(Object.keys(masksByNode)).toHaveLength(3);
      expect(masksByNode["hospital_a"]).toHaveLength(numWeights);

      // Cumulative sum of all masks at each weight index must be zero
      const aggregatedMasks = new Float32Array(numWeights);
      for (let w = 0; w < numWeights; w++) {
        let sum = 0;
        nodes.forEach(nodeId => {
          sum += masksByNode[nodeId][w];
        });
        aggregatedMasks[w] = sum;
      }

      for (let w = 0; w < numWeights; w++) {
        expect(aggregatedMasks[w]).toBeCloseTo(0, 5); // Must perfectly cancel to zero
      }
    });
  });

  describe("PrivacyEngine (Differential Privacy)", () => {
    it("should correctly clip gradient vectors to the designated L2 Norm limit", () => {
      const engine = new PrivacyEngine(1.5, 2.0, 0.05); // l2Clip = 2.0
      const grads = new Float32Array([3.0, 4.0]); // initial L2 Norm = sqrt(9 + 16) = 5.0
      
      const initialNorm = Math.sqrt(3 * 3 + 4 * 4);
      expect(initialNorm).toBe(5.0);

      const normAfterClip = engine.clipGradients(grads);
      expect(normAfterClip).toBe(5.0); // Returns pre-clipped norm

      const finalNorm = Math.sqrt(grads[0] * grads[0] + grads[1] * grads[1]);
      expect(finalNorm).toBeCloseTo(2.0, 5); // Should be exactly scaled down to clip limit
    });

    it("should inject Gaussian noise and compute dynamic RDP privacy loss bounds", () => {
      const engine = new PrivacyEngine(1.2, 1.0, 0.02);
      const originalWeights = new Float32Array(10).fill(0.5);
      const noisyWeights = engine.injectNoise(originalWeights, 4);

      expect(noisyWeights).toHaveLength(10);
      expect(noisyWeights[0]).not.toBe(originalWeights[0]); // Noise should be added

      const loss = engine.computePrivacyLoss(10, 1e-5);
      expect(loss.epsilon).toBeGreaterThan(0);
      expect(loss.delta).toBe(1e-5);
    });
  });

  describe("DiagnosticNeuralNetwork", () => {
    it("should produce valid sigmoid-bound predictions in a forward pass", () => {
      const model = new DiagnosticNeuralNetwork("DenseNet-121");
      const features = new Array(256).fill(0).map(() => Math.random());
      const out = model.forward(features);

      expect(out).toHaveLength(1);
      expect(out[0]).toBeGreaterThanOrEqual(0.0);
      expect(out[0]).toBeLessThanOrEqual(1.0);
    });

    it("should compute mathematical BCE and local train steps", () => {
      const model = new DiagnosticNeuralNetwork("DenseNet-121");
      const batchFeatures = [
        new Array(256).fill(0.1),
        new Array(256).fill(0.2)
      ];
      const batchLabels = [[1.0], [0.0]];

      const initialWeights = new Float32Array(model.weights);
      const stepResult = model.localTrainStep(batchFeatures, batchLabels, 0.1);

      expect(stepResult.loss).toBeGreaterThan(0);
      expect(stepResult.gradients.length).toBe(model.weights.length);
      // Weights must have changed under gradient descent updates
      expect(model.weights[0]).not.toBe(initialWeights[0]);
    });
  });
});
