import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.js'

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '12345',
  database: 'Azula2',
})

export const db = drizzle({
  client: pool,
  schema,
})
