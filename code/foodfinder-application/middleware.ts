import type { NextRequest } from 'next/server';
import { applyMiddlewares } from './middleware/compose';

export async function middleware(request: NextRequest) {
    return applyMiddlewares(request, [
    ]);
}

export const config = {
    matcher: ['/((?!_next|static|favicon.ico).*)'],
    runtime: 'nodejs',
};
