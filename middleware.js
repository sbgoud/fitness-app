import { NextResponse } from 'next/server';

export function middleware(request) {
  const currentUser = request.cookies.get('currentUser')?.value;
  const url = request.nextUrl;

  // Skip API routes and public files
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('.') ||
    url.pathname === '/master' // Add this
  ) {
    return NextResponse.next();
  }

  if (!currentUser && url.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (currentUser && url.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

