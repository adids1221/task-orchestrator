import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prefer IPv4 pooler URL when available, fallback to default direct URL.
const connectionString = process.env.DATABASE_URL_V4 || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL_V4 or DATABASE_URL must be configured");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
