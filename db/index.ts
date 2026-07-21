import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

// Ahora usará el link de la nube cuando esté en Netlify
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_hFtk2q0fVoAN@ep-still-butterfly-aidnuws4-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

export const db = drizzle({
  client: pool,
  schema,
});
