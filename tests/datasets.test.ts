import { describe, it, expect } from "vitest";
import { MedicalDataPipeline, DriftDetector } from "../server/datasets";

describe("Healthcare Dataset Ingestion & Drift Engines", () => {
  describe("MedicalDataPipeline Ingestion", () => {
    it("should transform Raw MIMIC records into 256-dimensional standardised samples", () => {
      const rawRecords = [
        { age: 55, systolic_bp: 110, diastolic_bp: 75, oxygen_sat: 96, blood_ph: 7.38 },
        { age: 72, systolic_bp: 140, diastolic_bp: 90, oxygen_sat: 92, blood_ph: 7.32 }
      ];

      const processed = MedicalDataPipeline.preprocessMIMIC(rawRecords);
      expect(processed).toHaveLength(2);
      expect(processed[0].id).toBe("mimic_pt_0");
      expect(processed[0].features).toHaveLength(256);
      expect(processed[0].labels).toHaveLength(1);
    });

    it("should process eICU signal data arrays properly", () => {
      const rawSignals = [
        { heart_rates: [70, 72, 75, 74], temperatures: [36.5, 36.8, 37.0] },
        { heart_rates: [110, 115, 120, 108], temperatures: [38.8, 39.0, 39.2] }
      ];

      const processed = MedicalDataPipeline.preprocessEICU(rawSignals);
      expect(processed).toHaveLength(2);
      expect(processed[0].features).toHaveLength(120);
      expect(processed[1].labels[0]).toBe(1); // Sepsis risk triggers high
    });

    it("should process CheXpert radiographic properties", () => {
      const rawImages = [
        { has_pneumonia: true, pneumonia_evidence_level: 0.8, pixels: new Float32Array(50) }
      ];

      const processed = MedicalDataPipeline.preprocessCheXpert(rawImages);
      expect(processed).toHaveLength(1);
      expect(processed[0].labels[0]).toBe(1);
      expect(processed[0].features).toHaveLength(256);
    });
  });

  describe("DriftDetector (Kolmogorov-Smirnov & Population Stability Index)", () => {
    it("should execute two-sample Kolmogorov-Smirnov distribution check", () => {
      const baseline = [1.2, 1.4, 1.5, 1.6, 1.8, 2.0];
      const liveNoDrift = [1.25, 1.35, 1.55, 1.65, 1.75, 1.95];
      const liveDrifted = [2.5, 2.8, 3.1, 3.4, 3.7, 4.0];

      const resultStable = DriftDetector.kolmogorovSmirnovTest(baseline, liveNoDrift);
      const resultDrifted = DriftDetector.kolmogorovSmirnovTest(baseline, liveDrifted);

      expect(resultStable.pValue).toBeGreaterThan(0.05);
      expect(resultDrifted.pValue).toBeLessThan(0.05);
      expect(resultDrifted.testStatistic).toBeGreaterThan(resultStable.testStatistic);
    });

    it("should calculate correct bin-wise Population Stability Index", () => {
      const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const actualStable = [1.1, 1.9, 3.2, 4.0, 4.8, 6.1, 7.0, 8.2, 8.9, 9.8];
      const actualDrifted = [12, 14, 15, 16, 17, 18, 19, 20, 21, 22];

      const stablePSI = DriftDetector.calculatePSI(expected, actualStable, 5);
      const driftedPSI = DriftDetector.calculatePSI(expected, actualDrifted, 5);

      expect(stablePSI.psi).toBeLessThan(0.1);
      expect(stablePSI.driftLevel).toBe("stable");
      
      expect(driftedPSI.psi).toBeGreaterThan(0.25);
      expect(driftedPSI.driftLevel).toBe("severe_drift");
    });
  });
});
