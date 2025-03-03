import { NextResponse } from 'next/server';

export function middleware(request) {
  const currentUser = request.cookies.get('currentUser')?.value;
  
  if (!currentUser && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (currentUser && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}