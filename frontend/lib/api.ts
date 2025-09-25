const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

type FetchOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  authKey?: string | null;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, authKey } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authKey ? { "X-API-Key": authKey } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail?.detail ?? response.statusText);
  }

  return (await response.json()) as T;
}

export interface LoginResponse {
  key_id: string;
  user_id: string;
  allow_model_selection: boolean;
  default_model: string;
}

export async function loginWithKey(key: string) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: { key_value: key }
  });
}
