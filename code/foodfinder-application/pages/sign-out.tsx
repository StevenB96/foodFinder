// pages/sign-out.tsx

import React from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/auth.module.css';
import {
    authenticate
} from "../lib/auth";

// Define the type of the props (in this case, there are no props for SignOut)
interface SignOutProps { }

const SignOut: React.FC<SignOutProps> = () => {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            const response = await axios.post('/api/sign-out');

            // Check for success and redirect
            if (response.status === 200) {
                router.push('/');
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Sign-out failed. Please try again later.';
            console.error('Sign Out Error:', message);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Are you sure you want to log out?</h2>
            <button
                className={styles.button}
                onClick={handleSignOut}>
                Yes, Log Out
            </button>
        </div>
    );
};

export const getServerSideProps = async (context: any) => {
    const cookieHeader = context.req.headers.cookie || '';
    const resContext = context.res;

    try {
        await authenticate(cookieHeader, resContext);
    } catch (error) {
        console.error("Error verifying token:", error);

        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    // If the user is authenticated, allow access to this page
    return {
        props: {},
    };
};

export default SignOut;
