// Check if we're running in the browser (client-side) or on the server (SSR/Edge)
const isClientSide = typeof window !== 'undefined';

// Helper to get cookies (Client-Side & Server-Side)
export const getCookie = (name: string): string | null => {
  if (isClientSide) {
    // Client-side: Use document.cookie
    const cookieString = document.cookie;
    const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  // Server-side: Cookies should be passed via request headers in Next.js
  return null; // You can implement server-side cookie parsing if needed, or leave it for API routes
};

// Helper to set cookies (Client-Side)
export const setCookie = (
  name: string,
  value: string,
  options: {
    maxAge?: number;
    expires?: Date;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
  } = {}
) => {
  if (isClientSide) {
    const cookieOptions = {
      path: '/',
      ...options,
    };

    // Set the cookie
    document.cookie = `${name}=${value}; ${Object.entries(cookieOptions)
      .map(([key, val]) => `${key}=${val}`)
      .join('; ')}`;
  }
};

// Helper to delete cookies (Client-Side)
export const deleteCookie = (name: string) => {
  setCookie(name, '', { expires: new Date(0) });
};
