import api from "./api";

export async function getMyNotifications() {
  const response = await api.get(
    "/notifications/my-notifications"
  );

  return response.data;
}

export async function markNotificationRead(
  notificationId
) {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
}