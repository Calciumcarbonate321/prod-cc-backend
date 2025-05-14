import { Hono } from "hono";
import { drizzle } from 'drizzle-orm/node-postgres';
import { cards, baseCards} from '../db/schema';
import { configDotenv } from "dotenv";
import { randomInt } from 'crypto';
import { eq } from "drizzle-orm";

configDotenv();

const card = new Hono();
const db = drizzle(process.env.DATABASE_URL!);

card.get('/', async (c) => {
  // Returns all cards
  const allCards = await db.select().from(cards);
  if (!allCards || allCards.length === 0) {
    return c.text("No cards found");
  }
  return c.json(allCards);
});

card.post('/spawn', async (c) => {
  // Spawns a specified number of cards
  const { amount } = await c.req.json();
  const allBaseCards = await db.select().from(baseCards);
  const randomBaseCards = [];

  for (let i = 0; i < amount; i++) {
    const randomIndex = randomInt(0, allBaseCards.length);
    const randomBaseCard = allBaseCards[randomIndex];
    randomBaseCards.push(randomBaseCard);
  }

  if (!randomBaseCards) {
    return c.json({ message: "No base cards found" }, 404);
  }

  console.log("Spawning a: ", randomBaseCards.map(card => card.name), "with id: ", randomBaseCards.map(card => card.id));

  try {
    const newCards = await db.insert(cards).values(
      randomBaseCards.map((baseCard) => ({
        baseCardId: baseCard.id,
        level: 1,
        experience: 0,
      }))
    ).returning();

    return c.json(newCards);
  } catch (error) {
    console.error("Error spawning cards:", error);
    return c.json({ message: "Failed to spawn cards"}, 500);
  }
});

card.post('/claim',async(c)=>{
  // Claims a card for a user
  const { userId, cardId } = await c.req.json();
  const claimedCard = await db.update(cards).set({ownerId: userId}).where(eq(cards.id, cardId)).returning();

  if (!claimedCard) {
    return c.json({ message: "No card found" }, 404);
  }

  return c.json(claimedCard);
})

export default card;
