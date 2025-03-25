// Import required types
import type { NextApiRequest, NextApiResponse } from 'next';
// Import middleware and models
import dbConnect from '../../middleware/db-connect';
import User from '../../mongoose/users/model';
// Import libraries
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

// API Reference:
// Endpoint: /api/refresh-token
// Method: POST
// Description: Refresh the user's access token using a valid refresh token.
// Responds with new access and refresh tokens on success (HTTP 200) or error messages on failure:
// - 401: Refresh token is required
// - 403: Invalid refresh token or User not found
// - 500: Server error
// - 405: Method not allowed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Method not allowed
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        await dbConnect();

        // Extract the refresh token from cookies
        const cookies = cookie.parse(req.headers.cookie || '');
        const refreshToken = cookies.refreshToken;

        // Check for refresh token
        if (!refreshToken) {
            return res.status(401).json({
                message: 'Refresh token is required'
            });
        }

        // Verify the refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string);
        } catch (error) {
            return res.status(403).json({
                message: 'Invalid refresh token'
            });
        }

        // Fetch the user from the database using the decoded user ID
        const userId = typeof decoded === 'object' && decoded?.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(403).json({
                message: 'User not found'
            });
        }

        // Check if the refresh token matches the one in the database
        if (user.refreshToken !== refreshToken) {
            return res.status(403).json({
                message: 'Invalid refresh token'
            });
        }

        // Create new access token
        const newAccessToken = jwt.sign(
            {
                userId: user._id,
                username: user.username
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '1m' }
        );

        // Create new refresh token
        const newRefreshToken = jwt.sign(
            {
                userId: user._id,
                username: user.username
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        // Assign tokens to the user (optionally save them in DB, if needed)
        user.accessToken = newAccessToken;
        user.refreshToken = newRefreshToken;
        await user.save();

        // Set expiration dates for the cookies
        const accessTokenExpires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );
        const refreshTokenExpires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        // Set new access token and refresh token as cookies
        res.setHeader('Set-Cookie', [
            cookie.serialize('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                expires: accessTokenExpires
            }),
            cookie.serialize('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                expires: refreshTokenExpires
            })
        ]);

        // Respond with a success message (no need to return the token data in the body)
        return res.status(200).json({
            message: 'Tokens refreshed successfully'
        });

    } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}
