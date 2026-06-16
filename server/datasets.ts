/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// -------------------------------------------------------------
// HEALTHCARE DATASETS INGESTION & FEATURE ENGINEERING (Upgrade 2)
// -------------------------------------------------------------

export interface DiagnosticPatientSample {
  id: string;
  features: number[];
  labels: number[];
}

export class MedicalDataPipeline {
  /**
   * Helper to execute robust preprocessing, imputation of missing parameters,
   * standard scale normalization and feature engineering for clinical variables.
   * Outputs a 15-dimensional features vector suitable for LSTM, Transformer, and TabTransformer.
   */
  private static engineerFeatures(
    age: number,
    gender: number, // 0: female, 1: male
    admissionType: number, // 0: emergency, 1: urgent, 2: elective
    sysBP: number,
    diasBP: number,
    hr: number,
    temp: number,
    o2Sat: number,
    creatinine: number,
    bun: number,
    lacticAcid: number
  ): number[] {
    // 1. Missing Value Imputation (Clinical median fallbacks)
    const cleanSysBP = sysBP || 118.0;
    const cleanDiasBP = diasBP || 70.0;
    const cleanHr = hr || 80.0;
    const cleanTemp = temp || 37.0;
    const cleanO2 = o2Sat || 96.5;
    const cleanCreat = creatinine || 1.25;
    const cleanBun = bun || 22.0;
    const cleanLac = lacticAcid || 1.7;

    // 2. Feature Engineering
    // Mean Arterial Pressure (MAP) = (systolic + 2 * diastolic) / 3
    const map = (cleanSysBP + 2 * cleanDiasBP) / 3.0;

    // Shock Index = heart_rate / systolic_bp
    const shockIndex = cleanHr / (cleanSysBP + 1e-5);

    // BUN-to-Creatinine Ratio
    const bunCreatRatio = cleanBun / (cleanCreat + 1e-5);

    // Dynamic SOFA score proxy (Sequential Organ Failure Assessment)
    const sofaRespiratory = cleanO2 < 90 ? 2 : (cleanO2 < 95 ? 1 : 0);
    const sofaRenal = cleanCreat >= 2.0 ? 2 : (cleanCreat >= 1.2 ? 1 : 0);
    const sofaCV = map < 70 ? 2 : (cleanSysBP < 100 ? 1 : 0);
    const sofaScore = sofaRespiratory + sofaRenal + sofaCV;

    // 3. Coordinate standardization / normalization mapping z-scores
    const normAge = (age - 64.0) / 12.0;
    const normSys = (cleanSysBP - 115.0) / 15.0;
    const normDias = (cleanDiasBP - 68.0) / 10.0;
    const normHr = (cleanHr - 82.0) / 15.0;
    const normTemp = (cleanTemp - 37.0) / 1.0;
    const normO2 = (cleanO2 - 95.0) / 4.0;
    const normCreat = (cleanCreat - 1.3) / 0.6;
    const normBun = (cleanBun - 25.0) / 12.0;
    const normLac = (cleanLac - 1.8) / 0.8;
    const normMap = (map - 85.0) / 12.0;
    const normShock = (shockIndex - 0.7) / 0.2;
    const normRatio = (bunCreatRatio - 20.0) / 8.0;
    const normSofa = (sofaScore - 1.5) / 1.0;

    return [
      normAge,
      gender,
      admissionType,
      normSys,
      normDias,
      normHr,
      normTemp,
      normO2,
      normCreat,
      normBun,
      normLac,
      normMap,
      normShock,
      normRatio,
      normSofa
    ];
  }

  // Ingests & Preprocesses MIMIC-IV EHR medical records
  public static preprocessMIMIC(rawRecords: any[]): DiagnosticPatientSample[] {
    return rawRecords.map((record, index) => {
      const age = record.age || 65;
      const gender = record.gender !== undefined ? record.gender : (Math.random() > 0.5 ? 1 : 0);
      const admissionType = record.admission_type !== undefined ? record.admission_type : 0;
      const sysBP = record.systolic_bp || 120;
      const diasBP = record.diastolic_bp || 80;
      const hr = record.heart_rate || 75;
      const temp = record.temperature || 36.8;
      const o2Sat = record.oxygen_sat || 98;
      const creatinine = record.creatinine || 1.4;
      const bun = record.bun || 28;
      const lacticAcid = record.lactic_acid || 1.8;

      const features = this.engineerFeatures(
        age, gender, admissionType, sysBP, diasBP, hr, temp, o2Sat, creatinine, bun, lacticAcid
      );

      // Label definition: Mortality occurrence
      // High SOFA score (> 3), severe lactic acid (> 3) creates high risk
      const mapVal = (sysBP + 2 * diasBP) / 3.0;
      const isRiskMortality = (mapVal < 70 && lacticAcid > 3.0) || (age > 78 && o2Sat < 90) ? 1 : 0;

      return {
        id: `mimic_pt_${index}`,
        features,
        labels: [isRiskMortality]
      };
    });
  }

