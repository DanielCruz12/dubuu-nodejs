import 'dotenv/config'
import fs from 'fs';
import path from 'path';
import { type Config, defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  out: './drizzle',
  schema: './src/database/schemas/index.ts',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: {
      rejectUnauthorized: false,
       ca: fs.readFileSync(
        path.join(__dirname, 'us-east-2-bundle.pem')
      ).toString(),
    },
  },
  strict: true,
  verbose: true,
}) satisfies Config
