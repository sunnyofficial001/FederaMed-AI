export const postgresDb = {
  async query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[] }> {
    if (sql.includes('hospital_metadata') || sql.includes('HOSPITAL_METADATA')) {
      return {
        rows: [
          { id: 'hosp_a', name: 'Metro General Hospital', location: 'New York, USA', dataset_name: 'EHR-MIMIC-IV', size: 24500, latency_ms: 24 },
          { id: 'hosp_b', name: 'St. Jude Research Clinic', location: 'London, UK', dataset_name: 'NHS-Diabetes-UK', size: 18200, latency_ms: 42 },
          { id: 'hosp_c', name: 'Tokyo Medical Center', location: 'Tokyo, Japan', dataset_name: 'J-Health-DB', size: 31000, latency_ms: 88 },
          { id: 'hosp_d', name: 'Charité Universitätsmedizin', location: 'Berlin, Germany', dataset_name: 'EU-EHR-Standard', size: 19800, latency_ms: 35 }
        ] as any
      };
    }
    if (sql.includes('audit_logs') || sql.includes('AUDIT_LOGS')) {
      return {
        rows: [
          { id: '1', timestamp: new Date().toISOString(), action: 'INITIALIZE_FEDERATION', user: 'system.admin', details: 'Federated network initialized' }
        ] as any
      };
    }
    if (sql.includes('model_metadata') || sql.includes('MODEL_METADATA')) {
      return {
        rows: [
          { version: 'v1.2.0-candidate', name: 'DenseNet-121', status: 'Production', weights: Buffer.from(new Float32Array(128).fill(0.1).buffer).toString('base64') },
          { version: 'v1.1.0', name: 'DenseNet-121', status: 'Archived', weights: Buffer.from(new Float32Array(128).fill(0.05).buffer).toString('base64') }
        ] as any
      };
    }
    return { rows: [] as any };
  }
};

const cache = new Map<string, any>();

export const redisCache = {
  get(key: string) {
    return cache.get(key) || null;
  },
  set(key: string, value: any) {
    cache.set(key, value);
  },
  del(key: string) {
    cache.delete(key);
  }
};
