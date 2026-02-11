import { api } from "./api";

export const login = async (email: string, password: string) => {
  const res = await api("/auth/login", "POST", { email, password });
  localStorage.setItem("token", res.token);
  return res;
};

export const signup = async (email: string, password: string) => {
  await api("/auth/register", "POST", { email, password });
  return login(email, password);
};

export const logout = () => {
  localStorage.removeItem("token");
};
