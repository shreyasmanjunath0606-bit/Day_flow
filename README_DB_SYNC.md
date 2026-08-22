# DayFlow Database Synchronization & Migration Workflow Guide

This document defines the team workflow for database migrations and schema synchronization using Git across three developers working on separate local environments.

---

## 🛠️ Stack & Architecture Overview

- **Database Engine**: MySQL (`dayflow_db`)
- **Backend Stack**: Node.js, Express, `mysql2`
- **Migration Directory**: `/migrations` in repository root
- **Migration Versioning Format**: `001_description.sql`, `002_description.sql`, `003_description.sql`, ...

---

## 📁 Repository Structure

```text
Day_flow/
├── migrations/
│   ├── 001_create_developer1_tables.sql  # Users, Employee Profiles, Salary Structures
│   ├── 002_create_developer2_tables.sql  # Attendance Logs & Shift Schedules
│   └── 003_create_developer3_tables.sql  # Leave Requests & System Notifications
├── server/
│   ├── migrate.js                       # Unified Migration Execution Script
│   ├── seed.js                          # Database Seeder
│   └── .env.example                     # Connection Environment Template
├── README_DB_SYNC.md                    # Team Migration Guide
└── .gitignore                           # Excludes *.db, dumps, and .env files
```

---

## 🚀 Step-by-Step Workflow for Team Members

### 1. Initial Setup (First Time Setup)
Before running migrations, ensure your local MySQL service is active (via XAMPP, WampServer, or MySQL Installer).

Copy the environment template:
```bash
cp server/.env.example server/.env
```
Edit `server/.env` to include your local MySQL password if needed (`DB_PASSWORD=your_mysql_password`).

---

### 2. Post Git-Pull Migration Execution (Mandatory Workflow)
Whenever you pull new code from Git (`git pull origin main`), execute the unified migration command:

```bash
npm run db:migrate
```

This script will automatically:
1. Connect to your local MySQL instance.
2. Create `dayflow_db` and the `schema_migrations` tracking table if they do not exist.
3. Compare all migration files in `/migrations` against `schema_migrations`.
4. Apply any newly merged migration files in version order.
5. Skip previously executed migration scripts cleanly (idempotent execution).

---

### 3. Creating a New Migration (Adding New Tables / Columns)
When you add or modify database tables in your feature branch:

1. Create a new SQL migration file inside the `/migrations` folder.
2. Name it using the next version number:
   - Example: `004_add_performance_reviews_table.sql`
3. Write clean SQL statements using `CREATE TABLE IF NOT EXISTS` or `ALTER TABLE`.
4. Test the migration locally:
   ```bash
   npm run db:migrate
   ```
5. Commit and push the SQL file to Git:
   ```bash
   git add migrations/004_add_performance_reviews_table.sql
   git commit -m "migration: Add performance reviews table schema"
   git push origin my_feature
   ```

---

### 4. Git Hygiene Rules for Database Files

To avoid ID collisions, merge conflicts, and data corruption:
- ❌ **NEVER commit binary database files** (`*.db`, `*.sqlite`, `data/`) or local database dumps.
- ❌ **NEVER commit `.env` files** containing database passwords.
- ✅ **ALWAYS commit raw SQL migration files** (`/migrations/*.sql`).
- ✅ **ALWAYS use UUIDs or managed sequences** for Primary Keys to prevent ID collisions across local databases.

---

## 📊 Summary of Commands

| Task | Command |
| :--- | :--- |
| **Run All Pending Migrations** | `npm run db:migrate` |
| **Seed Test Records** | `npm run db:seed` |
| **Start Dev Server** | `npm run dev` |
