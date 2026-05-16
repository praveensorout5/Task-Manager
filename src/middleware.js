import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // Public paths — no auth needed
  const publicPaths = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/signup'];
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'));
  
  // Static assets
  const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/favicon');

  if (isPublic || isStatic) {
    // If user is authenticated and trying to access login/signup, redirect to dashboard
    if (token && (pathname === '/login' || pathname === '/signup')) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } catch {
        // Token invalid, let them proceed to login
      }
    }
    return NextResponse.next();
  }

  // Root path — redirect based on auth
  if (pathname === '/') {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } catch {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Protected paths — require auth
  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Inject user info into request headers for API routes
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    // Invalid token
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Clear invalid cookie and redirect
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.set('token', '', { httpOnly: true, expires: new Date(0), path: '/' });
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
