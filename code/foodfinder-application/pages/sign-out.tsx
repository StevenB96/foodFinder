// pages/sign-out.tsx
import React from 'react';
import {
    useAuth
} from '../components/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import {
    useRouter
} from 'next/router';
import styles from '../styles/auth.module.css';

const SignOut: React.FC = () => {
    const { signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                <h2 className={styles.title}>
                    Are you sure you want to log out?
                </h2>
                <button
                    className={styles.button}
                    onClick={handleSignOut}>
                    Yes, Log Out
                </button>
            </div>
        </ProtectedRoute>
    );
};

export default SignOut;