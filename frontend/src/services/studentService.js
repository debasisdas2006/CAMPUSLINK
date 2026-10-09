import api from "./api";

export async function getStudentProfile() {
  const response = await api.get("/students/profile");
  return response.data;
}

export async function updateStudentProfile(data) {
  const response = await api.put(
    "/students/profile",
    data
  );

  return response.data;
}

export async function uploadStudentResume(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/students/resume",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export default {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentResume,
};