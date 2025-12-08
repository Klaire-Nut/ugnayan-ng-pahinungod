export async function apiClient(url, method = "GET", body = null) {
  const token = localStorage.getItem("token"); // ⭐ Fetch token

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`; // ⭐ Add token
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  if (res.ok) {
    return res.json();
  }

  const errorText = await res.text();
  throw new Error(`API Error ${res.status}: ${errorText}`);
}
