const API_BASE = import.meta.env.VITE_API_URL || "";

export function startDownload(url, options = {}) {
  return fetch(`${API_BASE}/api/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, options }),
  });
}

export function getHealth() {
  return fetch(`${API_BASE}/health`).then((r) => r.json());
}
