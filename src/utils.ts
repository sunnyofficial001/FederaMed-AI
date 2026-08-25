// Shared API base URL and fetch helpers
export const API = import.meta.env.VITE_API_URL || '';

export const apiFetch = async (endpoint: string, fallback: unknown) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const urlsToTry = [
    `${API}${cleanEndpoint}`,
    `${API}/api${cleanEndpoint}`
  ];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data !== null && data !== undefined) return data;
      }
      const text = await res.text();
      try {
        const parsed = JSON.parse(text);
        if (parsed !== null && parsed !== undefined) return parsed;
      } catch {
        continue;
      }
    } catch {
      continue;
    }
  }

  return fallback;
};

// Chart tooltip style (reused everywhere)
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '12px',
  },
  labelStyle: { color: '#94a3b8' },
};

// Colour palette
export const COLORS = {
  blue:   '#3b82f6',
  green:  '#10b981',
  amber:  '#f59e0b',
  purple: '#a78bfa',
  pink:   '#fb7185',
  cyan:   '#06b6d4',
  red:    '#ef4444',
  indigo: '#6366f1',
};

export const CHART_COLORS = [
  '#3b82f6','#10b981','#a78bfa','#f59e0b','#fb7185','#06b6d4','#6366f1',
];

// Status indicator helper
export const statusColor = (s: string) =>
  s === 'stable' || s === 'healthy' || s === 'online' ? '#10b981' :
  s === 'watch'  || s === 'warning'                   ? '#f59e0b' :
  '#ef4444';
