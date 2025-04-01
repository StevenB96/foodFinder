// Import required types
import type { NextApiRequest, NextApiResponse } from 'next';
// Import middleware and models
import dbConnect from '../../middleware/db-connect';
import User from '../../mongoose/users/model';
// Import libraries
import bcrypt from 'bcryptjs';
import {
    createNewTokens
} from '../../lib/auth';

// API Reference:
// Endpoint: /api/sign-in
// Method: POST
// Description: Log in a user by validating the username and password, then issuing tokens.
// Responds with user session data on success (HTTP 200) or error messages on failure:
// - 400: Username and password are required
// - 401: Invalid username or password
// - 500: Internal server error
// - 405: Method not allowed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Method not allowed
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        await dbConnect(); // Connect to the database

        // Validate username and password from request body
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            });
        }

        // Search for the user in the database
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid username'
            });
        }

        // Compare provided password with stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid password'
            });
        }

        await createNewTokens(user._id, res);

        // Construct user object
        const userObject = {
            id: user._id.toString(),
            username: user.username,
        };

        // Respond with user data
        res.status(200).json(userObject);

    } catch (error: unknown) {
        console.error("Error logging in user:", error);

        // Type assertion to Error
        const errorMessage = (error as Error).message || 'Unknown error occurred';

        return res.status(500).json({
            message: 'Error logging in user: ' + errorMessage
        });
    }
}
