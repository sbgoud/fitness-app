import { NextResponse } from 'next/server';

export function middleware(request) {
  const currentUser = request.cookies.get('currentUser')?.value;
  const { pathname } = request.nextUrl;

  // Allow API routes
  if (pathname.startsWith('/api')) return NextResponse.next();

  if (!currentUser && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (currentUser && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}