// Import required types
import type { NextApiRequest, NextApiResponse } from 'next';
// Import middleware and models
import dbConnect from '../../middleware/db-connect';
import User from '../../mongoose/users/model';
// Import libraries
import bcrypt from 'bcryptjs';

// API Reference:
// Endpoint: /api/register
// Method: POST
// Description: Register a new user by providing a username and password.
// Responds with user session data on success (HTTP 201) or error messages on failure:
// - 400: Invalid input
// - 409: User already exists
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

        // Extract username and password from the request body
        const { username, password } = req.body;

        // Validate input for username and password
        if (!username || !password || password.length < 8) {
            return res.status(400).json({ 
                message: 'Invalid input' 
            });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ 
            username 
        });

        if (existingUser) {
            return res.status(409).json({ 
                message: 'User already exists' 
            });
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        // Save the new user in the database
        await newUser.save();

        // Construct user session object
        const userSession = {
            id: newUser._id.toString(),
            username: newUser.username,
        };

        // Respond with user session data
        res.status(201).json(userSession);
    } catch (error) {
        return res.status(500).json({
            message: 'Error registering user: ' + error.message,
        });
    }
}