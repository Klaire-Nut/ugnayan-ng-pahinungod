// apiClient.js
export async function apiClient(url, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  // Build headers, only include Authorization if token exists
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method: method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  // If the response is not ok, try to parse JSON first; if that fails return text
  if (!res.ok) {
    // Some endpoints return empty body (204/204). Handle that.
    let errBody;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      errBody = await res.json().catch(() => ({ detail: res.statusText }));
    } else {
      // fallback to text (useful for HTML error pages / plain messages)
      errBody = await res.text().catch(() => res.statusText);
    }

    // Throw a JS Error-like object but include server data so callers can react
    const err = {
      status: res.status,
      ok: res.ok,
      body: errBody,
    };
    throw err;
  }

  // If no content (204/205) return null
  if (res.status === 204 || res.status === 205) {
    return null;
  }

  // Parse JSON (if present)
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }

  // fallback to text
  return res.text();
}
