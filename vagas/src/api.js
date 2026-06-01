import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8002').replace(/\/$/, '');

export async function fetchCompanyPortal(companySlug) {
  const response = await axios.get(`${API_URL}/api/companies/portal/${companySlug}`);
  return response.data;
}

export async function fetchPublicJob(companySlug, jobSlug) {
  const response = await axios.get(`${API_URL}/api/jobs/public/company/${companySlug}/${jobSlug}`);
  return response.data;
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await axios.post(`${API_URL}/api/arquivos/resume`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.url;
}

export async function submitPublicApplication(payload) {
  const response = await axios.post(`${API_URL}/api/job-applications/public-apply`, payload);
  return response.data;
}
