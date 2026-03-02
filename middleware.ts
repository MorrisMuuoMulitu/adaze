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
  const userRole = user?.role ? user.role.toLowerCase() : null;

  const protectedRoutes: { [key: string]: string[] } = {
    '/dashboard/buyer': ['buyer'],
    '/dashboard/trader': ['trader'],
    '/dashboard/transporter': ['transporter'],
    '/dashboard/wholesaler': ['wholesaler'],
    '/admin': ['admin'],
    '/marketplace': ['buyer'],
    '/products/add': ['trader'],
    '/products/manage': ['trader'],
    '/products/edit': ['trader'],
    '/orders/received': ['trader'],
    '/orders/create': ['buyer'],
    '/cart': ['buyer'],
    '/checkout': ['buyer'],
    '/payment': ['buyer'],
    '/wishlist': ['buyer'],
    '/orders': ['buyer'],
    '/transporter/available-deliveries': ['transporter'],
    '/transporter/my-deliveries': ['transporter'],
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

    if (requiredRoles && !requiredRoles.includes(userRole) && userRole !== 'admin') {
      if (userRole === 'buyer') {
        return NextResponse.redirect(new URL('/dashboard/buyer', request.url));
      } else if (userRole === 'trader') {
        return NextResponse.redirect(new URL('/dashboard/trader', request.url));
      } else if (userRole === 'transporter') {
        return NextResponse.redirect(new URL('/dashboard/transporter', request.url));
      } else if (userRole === 'wholesaler') {
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
