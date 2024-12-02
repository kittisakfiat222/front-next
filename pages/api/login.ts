import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge', // Use Edge Runtime
};



export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new NextResponse(JSON.stringify({ message: 'Username and Password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward the request to the external API
    const externalResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!externalResponse.ok) {
      return new NextResponse(JSON.stringify({ message: 'Invalid username or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // console.log(externalResponse.json());
    const user = await externalResponse.json();

    // Prepare session data
    const sessionData = {
      id: user.user.id,
      username: user.user.username,
    };

    const userId:String = user.id;

    // Create a response with a session cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: { username: user.username },
    });


    response.cookies.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    response.cookies.set('token' , user.token);
    response.cookies.set('userId' , user.user.id);
    

    return response;
  } catch (error) {
    console.error('Error during login:', error);

    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
