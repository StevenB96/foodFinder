import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import type { SerializeOptions } from 'cookie';
import dbConnect from '../middleware/db-connect';
import User from '../mongoose/users/model';

/**
 * This minimal interface ensures we have access to `setHeader`,
 * which is the only method required for setting cookies.
 */
interface ResponseWithHeader {
    setHeader: (name: string, value: any) => void;
}

const COOKIE_OPTIONS: SerializeOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
};

// Helper to calculate cookie expiration date (default: 1 day)
const getCookieExpiration = (days: number = 1): Date =>
    new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export const createNewTokens = async (
    userId: number,
    res: ResponseWithHeader
): Promise<{ newAccessToken: string; newRefreshToken: string } | null> => {
    try {
        await dbConnect();

        if (!userId) {
            throw new Error('User ID is required to generate tokens.');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found.');
        }

        const payload = {
            userId: user._id,
            username: user.username
        };

        const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: '1m'
        });
        const newRefreshToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: '2m'
        });

        user.accessToken = newAccessToken;
        user.refreshToken = newRefreshToken;
        await user.save();

        res.setHeader('Set-Cookie', [
            cookie.serialize('accessToken', newAccessToken, {
                ...COOKIE_OPTIONS,
                expires: getCookieExpiration(1)
            }),
            cookie.serialize('refreshToken', newRefreshToken, {
                ...COOKIE_OPTIONS,
                expires: getCookieExpiration(1)
            })
        ]);

        return { newAccessToken, newRefreshToken };
    } catch (error) {
        console.error('Error generating tokens:', error);
        return null;
    }
};

export const verifyAccessToken = (
    accessToken: string | undefined,
    secret: string
) => {
    try {
        if (!accessToken) {
            throw new Error('No access token provided.');
        }

        const decodedAccessToken = jwt.verify(accessToken, secret);
        return decodedAccessToken;
    } catch (error) {
        console.error('Invalid or expired access token:', error);
        return false;
    }
};

export const refreshAccessToken = async (
    refreshToken: string | undefined,
    secret: string,
    res: ResponseWithHeader
) => {
    try {
        if (!refreshToken) {
            throw new Error('No refresh token provided.');
        }

        const decodedRefreshToken = jwt.verify(refreshToken, secret);
        const userId =
            typeof decodedRefreshToken === 'object' &&
            'userId' in decodedRefreshToken &&
            decodedRefreshToken.userId;

        if (!userId) {
            throw new Error('Invalid token payload.');
        }

        const tokens = await createNewTokens(userId, res);
        return tokens;
    } catch (error) {
        console.error('Invalid or expired refresh token:', error);
        return false;
    }
};

export const getOAuthTokensFromCookies = (cookieHeader: string | undefined) => {
    const cookies = cookie.parse(cookieHeader || '');
    return {
        accessToken: cookies.accessToken,
        refreshToken: cookies.refreshToken
    };
};

export const authenticate = async (
    cookieHeader: string | undefined,
    res: ResponseWithHeader
) => {
    const { accessToken, refreshToken } = getOAuthTokensFromCookies(cookieHeader);

    const decodedAccessToken = verifyAccessToken(
        accessToken,
        process.env.JWT_SECRET as string
    );

    if (decodedAccessToken) {
        return true;
    }

    const refreshedTokens = await refreshAccessToken(
        refreshToken,
        process.env.JWT_SECRET as string,
        res
    );

    if (refreshedTokens) {
        return true;
    }

    throw new Error('Authentication failed: Invalid or expired token. Please log in again.');
};