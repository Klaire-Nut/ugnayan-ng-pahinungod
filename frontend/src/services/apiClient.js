export async function apiClient(url, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  // Accept success status (200–299 including 201)
  if (res.status >= 400) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw err;
  }

  // If no JSON returned (e.g., DELETE 204)
  if (res.status === 204) return {};

  return res.json();
}
