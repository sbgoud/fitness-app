import { NextResponse } from 'next/server';

export function middleware(request) {
  const currentUser = request.cookies.get('currentUser')?.value;
  const url = request.nextUrl.clone();

  if (!currentUser && url.pathname !== '/login') {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (currentUser && url.pathname === '/login') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}