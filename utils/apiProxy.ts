// utils/apiProxy.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'; // Updated default port

interface FetchOptions extends RequestInit {
  token?: string; // Optional Authorization token
}

const apiProxy = async (endpoint: string, options: FetchOptions = {}) => {
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
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Proxy Error:', error);
    throw error;
  }
};

export default apiProxy;