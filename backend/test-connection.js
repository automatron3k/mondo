/**
 * Test database connection script
 * Run with: node backend/test-connection.js
 */

import 'dotenv/config'; // Load env vars before other imports
import { query } from './db/connection.js';

async function testConnection() {
    console.log('🔍 Testing database connection...\n');

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set in .env file');
        process.exit(1);
    }

    // Mask password in connection string for display
    const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@');
    console.log(`📡 Connection string: ${maskedUrl}\n`);

    try {
        // Test 1: Simple query
        console.log('Test 1: Testing basic connection...');
        const result1 = await query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Connection successful!');
        console.log(`   Current time: ${result1.rows[0].current_time}`);
        console.log(`   PostgreSQL version: ${result1.rows[0].pg_version.split(',')[0]}\n`);

        // Test 2: Check if tables exist
        console.log('Test 2: Checking if tables exist...');
        const tablesResult = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        if (tablesResult.rows.length > 0) {
            console.log('✅ Tables found:');
            tablesResult.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        } else {
            console.log('⚠️  No tables found. You may need to run the init.sql script.');
        }
        console.log();

        // Test 3: Check posts table specifically
        console.log('Test 3: Checking posts table structure...');
        try {
            const postsCheck = await query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'posts'
                ORDER BY ordinal_position
            `);

            if (postsCheck.rows.length > 0) {
                console.log('✅ Posts table exists with columns:');
                postsCheck.rows.forEach(row => {
                    console.log(`   - ${row.column_name} (${row.data_type})`);
                });
            } else {
                console.log('⚠️  Posts table not found. Run backend/db/init.sql to create it.');
            }
        } catch (error) {
            console.log('⚠️  Posts table not found. Run backend/db/init.sql to create it.');
        }
        console.log();

        // Test 4: Count posts if table exists
        try {
            const countResult = await query('SELECT COUNT(*) as count FROM posts');
            console.log(`Test 4: Posts count: ${countResult.rows[0].count}`);
        } catch (error) {
            console.log('Test 4: Skipped (posts table not available)');
        }

        console.log('\n✅ All connection tests passed!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Connection test failed!');
        console.error('Error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check your DATABASE_URL in .env file');
        console.error('2. Verify your Supabase project is active');
        console.error('3. Check if your IP is allowed (Supabase allows all by default)');
        console.error('4. Verify the connection pooler port (6543) is correct');
        process.exit(1);
    }
}

testConnection();

