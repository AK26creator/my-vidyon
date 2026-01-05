/**
 * Database connection pool utility
 * Used by all Lambda functions to connect to RDS PostgreSQL
 */

const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME || 'myvidyon_erp',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    port: 5432,
    max: 2, // Maximum number of connections in the pool (keep small for Lambda)
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: {
        rejectUnauthorized: false
    }
});

/**
 * Get a database client from the pool
 */
async function getClient() {
    return await pool.connect();
}

/**
 * Execute a query with automatic connection management
 */
async function query(text, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result;
    } finally {
        client.release();
    }
}

/**
 * Close all connections in the pool (for cleanup)
 */
async function end() {
    await pool.end();
}

module.exports = {
    pool,
    getClient,
    query,
    end,
};
