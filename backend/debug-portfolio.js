import 'dotenv/config';
import { query } from './db/connection.js';

async function testQuery() {
    console.log('🔍 Testing Portfolio Query...');

    // 1. Check Enum Values
    try {
        console.log('\nChecking valid categories...');
        const enumResult = await query(`
            SELECT unnest(enum_range(NULL::category)) as cat_value
        `);
        console.log('Valid categories:', enumResult.rows.map(r => r.cat_value));
    } catch (e) {
        console.log('Could not fetch enum values (might not exist):', e.message);
    }

    // 2. Run the main query
    try {
        const category = 'web_pages';
        console.log(`\nQuerying for category: '${category}'...`);

        const result = await query(`
            SELECT *
            FROM portfolio
            WHERE category = $1
            ORDER BY created_at DESC
        `, [category]);

        console.log('✅ Query success!');
        console.log('Rows found:', result.rows.length);
        console.log('Sample row:', result.rows[0]);
    } catch (error) {
        console.error('❌ Query failed!');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
    }

    process.exit();
}

testQuery();
