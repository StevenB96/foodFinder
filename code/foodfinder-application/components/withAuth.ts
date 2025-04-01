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
        // Extract the path from the request URL (adjust as needed)
        const pathname = context.req.url || '';

        // If the route is protected, perform authentication
        if (protectedRoutes.some(route => pathname.startsWith(route))) {
            try {
                const authSuccess = await authenticate({
                    cookies: context.req.headers.cookie,
                    url: context.req.url,
                } as any);

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
