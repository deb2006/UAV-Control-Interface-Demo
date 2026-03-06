import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { UAV } from '../models/UAV';
import logger from '../utils/logger';

export async function seedDatabase(): Promise<void> {
    // Seed admin user
    const adminExists = await User.findOne({ where: { email: 'admin@astralink.io' } });
    if (!adminExists) {
        const hash = await bcrypt.hash('Admin@1234', 10);
        await User.create({
            name: 'Admin',
            email: 'admin@astralink.io',
            passwordHash: hash,
            role: 'admin',
        });
        logger.info('🌱 Seeded admin user: admin@astralink.io / Admin@1234');
    }

    // Seed operator user
    const opExists = await User.findOne({ where: { email: 'operator@astralink.io' } });
    if (!opExists) {
        const hash = await bcrypt.hash('Operator@1234', 10);
        await User.create({
            name: 'Operator',
            email: 'operator@astralink.io',
            passwordHash: hash,
            role: 'operator',
        });
        logger.info('🌱 Seeded operator user: operator@astralink.io / Operator@1234');
    }

    // Seed one UAV
    const uavExists = await UAV.findOne({ where: { serialNumber: 'AL-UAV-001' } });
    if (!uavExists) {
        await UAV.create({
            name: 'Astra-1',
            serialNumber: 'AL-UAV-001',
            status: 'active',
            lastSeen: new Date(),
        });
        logger.info('🌱 Seeded UAV: Astra-1 (AL-UAV-001)');
    }
}
