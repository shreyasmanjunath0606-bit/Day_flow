import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  console.log('🌱 Starting DayFlow MySQL Database Seeding...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL database `dayflow_db`');

    await connection.query('USE `dayflow_db`;');

    // Hash passwords with bcrypt before seeding
    const employeePasswordHash = await bcrypt.hash('Employee@123', 12);
    const adminPasswordHash = await bcrypt.hash('Admin@123', 12);
    console.log('🔐 Passwords hashed with bcrypt (12 salt rounds)');

    // 1. Seed Users (with bcrypt-hashed passwords)
    // Default credentials: employee = alex.morgan@dayflow.io / Employee@123
    //                      hr admin = admin@dayflow.io / Admin@123
    await connection.query(`DELETE FROM \`users\``);
    
    const empUserId = randomUUID();
    const hrUserId = randomUUID();
    
    await connection.query(
      'INSERT INTO `users` (`id`, `employee_id`, `email`, `password_hash`, `role`) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
      [empUserId, 'EMP-2026-0842', 'alex.morgan@dayflow.io', employeePasswordHash, 'employee',
       hrUserId, 'ADM-001', 'admin@dayflow.io', adminPasswordHash, 'hr']
    );

    // 2. Seed Employee Profile
    const empProfileId = randomUUID();
    await connection.query(`
      INSERT IGNORE INTO \`employee_profiles\` 
      (\`id\`, \`user_id\`, \`full_name\`, \`phone\`, \`dob\`, \`gender\`, \`address\`, \`avatar_url\`, \`emergency_name\`, \`emergency_relation\`, \`emergency_phone\`, \`designation\`, \`department\`, \`employee_type\`, \`date_of_joining\`, \`work_location\`, \`manager_name\`, \`status\`)
      VALUES
      (?, ?, 'Alex Morgan', '+1 (555) 234-5678', '1994-06-15', 'Non-binary', '742 Evergreen Terrace, Springfield, OR', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', 'Sarah Morgan', 'Sister', '+1 (555) 987-6543', 'Senior Frontend Engineer', 'Engineering & Product', 'Full-Time', '2022-03-15', 'Springfield HQ (Hybrid)', 'Marcus Vance', 'Active');
    `, [empProfileId, empUserId]);

    // 3. Seed Salary Structure (Phase 3 decimal schema)
    const salaryId = randomUUID();
    await connection.query(`
      INSERT IGNORE INTO \`salary_structures\`
      (\`id\`, \`profile_id\`, \`basic_salary\`, \`hra\`, \`da\`, \`special_allowance\`, \`pf_deduction\`, \`tax_deduction\`, \`other_deductions\`, \`effective_from\`, \`bank_name\`, \`account_number\`)
      VALUES
      (?, ?, 8500.00, 2200.00, 0.00, 1383.00, 650.00, 1850.00, 150.00, '2026-08-01', 'Chase Bank', '•••• •••• 4892');
    `, [salaryId, empProfileId]);

    // 4. Seed Attendance History
    await connection.query(`
      INSERT IGNORE INTO \`attendance_logs\`
      (\`id\`, \`user_id\`, \`log_date\`, \`check_in_time\`, \`check_out_time\`, \`logged_hours\`, \`status\`, \`note\`)
      VALUES
      (?, ?, '2026-08-17', '09:00 AM', '05:30 PM', '8.5 hrs', 'PRESENT', 'Regular shift'),
      (?, ?, '2026-08-18', '09:05 AM', '05:35 PM', '8.5 hrs', 'PRESENT', 'Regular shift'),
      (?, ?, '2026-08-19', '09:00 AM', '01:00 PM', '4.0 hrs', 'HALF_DAY', 'Medical appointment in afternoon'),
      (?, ?, '2026-08-20', '08:55 AM', '05:30 PM', '8.5 hrs', 'PRESENT', 'Regular shift'),
      (?, ?, '2026-08-21', '—', '—', '0.0 hrs', 'LEAVE', 'Approved Casual Leave'),
      (?, ?, '2026-08-22', '09:02 AM', '—', '4.2 hrs', 'PRESENT', 'Shift in progress');
    `, [
      randomUUID(), empUserId, 
      randomUUID(), empUserId, 
      randomUUID(), empUserId, 
      randomUUID(), empUserId, 
      randomUUID(), empUserId, 
      randomUUID(), empUserId
    ]);

    // 5. Seed Leave Requests
    await connection.query(`
      INSERT IGNORE INTO \`leave_requests\`
      (\`id\`, \`user_id\`, \`leave_type\`, \`from_date\`, \`to_date\`, \`total_days\`, \`reason\`, \`status\`)
      VALUES
      (?, ?, 'Casual Leave', '2026-08-25', '2026-08-26', 2, 'Personal errands and home maintenance', 'approved'),
      (?, ?, 'Sick Leave', '2026-08-10', '2026-08-10', 1, 'High fever and doctor consultation', 'approved'),
      (?, ?, 'Annual Vacation', '2026-09-01', '2026-09-05', 5, 'Family trip to national park', 'pending');
    `, [
      randomUUID(), empUserId, 
      randomUUID(), empUserId, 
      randomUUID(), empUserId
    ]);

    console.log('✨ Seeded Users, Profiles, Salary, Attendance, and Leave Requests successfully into MySQL!');
    await connection.end();
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.log('\n⚠️ MySQL Server is not currently running on 127.0.0.1:3306.');
      console.log('📌 Please start your local MySQL server (via XAMPP, WampServer, or MySQL Installer).');
      console.log('💡 Note: DayFlow backend server will run smoothly with automatic fallback mode until MySQL starts!\n');
    } else {
      console.error('❌ Seeding Error:', err.message);
    }
  }
}

seedDatabase();
