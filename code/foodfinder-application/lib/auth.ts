import jwt from "jsonwebtoken";
import * as cookie from 'cookie';

export const verifyAccessToken = (
    accessToken: string | undefined,
    secret: string
) => {
    try {
        if (!accessToken) {
            throw new Error("No access token provided");
        }

        // Verify the token with the provided secret
        const decodedAccessToken = jwt.verify(accessToken, secret);

        console.log({ decodedAccessToken });

        return decodedAccessToken;
    } catch (error) {
        console.error(
            "Invalid or expired access token"
        );
        return false;
    }
};

export const refreshAccessToken = async (
    refreshToken: string | undefined,
    secret: string,
    resContext: object | undefined,
) => {
    try {
        if (!refreshToken) {
            throw new Error("No access token provided");
        }

        // Verify the token with the provided secret
        const decodedRefreshToken = jwt.verify(refreshToken, secret);

        const {
            userId,
            username,
        } = decodedRefreshToken;

        console.log({ decodedRefreshToken });

        return decodedRefreshToken;
    } catch (error) {
        console.error(
            "Invalid or expired refresh token"
        );
        return false;
    }
};

export const getOAuthTokensFromCookies = (
    cookieHeader: string | undefined
) => {
    const cookies = cookie.parse(cookieHeader || "");
    return {
        accessToken: cookies.accessToken,
        refreshToken: cookies.refreshToken,
    };
};

export const authenticate = async (
    cookieHeader: string | undefined,
    resContext: object | undefined
) => {
    // Extract tokens from cookies
    const {
        accessToken,
        refreshToken
    } = getOAuthTokensFromCookies(cookieHeader);

    // Verify the access token using the utility function
    const decodedAccessToken = verifyAccessToken(
        accessToken,
        process.env.JWT_SECRET as string
    );

    // If access token is valid, return true
    if (decodedAccessToken) {
        return true;
    }

    // Attempt to refresh the access token
    const accessTokenRefreshed = await refreshAccessToken(
        refreshToken, 
        process.env.JWT_SECRET as string, 
        resContext
    );

    // If access token is refreshed, return true
    if (accessTokenRefreshed) {
        return true;
    }

    throw new Error("Authentication failed: Invalid or expired token. Please log in again.");
};

