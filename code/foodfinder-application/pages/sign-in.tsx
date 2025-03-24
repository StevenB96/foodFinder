// pages/sign-in.tsx
import React,
{
    useEffect,
    useState
} from 'react';
import {
    useAuth
} from '../components/AuthContext';
import axios from 'axios';
import {
    useRouter
} from 'next/router';
import styles from '../styles/auth.module.css';

const SignIn: React.FC = () => {
    const { session, signIn } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/sign-out');
        }
    }, [session, router]);

    const handleSignIn = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await signIn(username, password);
        } catch (error: any) {
            const message = error?.message || 'Sign-in failed. Please check your username and password.';
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
            {!session &&
                (
                    <div>
                        <h2 className={styles.title}>{isRegistering ? 'Register' : 'Sign In'}</h2>
                        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                        {successMessage && <p className={styles.success}>{successMessage}</p>}
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
                        <button className={styles.button} onClick={isRegistering ? handleRegister : handleSignIn}>
                            {isRegistering ? 'Register' : 'Sign In'}
                        </button>
                        <button className={styles.switchButton} onClick={() => setIsRegistering(!isRegistering)}>
                            {isRegistering ? 'Switch to Sign In' : 'Switch to Register'}
                        </button>
                    </div>
                )}
        </div>
    );
};

export default SignIn;