// components/AuthWrapper.tsx
import React from 'react';
import { authenticate } from "../lib/auth";

interface AuthWrapperProps {
    children: React.ReactNode;
}

const protectedRoutes: string[] = [
    '/home',
    '/about',
    '/projects',
    '/projects/professional',
    '/projects/personal',
    '/profile',
];

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    return (
        <div>
            {children}
        </div>
    );
};

// Modified getServerSideProps to only authenticate for protected routes
export const getServerSideProps = async (context: any) => {
    const { req, res, resolvedUrl } = context;
    const cookieHeader = req.headers.cookie || '';

    if (protectedRoutes.includes(resolvedUrl)) {
        try {
            await authenticate(cookieHeader, res);
        } catch (error) {
            console.error("Error verifying token:", error);

            return {
                redirect: {
                    destination: "/auth",
                    permanent: false,
                },
            };
        }
    }
    return {
        props: {},
    };
};

export default AuthWrapper;
