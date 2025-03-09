// Import required types
import type { NextApiRequest, NextApiResponse } from 'next';
// Import libraries
import jwt from 'jsonwebtoken';
// Import middleware and models
import dbConnect from '../../middleware/db-connect';
import User from '../../mongoose/users/model';

// API Reference:
// Endpoint: /api/logout
// Method: POST
// Description: Log out a user by invalidating their access and refresh tokens.
// Responds with a success message on successful logout (HTTP 200) or error messages on failure:
// - 401: Access token is required or Invalid access token
// - 404: User not found
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

        // Extract access token from headers
        const accessToken = req.headers?.authorization?.split(' ')[1];

        if (!accessToken) {
            return res.status(401).json({
                message: 'Access token is required'
            });
        }

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string);
        } catch (error) {
            return res.status(401).json({
                message: 'Invalid access token'
            });
        }

        // Fetch the user from the database using the decoded user ID
        const user = await User.findById(decoded.userId);

        // If user is not found, respond with a 404 error
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Clear the tokens for the user
        user.accessToken = null;
        user.refreshToken = null;
        await user.save();

        // Respond with a success message
        return res.status(200).json({
            message: 'Logged out successfully'
        });

    } catch (error) {
        // Handle any unexpected errors
        console.error("Error logging out:", error);
        return res.status(500).json({
            message: 'Error logging out: ' + error.message
        });
    }
}