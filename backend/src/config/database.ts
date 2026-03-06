import { Sequelize } from 'sequelize';
import logger from '../utils/logger';

export const sequelize = new Sequelize(
    process.env['DB_NAME'] || 'astra_link',
    process.env['DB_USER'] || 'root',
    process.env['DB_PASS'] || '',
    {
        host: process.env['DB_HOST'] || 'localhost',
        port: parseInt(process.env['DB_PORT'] || '3306', 10),
        dialect: 'mysql',
        logging: (msg) => logger.debug(msg),
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            underscored: true,
            timestamps: true,
        },
    }
);

export async function testConnection(): Promise<void> {
    await sequelize.authenticate();
    logger.info('✅ MySQL connection established');
}
