
import 'dotenv/config';
import { sequelize } from './src/config/database';
import { User } from './src/models/User';
import { seedDatabase } from './src/config/seed';

async function checkAndSeed() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection established.');

        const users = await User.findAll();
        console.log(`👥 Found ${users.length} users:`, users.map(u => u.email));

        console.log('🌱 Forcing password reset for admin and operator...');
        const bcrypt = require('bcryptjs');
        const adminHash = await bcrypt.hash('Admin@1234', 10);
        const opHash = await bcrypt.hash('Operator@1234', 10);

        await User.update({ passwordHash: adminHash }, { where: { email: 'admin@astralink.io' } });
        await User.update({ passwordHash: opHash }, { where: { email: 'operator@astralink.io' } });

        console.log('✅ Passwords reset.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
        process.exit(1);
    }
}

checkAndSeed();
