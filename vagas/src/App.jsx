import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CompanyPortalPage from './pages/CompanyPortalPage';
import JobDetailsPage from './pages/JobDetailsPage';
import { getTalentosCompanySlug } from './host';

export default function App() {
  const talentosCompanySlug = getTalentosCompanySlug();

  if (talentosCompanySlug) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<CompanyPortalPage forcedCompanySlug={talentosCompanySlug} />} />
          <Route path="/vaga/:jobSlug" element={<JobDetailsPage forcedCompanySlug={talentosCompanySlug} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/:companySlug" element={<CompanyPortalPage />} />
        <Route path="/:companySlug/vaga/:jobSlug" element={<JobDetailsPage />} />
        <Route path="*" element={<Navigate to="/demo-empresa" replace />} />
      </Routes>
    </Router>
  );
}
