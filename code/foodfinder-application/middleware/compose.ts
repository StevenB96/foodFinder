import { NextRequest, NextResponse } from "next/server";

export async function applyMiddlewares(
    request: NextRequest, 
    middlewares: ((req: NextRequest) => Promise<NextResponse | null> | NextResponse | null)[]
) {
    for (const middleware of middlewares) {
        const response = await middleware(request);
        if (response) return response;
    }
    return NextResponse.next();
}
