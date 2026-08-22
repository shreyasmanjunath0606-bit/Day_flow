import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL Connection Pool Configuration
const poolConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dayflow_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let dbPool = null;

try {
  dbPool = mysql.createPool(poolConfig);
} catch (err) {
  console.warn('MySQL Pool Initialization Warning:', err.message);
}

/**
 * Execute SQL Query with automatic Pool connection & parameters
 */
export async function query(sql, params = []) {
  if (!dbPool) {
    throw new Error('Database pool not initialized');
  }
  const [rows] = await dbPool.execute(sql, params);
  return rows;
}

/**
 * Check MySQL Database Connection Health
 */
export async function testConnection() {
  try {
    const connection = await dbPool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (err) {
    return false;
  }
}

export default dbPool;
