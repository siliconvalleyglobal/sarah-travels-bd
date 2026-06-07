const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export async function api<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...fetchOptions } = options ?? {};
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers ?? {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
      ...(fetchOptions.method ? {} : { cache: "no-store" }),
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${API_URL}. Start the backend with \`pnpm dev\` from the project root.`,
    );
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "API request failed");
  }

  return res.json();
}

export { API_URL };
