import api from "./api";

export async function getPracticeQuestions({
  skill,
  count = 5,
}) {
  const response = await api.get(
    "/tests/questions",
    {
      params: {
        skill,
        count,
      },
    }
  );

  return response.data;
}

export default api;