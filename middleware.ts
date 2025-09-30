import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser();
  let userRole: string | null = null;

  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role in middleware:', error);
      // Optionally redirect to an error page or home
      return NextResponse.redirect(new URL('/', request.url));
    }
    userRole = profile?.role || null;
  }

  const { pathname } = request.nextUrl;

  // Define role-based access rules
  const protectedRoutes: { [key: string]: string[] } = {
    '/dashboard/buyer': ['buyer'],
    '/dashboard/trader': ['trader'],
    '/dashboard/transporter': ['transporter'],
    '/products/add': ['trader'],
    '/products/manage': ['trader'],
    '/products/edit': ['trader'], // This will match /products/edit/:id
    '/orders/received': ['trader'],
    '/cart': ['buyer'],
    '/checkout': ['buyer'],
    '/payment': ['buyer'],
    '/orders': ['buyer'], // Buyer's order history
  };

  // Check if the requested path is a protected route
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => {
    // Handle dynamic routes like /products/edit/:id
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
      // If not logged in, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!userRole) {
      // If logged in but no role, redirect to profile to set role
      return NextResponse.redirect(new URL('/profile', request.url));
    }

    if (requiredRoles && !requiredRoles.includes(userRole)) {
      // If role does not match, redirect to their dashboard
      if (userRole === 'buyer') {
        return NextResponse.redirect(new URL('/dashboard/buyer', request.url));
      } else if (userRole === 'trader') {
        return NextResponse.redirect(new URL('/dashboard/trader', request.url));
      } else if (userRole === 'transporter') {
        return NextResponse.redirect(new URL('/dashboard/transporter', request.url));
      }
      // Fallback for unknown roles or if dashboard doesn't exist
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};