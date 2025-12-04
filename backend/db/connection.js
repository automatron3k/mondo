import pkg from 'pg';
const { Pool } = pkg;

// Parse DATABASE_URL to determine if it's Supabase
const databaseUrl = process.env.DATABASE_URL || 'postgresql://mondo:mondo_password@localhost:5432/mondo_db';
const isSupabase = databaseUrl.includes('supabase.co') || databaseUrl.includes('pooler.supabase.com');

// Connection pool configuration
const poolConfig = {
    connectionString: databaseUrl,
    // Connection pool settings
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Increased timeout for Supabase
};

// Supabase requires SSL connections
if (isSupabase) {
    poolConfig.ssl = {
        rejectUnauthorized: false // Supabase uses self-signed certificates
    };
    console.log('🔒 Using Supabase database with SSL');
} else {
    console.log('📦 Using local PostgreSQL database');
}

// Create a connection pool
const pool = new Pool(poolConfig);

// Test the connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

// Helper function to execute queries
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Helper function to get a client from the pool (for transactions)
export const getClient = async () => {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);
    
    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5 seconds!');
    }, 5000);
    
    // Monkey patch the query method to log the query when a client is released
    client.query = (...args) => {
        client.lastQuery = args;
        return query(...args);
    };
    
    client.release = () => {
        clearTimeout(timeout);
        client.query = query;
        client.release = release;
        return release();
    };
    
    return client;
};

export default pool;

