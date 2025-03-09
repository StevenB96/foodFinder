// pages/logout.tsx
import React from 'react';
import {
    useAuth
} from '../components/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import {
    useRouter
} from 'next/router';
import styles from '../styles/landing.module.css';

const Logout: React.FC = () => {
    const { signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
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
                    onClick={handleLogout}>
                    Yes, Log Out
                </button>
            </div>
        </ProtectedRoute>
    );
};

export default Logout;