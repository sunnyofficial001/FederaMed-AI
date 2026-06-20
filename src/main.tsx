import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import ExecutivePage from './pages/ExecutivePage';
import FederatedPage from './pages/FederatedPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ExplainabilityPage from './pages/ExplainabilityPage';
import MonitoringPage from './pages/MonitoringPage';
import GovernancePage from './pages/GovernancePage';
import PredictionPage from './pages/PredictionPage';
import ArchitecturePage from './pages/ArchitecturePage';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ExecutivePage />} />
              <Route path="/federated" element={<FederatedPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/explain" element={<ExplainabilityPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/governance" element={<GovernancePage />} />
              <Route path="/predict" element={<PredictionPage />} />
              <Route path="/architecture" element={<ArchitecturePage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
