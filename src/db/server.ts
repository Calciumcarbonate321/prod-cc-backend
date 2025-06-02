import { configDotenv } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";

configDotenv();

export const db = drizzle(process.env.DATABASE_URL!);