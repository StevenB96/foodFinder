import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/auth.module.css';

const SignIn: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    // // Check if a user is already logged in by inspecting the cookie
    // React.useEffect(() => {
    //     const token = Cookies.get('token');
    //     if (token) {
    //         router.push('/dashboard'); // Redirect to dashboard if a token exists
    //     }
    // }, [router]);

    const handleSignIn = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const response = await axios.post('/api/sign-in', {
                username,
                password,
            });

            // Handle success response (user logged in)
            if (response.status === 200) {
                setSuccessMessage('Sign-in successful!');
                router.push('/locations'); // Redirect to dashboard or protected route
            } else {
                setErrorMessage('Failed to sign in');
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Sign-in failed. Please check your username and password.';
            setErrorMessage(message);
            console.error('Sign In Error:', message);
        }
    };


    const handleRegister = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await axios.post('/api/register', {
                username,
                password,
            });
            setSuccessMessage('Registration successful! You can now sign in.');
            setIsRegistering(false);
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Registration failed.';
            setErrorMessage(message);
            console.error('Registration Error:', message);
        }
    };

    return (
        <div className={styles.container}>
            <div>
                <h2 className={styles.title}>{isRegistering ? 'Register' : 'Sign In'}</h2>
                {
                    errorMessage &&
                    <p className={styles.error}>{errorMessage}</p>
                }
                {
                    successMessage &&
                    <p className={styles.success}>{successMessage}</p>
                }
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className={styles.button} onClick={isRegistering ?
                    handleRegister :
                    handleSignIn
                }>
                    {
                        isRegistering ?
                            'Register' :
                            'Sign In'
                    }
                </button>
                <button className={styles.switchButton} onClick={() => setIsRegistering(!isRegistering)}>
                    {
                        isRegistering ?
                            'Switch to Sign In' :
                            'Switch to Register'
                    }
                </button>
            </div>
        </div>
    );
};

export default SignIn;
