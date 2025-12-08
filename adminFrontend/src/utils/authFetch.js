import { BASE_URL } from "../services/api";

export function getAuthHeaders(extra = {}) {
  let userId = "";

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.id) userId = user.id;
  } catch {}

  return {
    "Content-Type": "application/json",
    "x-user-id": userId,  // backend requires this
    ...extra,
  };
}

export async function authFetch(path, options = {}) {
  const headers = getAuthHeaders(options.headers || {});

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: options.credentials ?? "include",
  });
}
