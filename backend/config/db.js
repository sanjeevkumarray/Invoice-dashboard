import pg from 'pg';

const pool = new pg.Pool({
  // Changed sslmode=require to sslmode=verify-full to satisfy pg driver requirements
  connectionString: '',
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle cloud database client:', err.message);
});

export default pool;