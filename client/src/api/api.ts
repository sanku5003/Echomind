const API_URL = "http://localhost:5000/api";

export const api = async (
  endpoint: string,
  method: string = "GET",
  data?: any
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: data ? JSON.stringify(data) : undefined
  });

  if (!res.ok) {
    throw new Error("API Error");
  }

  return res.json();
};
