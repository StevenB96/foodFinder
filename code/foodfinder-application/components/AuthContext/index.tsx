import React, {
    createContext,
    useContext,
    useState,
    ReactNode
} from 'react';
import axios from 'axios';

// Define the UserSession interface
interface UserSession {
    id: string;
    username: string;
    accessToken: string;
    refreshToken: string;
}

// Define the AuthContextType interface
interface AuthContextType {
    session: UserSession | null;
    signIn: (
        username: string,
        password: string
    ) => Promise<UserSession>;
    signOut: () => Promise<void>;
    refreshAccessToken: () => Promise<UserSession>;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<UserSession | null>(null);

    // Function to refresh the access token
    const refreshAccessToken = async (): Promise<UserSession> => {
        if (!session?.refreshToken) {
            throw new Error("No refresh token available");
        }

        try {
            const { data } = await axios.post(
                'http://localhost:3000/api/refresh-token',
                {
                    refreshToken: session.refreshToken,
                }
            );

            // Check if the response has the necessary fields
            if (!data.id || !data.username || !data.accessToken || !data.refreshToken) {
                throw new Error("Invalid session data returned from refresh token endpoint.");
            }

            // Create a new session object
            const updatedSession: UserSession = {
                id: data.id,
                username: data.username,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            };

            // Update state with the new session
            setSession(updatedSession);
            return updatedSession; // Return the updated session
        } catch (error) {
            console.error(
                'Could not refresh token:',
                error.response ? error.response.data : error.message
            );
            throw error;
        }
    };

    // Sign in function
    const signIn = async (
        username: string,
        password: string
    ): Promise<UserSession> => {
        try {
            const { data: userSession } = await axios.post<UserSession>(
                '/api/login',
                {
                    username,
                    password
                }
            );

            setSession(userSession);

            return userSession;
        } catch (error) {
            if (error?.response?.status === 401) {
                const errMessage = error?.response.data?.message;
                console.error(errMessage);
            }
            throw error;
        }
    };

    // Sign out function
    const signOut = async (freshSession: UserSession | null): Promise<void> => {
        try {
            const currentSession = freshSession || session;
            const accessToken = currentSession?.accessToken;

            if (!accessToken) {
                console.warn("No access token available to sign out.");
                return;
            }

            const response = await axios.post(
                '/api/logout',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            // Check response for success status
            if (response.status === 200) {
                setSession(null);
            } else {
                console.error(
                    'Logout request was made but not successful:',
                    response
                );
            }
        } catch (error: any) {
            // Handle error responses
            if (axios.isAxiosError(error)) {
                if (
                    error?.response?.status === 401 &&
                    error?.response?.data?.message === "Invalid access token"
                ) {
                    // Refresh the token and reattempt sign out
                    try {
                        const updatedSession = await refreshAccessToken();
                        // Now try signing out again
                        await signOut(updatedSession);
                    } catch (refreshError) {
                        console.error(
                            "Failed to refresh token, unable to sign out.",
                            refreshError);
                    }
                } else {
                    console.error(
                        'An unexpected error occurred during sign out:',
                        error
                    );
                }
            } else {
                console.error(
                    'An unexpected error occurred during sign out:',
                    error
                );
            }
        }
    };

    return (
        <AuthContext.Provider value={{
            session,
            signIn,
            signOut,
            refreshAccessToken,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};