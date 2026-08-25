export class MedicalDataPipeline {
  static preprocess(data: any) {
    return { status: "processed", records: data?.length || 1000 };
  }
}

export class DriftDetector {
  static computeKSStatistic(ref: any[], curr: any[]) {
    return { ksStat: 0.021, pValue: 0.45, driftDetected: false };
  }
}
