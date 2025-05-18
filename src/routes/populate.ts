  import { Hono } from "hono";
  import { drizzle } from 'drizzle-orm/node-postgres';
  import { moves, baseCards, packs, sets } from '../db/schema';
  import { eq } from "drizzle-orm";

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

populate.patch("/base_cards/:id", async (c) => {
  const { id } = c.req.param(); 
  const data = await c.req.json();
  const res = await db.update(baseCards).set(data).where(eq(baseCards.id, parseInt(id)));
  if (res) {
    return c.json({ message: "Base card updated successfully" });
  } else {
    return c.json({ error: "Failed to update base card" });
  }
})

populate.post("/packs", async(c)=> {
  const { name, assetId, description, setId } = await c.req.json();
  try {
    await db.insert(packs).values({
      name,
      assetId,
      description,
      setId,
    });
    return c.json({ message: "Pack added successfully" });
  } catch (error) {
    console.error("Error adding pack:", error);
    return c.json({ error: "Failed to add pack" });
  }
})

populate.post("/sets", async(c)=>{
  const { name, assetId, description } = await c.req.json();
  try {
    await db.insert(sets).values({
      name,
      assetId,
      description,
    });
    return c.json({ message: "Set added successfully" });
  } catch (error) {
    console.error("Error adding set:", error);
    return c.json({ error: "Failed to add set" });
  }
})

  export default populate;
