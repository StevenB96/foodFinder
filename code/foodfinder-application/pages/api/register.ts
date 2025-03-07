// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/db-connect';
import User from '../../mongoose/users/model';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        await dbConnect();

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const newUser = new User({ username, password: hashedPassword });
            await newUser.save();
            return res.status(201).json({ message: 'User registered successfully!' });
        } catch (error) {
            return res.status(400).json({ message: 'Error registering user: ' + error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}