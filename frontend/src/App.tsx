import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EnterpriseLayout from './layouts/EnterpriseLayout';
import ExecutiveCommandCenter from './pages/ExecutiveCommandCenter';
import ModelGovernanceStudio from './pages/ModelGovernanceStudio';
// Import other pages...

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EnterpriseLayout />}>
          <Route index element={<ExecutiveCommandCenter />} />
          <Route path="network" element={<div className="text-white">Network Ops Center (Coming Soon)</div>} />
          <Route path="governance" element={<ModelGovernanceStudio />} />
          <Route path="privacy" element={<div className="text-white">Privacy Intelligence (Coming Soon)</div>} />
          <Route path="data" element={<div className="text-white">Data Hub (Coming Soon)</div>} />
          <Route path="security" element={<div className="text-white">SecOps Center (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;