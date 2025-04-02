import {
    GetServerSideProps,
    GetServerSidePropsContext,
    GetServerSidePropsResult
} from 'next';
import { authenticate } from '../lib/auth';

// List of protected routes (same as in your middleware)
const protectedRoutes = [
    '/home',
    '/about',
    '/projects',
    '/projects/professional',
    '/projects/personal',
    '/profile',
];

export function withAuth<P>(
    getServerSidePropsFunc?: GetServerSideProps<P>
): GetServerSideProps<P> {
    return async (
        context: GetServerSidePropsContext
    ): Promise<GetServerSidePropsResult<P>> => {
        const pathname = context.req.url || '';
        const cookies = context.req.cookies;

        const routeIsProtected = protectedRoutes.some(route => pathname.startsWith(route));

        console.log({
            routeIsProtected,
            pathname,
            cookies
        });
        if (routeIsProtected) {
            try {
                const authSuccess = await authenticate(
                    context.req
                );

                if (!authSuccess) {
                    return {
                        redirect: {
                            destination: '/auth',
                            permanent: false,
                        },
                    };
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                return {
                    redirect: {
                        destination: '/auth',
                        permanent: false,
                    },
                };
            }
        }

        // If an inner getServerSideProps is provided, call it
        if (getServerSidePropsFunc) {
            return await getServerSidePropsFunc(context);
        }

        // Otherwise, return empty props
        return { props: {} as P };
    };
}
