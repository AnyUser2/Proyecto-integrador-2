const API_URL = (
  globalThis.__APP_CONFIG__?.apiUrl ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api'
).replace(/\/$/, '');

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`No se pudo conectar con la API en ${API_URL}. Verifica que el backend esté iniciado.`);
  }

  const result = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.mensaje || result?.message || `La solicitud falló (${response.status}).`);
  }

  return result;
}

export async function listResource(endpoint) {
  const result = await request(`/${endpoint}`);
  return result?.datos ?? [];
}

export async function saveResource(endpoint, id, values) {
  const method = id ? 'PUT' : 'POST';
  const path = id ? `/${endpoint}/${id}` : `/${endpoint}`;
  return request(path, { method, body: JSON.stringify(values) });
}

export async function deleteResource(endpoint, id) {
  return request(`/${endpoint}/${id}`, { method: 'DELETE' });
}
