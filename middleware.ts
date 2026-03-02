import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse, type NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const session = await auth();
  const user = session?.user;
  const userRole = user?.role ? user.role.toUpperCase() : null;

  const protectedRoutes: { [key: string]: string[] } = {
    '/dashboard/buyer': ['BUYER'],
    '/dashboard/trader': ['TRADER'],
    '/dashboard/transporter': ['TRANSPORTER'],
    '/dashboard/wholesaler': ['WHOLESALER'],
    '/admin': ['ADMIN'],
    '/marketplace': ['BUYER'],
    '/products/add': ['TRADER'],
    '/products/manage': ['TRADER'],
    '/products/edit': ['TRADER'],
    '/orders/received': ['TRADER'],
    '/orders/create': ['BUYER'],
    '/cart': ['BUYER'],
    '/checkout': ['BUYER'],
    '/payment': ['BUYER'],
    '/wishlist': ['BUYER'],
    '/orders': ['BUYER'],
    '/transporter/available-deliveries': ['TRANSPORTER'],
    '/transporter/my-deliveries': ['TRANSPORTER'],
  };

  const isProtectedRoute = Object.keys(protectedRoutes).some(route => {
    if (route.endsWith('/:id')) {
      const baseRoute = route.substring(0, route.lastIndexOf('/'));
      return pathname.startsWith(baseRoute);
    }
    return pathname === route;
  });

  if (isProtectedRoute) {
    const requiredRoles = Object.entries(protectedRoutes).find(([route]) => {
      if (route.endsWith('/:id')) {
        const baseRoute = route.substring(0, route.lastIndexOf('/'));
        return pathname.startsWith(baseRoute);
      }
      return pathname === route;
    })?.[1];

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!userRole) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }

    if (requiredRoles && !requiredRoles.includes(userRole) && userRole !== 'ADMIN') {
      if (userRole === 'BUYER') {
        return NextResponse.redirect(new URL('/dashboard/buyer', request.url));
      } else if (userRole === 'TRADER') {
        return NextResponse.redirect(new URL('/dashboard/trader', request.url));
      } else if (userRole === 'TRANSPORTER') {
        return NextResponse.redirect(new URL('/dashboard/transporter', request.url));
      } else if (userRole === 'WHOLESALER') {
        return NextResponse.redirect(new URL('/dashboard/wholesaler', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
