export async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export async function patchJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await safeError(res)
    throw new Error(msg)
  }
  return (await res.json()) as T
}

export async function putJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await safeError(res)
    throw new Error(msg)
  }
  return (await res.json()) as T
}

async function safeError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data && data.error ? String(data.error) : res.statusText;
  } catch {
    return res.statusText;
  }
}
