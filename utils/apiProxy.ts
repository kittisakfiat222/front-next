// utils/apiProxy.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'; // Updated default port

interface FetchOptions extends RequestInit {
  token?: string; // Optional Authorization token
}

const apiProxy = async <T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const { token, ...fetchOptions } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => null);
      const errorMessage = errorResponse?.message || response.statusText;
      console.error(`API Error: ${response.status} - ${errorMessage}`);
      throw new Error(`API Error: ${response.status} - ${errorMessage}`);
    }

    return response.json() as Promise<T>;
  } catch (error: any) {
    console.error('API Proxy Error:', error.message || error);
    throw new Error(error.message || 'Unknown API Proxy Error');
  }
};

export default apiProxy;
