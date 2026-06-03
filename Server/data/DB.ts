import { Pool } from 'pg';
import 'dotenv/config';

const isRDS = (process.env.DB_HOST || '').includes('rds.amazonaws.com');

const client = new Pool({
  user: process.env.DB_USER || '',
  password: process.env.DB_PASS || '',
  host: process.env.DB_HOST || '',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || '',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: isRDS ? { rejectUnauthorized: false } : false,
});

const connectDB = async () => {
  const maxRetries = 10;
  const retryDelayMs = 3000;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.query('SELECT 1');
      console.log('Connected to the database');
      return;
    } catch (err: any) {
      console.error(`DB connection attempt ${attempt}/${maxRetries} failed:`, err.message);
      if (attempt === maxRetries) {
        console.error('Could not connect to database after max retries. Exiting.');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, retryDelayMs));
    }
  }
};

export { client, connectDB };
