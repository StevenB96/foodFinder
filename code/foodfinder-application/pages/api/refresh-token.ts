// Import required types
import type { NextApiRequest, NextApiResponse } from 'next';
// Import middleware and models
import dbConnect from '../../middleware/db-connect';
import User from '../../mongoose/users/model';
// Import libraries
import jwt from 'jsonwebtoken';

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

        const { refreshToken } = req.body;

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

        // Find the user in the database
        const user = await User.findById(decoded.userId);
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

        // Create access token
        const newAccessToken = jwt.sign(
            {
                userId: user._id,
                username: user.username
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '1m' }
        );

        // Create refresh token
        const newRefreshToken = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        // Assign tokens to the user
        user.accessToken = newAccessToken;
        user.refreshToken = newRefreshToken;
        await user.save();

        // Prepare user session data
        const userSession = {
            id: user._id.toString(),
            username: user.username,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
        };

        // Respond with user session data
        return res.status(200).json(userSession);

    } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}