import client from "./client";

export async function login(email, password) {
  const { data } = await client.post("/auth/token/", { email, password });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

export async function register(payload) {
  const { data } = await client.post("/auth/register/", payload);
  return data;
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}
