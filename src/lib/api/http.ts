export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function postJson<TResponse, TBody>(
  url: string,
  body: TBody,
  init?: RequestInit
): Promise<TResponse> {
  const res = await fetch(url, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => null)) as TResponse & {
    error?: string;
    errors?: string[];
  };

  if (!res.ok) {
    throw new ApiError(data?.error || "Request failed.", res.status, data?.errors);
  }

  return data;
}
