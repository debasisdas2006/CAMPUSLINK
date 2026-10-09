import api from "./api";

export async function applyForJob(data) {
  const response = await api.post(
    "/applications/",
    data
  );

  return response.data;
}

export async function getMyApplications() {
  const response = await api.get(
    "/applications/my-applications"
  );

  return response.data;
}

export async function getRecruiterApplications() {
  const response = await api.get(
    "/applications/recruiter/my-applications"
  );

  return response.data;
}

export async function updateApplicationStatus(
  applicationId,
  data
) {
  const response = await api.patch(
    `/applications/${applicationId}/status`,
    data
  );

  return response.data;
}