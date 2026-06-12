type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(res.status, error.message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: unknown) => request<T>(url, { method: "POST", body }),
  patch: <T>(url: string, body: unknown) => request<T>(url, { method: "PATCH", body }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};

export { ApiError };
