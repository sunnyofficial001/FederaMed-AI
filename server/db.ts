export const postgresDb = {
  async query(sql: string, params?: any[]) {
    if (sql.includes('hospital_metadata')) {
      return {
        rows: [
          { id: 'hosp_a', name: 'Metro General Hospital', location: 'New York, USA', dataset_name: 'EHR-MIMIC-IV', size: 24500, latency_ms: 24 },
          { id: 'hosp_b', name: 'St. Jude Research Clinic', location: 'London, UK', dataset_name: 'NHS-Diabetes-UK', size: 18200, latency_ms: 42 },
          { id: 'hosp_c', name: 'Tokyo Medical Center', location: 'Tokyo, Japan', dataset_name: 'J-Health-DB', size: 31000, latency_ms: 88 },
          { id: 'hosp_d', name: 'Charité Universitätsmedizin', location: 'Berlin, Germany', dataset_name: 'EU-EHR-Standard', size: 19800, latency_ms: 35 }
        ]
      };
    }
    if (sql.includes('audit_logs')) {
      return {
        rows: [
          { id: '1', timestamp: new Date().toISOString(), action: 'INITIALIZE_FEDERATION', user: 'system.admin', details: 'Federated network initialized' }
        ]
      };
    }
    if (sql.includes('model_metadata')) {
      return { rows: [] };
    }
    return { rows: [] };
  }
};

const cache = new Map<string, any>();

export const redisCache = {
  get(key: string) {
    return cache.get(key) || null;
  },
  set(key: string, value: any) {
    cache.set(key, value);
  }
};
