import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getWorkingConnection() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'root';
  
  const passwordsToTry = [
    process.env.DB_PASSWORD,
    '',
    'Dailyflow@123',
    'root',
    'admin'
  ].filter(p => p !== undefined);

  for (const password of passwordsToTry) {
    try {
      const conn = await mysql.createConnection({
        host,
        port,
        user,
        password,
        multipleStatements: true,
      });
      return conn;
    } catch (err) {
      if (err.code === 'ECONNREFUSED') throw err;
    }
  }

  throw new Error('Access denied for MySQL root user. Please check your DB_PASSWORD in server/.env');
}

async function runDatabaseMigrations() {
  console.log('\n🚀 Starting DayFlow Automatic Database Migration Workflow...');
  const dbName = process.env.DB_NAME || 'dayflow_db';

  try {
    // 1. Connect to MySQL Server
    const connection = await getWorkingConnection();

    // 2. Ensure Database Exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`✅ Connected to MySQL Database: \`${dbName}\``);

    // 3. Ensure schema_migrations Table Exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`schema_migrations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`version\` VARCHAR(255) NOT NULL UNIQUE,
        \`filename\` VARCHAR(255) NOT NULL,
        \`applied_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Fetch Already Applied Migrations
    const [rows] = await connection.query('SELECT `version` FROM `schema_migrations`');
    const appliedVersions = new Set(rows.map(r => r.version));

    // 5. Discover Migration Directory
    const migrationsDir = path.resolve(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log(`⚠️ Migrations directory not found at: ${migrationsDir}`);
      await connection.end();
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`🔍 Found ${files.length} migration file(s) in repository.\n`);

    let appliedCount = 0;

    // 6. Apply Unapplied Migration Files
    for (const filename of files) {
      const version = filename.split('_')[0]; // e.g. '001'

      if (appliedVersions.has(version) || appliedVersions.has(filename)) {
        console.log(` ── ⏭️  [ALREADY APPLIED] ${filename}`);
        continue;
      }

      console.log(` ── ⚙️  [APPLYING MIGRATION] ${filename}...`);
      const filePath = path.join(migrationsDir, filename);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');

      if (sqlContent.trim()) {
        await connection.query(sqlContent);
      }

      await connection.query(
        'INSERT INTO `schema_migrations` (`version`, `filename`) VALUES (?, ?)',
        [version, filename]
      );

      console.log(` ── ✅ [SUCCESS] Applied ${filename}`);
      appliedCount++;
    }

    if (appliedCount === 0) {
      console.log('\n✨ Database schema is up to date! No pending migrations.\n');
    } else {
      console.log(`\n🎉 Successfully applied ${appliedCount} new database migration(s)!\n`);
    }

    await connection.end();
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.log('\n⚠️ MySQL Server is offline on 127.0.0.1:3306.');
      console.log('📌 Start MySQL server (XAMPP / WampServer / MySQL Service) then re-run `npm run db:migrate`.\n');
    } else {
      console.error('❌ Migration Error:', err.message);
      process.exit(1);
    }
  }
}

runDatabaseMigrations();
