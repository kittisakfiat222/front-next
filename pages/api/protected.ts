import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge', // Use Edge Runtime
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return new NextResponse(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const sessionCookie = req.cookies.get('session'); // Use the cookies API for Edge
    const tokenCookie = req.cookies.get('token');
    
    console.log(tokenCookie);
    if (!sessionCookie) {
      return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    

    return new NextResponse(
      JSON.stringify({
        user: {
          id: sessionData.id,
          username: sessionData.username,
        },
        token : tokenCookie
       
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
