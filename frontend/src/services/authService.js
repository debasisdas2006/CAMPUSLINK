import api from "./api";

export async function loginUser(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const data = response.data;

  if (data.access_token) {
    localStorage.setItem("campuslink_token", data.access_token);
  }

  return data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");

  const user = response.data;

  localStorage.setItem(
    "campuslink_user",
    JSON.stringify(user)
  );

  return user;
}

export function logoutUser() {
  localStorage.removeItem("campuslink_token");
  localStorage.removeItem("campuslink_user");
}

export function getToken() {
  return localStorage.getItem("campuslink_token");
}

export function isAuthenticated() {
  return Boolean(
    localStorage.getItem("campuslink_token")
  );
}