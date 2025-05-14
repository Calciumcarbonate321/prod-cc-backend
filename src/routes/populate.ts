  import { Hono } from "hono";
  import { drizzle } from 'drizzle-orm/node-postgres';
  import { moves, baseCards } from '../db/schema';

  import { configDotenv } from "dotenv";

  configDotenv();


  const populate = new Hono();
  const db = drizzle(process.env.DATABASE_URL!);

  populate.post("/moves", async (c) => {
    const { name, cost, damage, moveEffect } = await c.req.json();
    try {
      await db.insert(moves).values({
        name,
        cost,
        damage,
        moveEffect,
      });
      return c.json({ message: "Move added successfully" });
    } catch (error) {
      console.error("Error adding move:", error);
      return c.json({ error: "Failed to add move" });
    }
  });

populate.post("/base_cards", async (c) => {
    const data = await c.req.json();
    const { name, assetId, flavourText, stance, stage, rarity, fallbackCost, health, packId } = data;
    try {
      await db.insert(baseCards).values({
        name,
        assetId,
        flavourText,
        stance,
        stage,
        rarity,
        fallbackCost,
        health,
        packId,
      });
      return c.json({ message: "Base cards added successfully" })
    } catch (error) {
      console.error("Error adding base cards:", error);
      return c.json({ error: "Failed to add base cards" });
    }
  });

  export default populate;
