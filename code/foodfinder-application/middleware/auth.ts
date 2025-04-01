import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticate } from '../lib/auth';

// Define protected routes
const protectedRoutes = [
    '/home',
    '/about',
    '/projects',
    '/projects/professional',
    '/projects/personal',
    '/profile',
];

export async function authMiddleware(request: NextRequest) {
    console.log('Auth Middleware running...');

    const { pathname } = request.nextUrl;

    // Check if the current route is protected
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        try {
            const authSuccess = await authenticate(request);
            if (!authSuccess) {
                return NextResponse.redirect(new URL('/auth', request.url));
            }
        } catch (error) {
            console.error('Error verifying token:', error);
            return NextResponse.redirect(new URL('/auth', request.url));
        }
    }

    return null;
}
