import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log('Dropping and recreating database dayflow_db...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await connection.query('DROP DATABASE IF EXISTS dayflow_db');
  await connection.query('CREATE DATABASE dayflow_db');
  console.log('Database dayflow_db recreated empty.');
  await connection.end();
}
run();
