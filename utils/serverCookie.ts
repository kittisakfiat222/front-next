import { NextRequest, NextResponse } from 'next/server';

// Helper to get cookies from the request
export const getServerCookie = (req: NextRequest, name: string): string | null => {
  const cookieStore = req.cookies.get(name);
  // If the cookie exists, return its value; otherwise, return null
  return cookieStore ? cookieStore.value : null;
};

// Helper to set cookies in the response (Edge API)
export const setServerCookie = (
  res: NextResponse,
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
  res.cookies.set(name, value, options);
};

// Helper to delete cookies (Edge API)
export const deleteServerCookie = (res: NextResponse, name: string) => {
  res.cookies.set(name, '', { expires: new Date(0) });
};
