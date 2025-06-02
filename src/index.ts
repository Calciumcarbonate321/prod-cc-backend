import { Hono } from "hono";
import { drizzle } from 'drizzle-orm/node-postgres';
import { moves } from './db/schema';
import { configDotenv } from "dotenv";
import card from "./routes/card";
import populate from "./routes/populate";
import levels from "./routes/levels";

configDotenv();

const app = new Hono();
const db = drizzle(process.env.DATABASE_URL!);

app.get("/", async (c) => {
  const allMoves = await db.select().from(moves);
  return c.json(allMoves);
})

app.route("/cards", card);
app.route("/populate", populate);
app.route("/levels", levels);

app.get("/message", (c) => {
  return c.text("Hello Hono!");
});

export default app;
