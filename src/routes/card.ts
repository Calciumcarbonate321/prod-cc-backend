import { Hono } from "hono";
import { cards, baseCards, misprintType} from '../db/schema';
import { randomInt } from 'crypto';
import { eq } from "drizzle-orm";
import { db } from "../db/server";
import { redis } from "../db/redis";

const card = new Hono();

card.get('/', async (c) => {
  // Returns all cards
  const allCards = await db.select().from(baseCards);
  if (!allCards || allCards.length === 0) {
    return c.text("No cards found");
  }
  return c.json(allCards);
});

card.get('/:uid', async (c) => {
  //get info on one card
  const { uid } = c.req.param();
  const card = await db.select().from(cards).where(eq(cards.uid, uid)).limit(1);
  if (!card || card.length === 0) {
    return c.json({ message: "No card found" }, 404);
  }
  return c.json(card);
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

  //random misprint
  const randomMisprintIndex = randomInt(0, misprintType.enumValues.length) as keyof typeof misprintType.enumValues;
  let randomMisprint = null;
  if (randomInt(0, 100)<10){
    randomMisprint = misprintType.enumValues[randomMisprintIndex];
  }
  
  const grade = getRandomGrade();
  
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
        misprintType: randomMisprint,
        cardGrade: grade,
      }))
    ).returning();

    return c.json(newCards);
  } catch (error) {
    console.error("Error spawning cards:", error);
    return c.json({ message: "Failed to spawn cards"}, 500);
  }
});

card.post('/spawn/pack', async(c)=>{
  //spawns cards from specified pack
  const { amount, packId, userId } = await c.req.json();
  //checks cooldown from redis
  if (!amount || !packId || !userId) {
    return c.json({ message: "Invalid request data" }, 400);
  }
  const cooldownKey = `claim_cooldown:${userId}`;
  const cooldown = await redis.get(cooldownKey);
  console.log("Cooldown status for user:", userId, "is", cooldown);
  if (cooldown) {
    return c.json({ message: "You are on cooldown. Please wait before claiming another card." }, 429);
  }
  const allBaseCards = await db.select().from(baseCards).where(eq(baseCards.packId, packId));
  const randomBaseCards = [];
  for (let i = 0; i < amount; i++) {
    const randomIndex = randomInt(0, allBaseCards.length);
    const randomBaseCard = allBaseCards[randomIndex];
    randomBaseCards.push(randomBaseCard); 
  }
  //random misprint
  const randomMisprintIndex = randomInt(0, misprintType.enumValues.length) as keyof typeof misprintType.enumValues;
  let randomMisprint = null;
  if (randomInt(0, 100) < 10) {
    randomMisprint = misprintType.enumValues[randomMisprintIndex];
  }
  const grade = getRandomGrade();
  if (!randomBaseCards) {
    return c.json({ message: "No base cards found" }, 404);
  }
  console.log("Spawning a: ", randomBaseCards.map(card => card.name), "with id: ", randomBaseCards.map(card => card.id));
  await redis.set(cooldownKey, 'active'); //sets cooldown in redis
  await redis.expire(cooldownKey, 30); //sets cooldown for 30 seconds
  try {
    const newCards = await db.insert(cards).values(
      randomBaseCards.map((baseCard) => ({
        baseCardId: baseCard.id,
        level: 1,
        experience: 0,
        misprintType: randomMisprint, 
        cardGrade: grade,
      }))
    ).returning();
    //sets cooldown in redis for 30s
    

    return c.json(newCards);
  } catch (error) {
    console.error("Error spawning cards:", error);
    return c.json({ message: "Failed to spawn cards"}, 500);
  }
})

card.post('/claim',async(c)=>{
  // Claims a card for a user
  const { userId, cardId } = await c.req.json();
  const claimedCard = await db.update(cards).set({ownerId: userId}).where(eq(cards.id, cardId)).returning();

  if (!claimedCard) {
    return c.json({ message: "No card found" }, 404);
  }

  return c.json(claimedCard);
})

function getRandomGrade(): number {
  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]; // Grade 1 has highest weight, grade 10 lowest
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const rand = Math.random() * totalWeight;

  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) {
      return i + 1; // Grades are 1-based
    }
  }

  return 10; // fallback (shouldn't happen)
}

export default card;
