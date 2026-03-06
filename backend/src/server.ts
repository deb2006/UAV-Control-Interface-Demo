import 'dotenv/config';
import http from 'http';
import app from './app';
import { initSocket } from './gateway/telemetry.gateway';
import { sequelize } from './config/database';
import { seedDatabase } from './config/seed';
import logger from './utils/logger';

const PORT = parseInt(process.env['PORT'] || '3000', 10);

const server = http.createServer(app);
initSocket(server);

async function bootstrap() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        logger.info('✅ Database synced');
        await seedDatabase();
        server.listen(PORT, () => {
            logger.info(`🚀 Astra Link backend running on http://localhost:${PORT}`);
        });
    } catch (err) {
        logger.error('❌ Failed to start server', err);
        process.exit(1);
    }
}

bootstrap();
