import api from "./api";

export async function getAvailableJobs() {
  const response = await api.get("/jobs/available");
  return response.data;
}

export async function getMyJobs() {
  const response = await api.get("/jobs/my-jobs");
  return response.data;
}

export async function getJobEligibility(jobId) {
  const response = await api.get(
    `/jobs/${jobId}/eligibility`
  );

  return response.data;
}

export async function getJobs() {
  const response = await api.get("/jobs/");
  return response.data;
}

export async function createJob(data) {
  const response = await api.post("/jobs/", data);
  return response.data;
}