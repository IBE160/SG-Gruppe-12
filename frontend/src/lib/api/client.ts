// frontend/src/lib/api/client.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { skipAuth = false, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...fetchOptions,
    credentials: 'include', // Always include cookies for JWT auth
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  };

  // Remove Content-Type for FormData (browser sets it automatically with boundary)
  if (fetchOptions.body instanceof FormData) {
    const headers = config.headers as Record<string, string>;
    delete headers['Content-Type'];
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
};

export { API_BASE_URL };
