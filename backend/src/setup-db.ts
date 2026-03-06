import 'dotenv/config';
import mysql from 'mysql2/promise';

const DB_HOST = process.env['DB_HOST'] || 'localhost';
const DB_PORT = parseInt(process.env['DB_PORT'] || '3306', 10);
const DB_USER = process.env['DB_USER'] || 'root';
const DB_PASS = process.env['DB_PASS'] || 'Sql123';
const DB_NAME = process.env['DB_NAME'] || 'astra_link';

async function setup() {
    console.log(`Connecting to MySQL to create database: ${DB_NAME}`);

    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASS
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        console.log(`✅ Database \`${DB_NAME}\` created or already exists.`);
        await connection.end();
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error creating database:');
        console.error(error.message);
        process.exit(1);
    }
}

setup();