  // Preprocesses eICU physiological stream waveforms
  public static preprocessEICU(rawSignals: any[]): DiagnosticPatientSample[] {
    return rawSignals.map((sig, index) => {
      const age = sig.age || 62;
      const gender = sig.gender !== undefined ? sig.gender : (Math.random() > 0.58 ? 1 : 0);
      const admissionType = sig.admission_type !== undefined ? sig.admission_type : 1; // Standard Urgent
      const sysBP = sig.systolic_bp || 105;
      const diasBP = sig.diastolic_bp || 60;
      const hr = sig.heart_rate || 96;
      const temp = sig.temperature || 38.2;
      const o2Sat = sig.oxygen_sat || 91;
      const creatinine = sig.creatinine || 1.9;
      const bun = sig.bun || 32;
      const lacticAcid = sig.lactic_acid || 3.4;

      const features = this.engineerFeatures(
        age, gender, admissionType, sysBP, diasBP, hr, temp, o2Sat, creatinine, bun, lacticAcid
      );

      const isRiskMortality = (lacticAcid > 2.5 && hr > 105) || (creatinine > 2.2) ? 1 : 0;

      return {
        id: `eicu_pt_${index}`,
        features,
        labels: [isRiskMortality]
      };
    });
  }

  // Radiographics Pipeline (CheXpert / NIH Chest X-Ray) pixel standardizer
  public static preprocessCheXpert(rawImages: any[]): DiagnosticPatientSample[] {
    return rawImages.map((img, index) => {
      // For CheXpert patient partitions, demographic features are extracted
      const age = img.age || 70;
      const gender = img.gender !== undefined ? img.gender : 1;
      const admissionType = img.admission_type !== undefined ? img.admission_type : 0;
      const sysBP = img.systolic_bp || 116;
      const diasBP = img.diastolic_bp || 72;
      const hr = img.heart_rate || 84;
      const temp = img.temperature || 37.1;
      const o2Sat = img.oxygen_sat || 88; // Lower oxygenation due to pulmonary consolidations
      const creatinine = img.creatinine || 1.1;
      const bun = img.bun || 20;
      const lacticAcid = img.lactic_acid || 1.5;

      const features = this.engineerFeatures(
        age, gender, admissionType, sysBP, diasBP, hr, temp, o2Sat, creatinine, bun, lacticAcid
      );

      const isRiskMortality = o2Sat < 86 ? 1 : 0;

      return {
        id: `chexpert_pt_${index}`,
        features,
        labels: [isRiskMortality]
      };
    });
  }
}

// -------------------------------------------------------------
// DECENTRALIZED DATA DRIFT DETECTION ENGINE (Upgrade 8)
// -------------------------------------------------------------
export class DriftDetector {
  // Kolmogorov-Smirnov Test (Two-Sample non-parametric verification)
  public static kolmogorovSmirnovTest(baseline: number[], live: number[]): { testStatistic: number, pValue: number, hasDrift: boolean } {
    if (baseline.length === 0 || live.length === 0) {
      return { testStatistic: 0, pValue: 1.0, hasDrift: false };
    }

    const sortedBaseline = [...baseline].sort((a, b) => a - b);
    const sortedLive = [...live].sort((a, b) => a - b);

    let maxDistance = 0;
    let i = 0, j = 0;
    while (i < sortedBaseline.length && j < sortedLive.length) {
      const valB = sortedBaseline[i];
      const valL = sortedLive[j];

      const cdfB = (i + 1) / sortedBaseline.length;
      const cdfL = (j + 1) / sortedLive.length;

      const diff = Math.abs(cdfB - cdfL);
      if (diff > maxDistance) {
        maxDistance = diff;
      }

      if (valB < valL) {
        i++;
      } else {
        j++;
      }
    }

    const n1 = sortedBaseline.length;
    const n2 = sortedLive.length;
    const criticalValue = 1.36 * Math.sqrt((n1 + n2) / (n1 * n2));
    const pValue = Math.exp(-2 * maxDistance * maxDistance * (n1 * n2) / (n1 + n2));

    return {
      testStatistic: parseFloat(maxDistance.toFixed(4)),
      pValue: parseFloat(pValue.toFixed(5)),
      hasDrift: maxDistance > criticalValue
    };
  }

  // Population Stability Index (PSI)
  public static calculatePSI(expected: number[], actual: number[], numBins = 10): { psi: number, driftLevel: 'stable' | 'modest_drift' | 'severe_drift' } {
    if (expected.length === 0 || actual.length === 0) {
      return { psi: 0, driftLevel: 'stable' };
    }

    const sortedExpected = [...expected].sort((a, b) => a - b);
    const binBoundaries: number[] = [];
    for (let b = 1; b < numBins; b++) {
      const idx = Math.floor((b / numBins) * sortedExpected.length);
      binBoundaries.push(sortedExpected[idx]);
    }

    const getBinCounts = (values: number[]) => {
      const counts = new Array(numBins).fill(0);
      values.forEach(v => {
        let placed = false;
        for (let b = 0; b < binBoundaries.length; b++) {
          if (v <= binBoundaries[b]) {
            counts[b]++;
            placed = true;
            break;
          }
        }
        if (!placed) {
          counts[numBins - 1]++;
        }
      });
      return counts;
    };

    const expCounts = getBinCounts(expected);
    const actCounts = getBinCounts(actual);

    let totalPSI = 0;
    const eps = 1e-5;

    for (let i = 0; i < numBins; i++) {
      const expPct = Math.max(eps, expCounts[i] / expected.length);
      const actPct = Math.max(eps, actCounts[i] / actual.length);

      const binPSI = (actPct - expPct) * Math.log(actPct / expPct);
      totalPSI += binPSI;
    }

    const psiValue = parseFloat(totalPSI.toFixed(4));
    let driftLevel: 'stable' | 'modest_drift' | 'severe_drift' = 'stable';
    
    if (psiValue >= 0.25) {
      driftLevel = 'severe_drift';
    } else if (psiValue >= 0.1) {
      driftLevel = 'modest_drift';
    }

    return {
      psi: psiValue,
      driftLevel
    };
  }
}
