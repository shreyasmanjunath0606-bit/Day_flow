# Database Syncing and Migration Guide

Welcome to the DayFlow database sync guide! Since multiple team members are working on the same project with their own local databases, it's crucial to keep your local MySQL database schema synchronized with the `main` branch. 

We use `db-migrate` to ensure everyone has the exact same tables, columns, and data structures.

## Prerequisite Setup (First Time Only)

1. Make sure you have installed the project dependencies:
   ```bash
   cd server
   npm install
   ```
2. Copy the `.env.example` file to create your own `.env` file in the `server` directory, and update the credentials to match your local MySQL server:
   ```bash
   cp .env.example .env
   ```

## Daily Workflow: How to Sync After Pulling from Git

Whenever you run `git pull` and pull down updates from other team members, **always run the migration script** to update your local database. 

1. **Pull the latest code:**
   ```bash
   git pull origin main
   ```
2. **Run the migration command:**
   ```bash
   cd server
   npm run db:migrate
   ```
   *This command automatically detects any new `.sql` files added to `server/migrations/sqls/` by your teammates and applies them safely to your database in the correct order.*

## How to Create a New Migration

If you need to add a new table, add a new column, or change the schema (DO NOT manually change it in MySQL Workbench without making a migration file!), follow these steps:

1. **Create the migration file:**
   ```bash
   cd server
   npx db-migrate create <your-migration-name> --sql-file
   ```
   *Example: `npx db-migrate create add-department-table --sql-file`*

2. **Write your SQL:**
   This command creates an `up` and `down` SQL file in `server/migrations/sqls/`. 
   - Open the `-up.sql` file and write your `CREATE TABLE` or `ALTER TABLE` commands.
   - Open the `-down.sql` file and write the reverse action (e.g., `DROP TABLE`) to allow rolling back.

3. **Test your migration locally:**
   ```bash
   npm run db:migrate
   ```
4. **Commit and Push:**
   Commit the newly generated `.js` and `.sql` files to Git. When your team members pull, they will just run `npm run db:migrate` and get your exact changes!

## Important Note on Primary Keys
We have migrated the baseline schema to use **UUIDs** (`VARCHAR(36)`) instead of `INT AUTO_INCREMENT` for primary keys. This ensures that when developers generate records locally and later merge data for testing or staging, the IDs will never collide!
