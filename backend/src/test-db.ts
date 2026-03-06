import 'dotenv/config';
import { Sequelize } from 'sequelize';

const DB_HOST = process.env['DB_HOST'] || 'localhost';
const DB_PORT = parseInt(process.env['DB_PORT'] || '3306', 10);
const DB_USER = process.env['DB_USER'] || 'root';
const DB_PASS = process.env['DB_PASS'] || 'root';
const DB_NAME = process.env['DB_NAME'] || 'astra_link';

async function test() {
    console.log(`Testing connection with:
    Host: ${DB_HOST}
    Port: ${DB_PORT}
    User: ${DB_USER}
    Password: ${DB_PASS ? '****' : '(none)'}
    Database: ${DB_NAME}`);

    const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Connection has been established successfully.');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Unable to connect to the database:');
        console.error(error.message);

        if (DB_PASS === 'root') {
            console.log('\nRetrying with empty password...');
            const sequelizeEmpty = new Sequelize(DB_NAME, DB_USER, '', {
                host: DB_HOST,
                port: DB_PORT,
                dialect: 'mysql',
                logging: false
            });
            try {
                await sequelizeEmpty.authenticate();
                console.log('✅ Connection established with EMPTY password.');
                console.log('Please update your .env DB_PASS to empty.');
                process.exit(0);
            } catch (innerError: any) {
                console.error('❌ Also failed with empty password.');
            }
        }
        process.exit(1);
    }
}

test();
