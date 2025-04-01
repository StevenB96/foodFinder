// Import required types
import type { NextApiRequest, NextApiResponse } from 'next';
// Import middleware and models
import dbConnect from '../../middleware/db-connect';
import User from '../../mongoose/users/model';
// Import libraries
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import {
    createNewTokens
} from '../../lib/auth';

// API Reference:
// Endpoint: /api/refresh-token
// Method: POST
// Description: Refresh the user's access token using a valid refresh token.
// Responds with new access and refresh tokens on success (HTTP 200) or error messages on failure:
// - 401: Refresh token is required
// - 403: Invalid refresh token or User not found
// - 500: Server error
// - 405: Method not allowed

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse,
) {
    // Method not allowed
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
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
            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_SECRET as string
            );
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

        await createNewTokens(user._id, res);
        
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
