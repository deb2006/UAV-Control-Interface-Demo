import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import logger from '../utils/logger';

export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const secret = process.env['JWT_SECRET'] || 'secret';
        const token = jwt.sign(
            { id: user.id, role: user.role },
            secret,
            { expiresIn: '24h' }
        );
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        logger.error('Login error', err);
        res.status(500).json({ error: 'Server error' });
    }
}
