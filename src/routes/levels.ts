import { Hono } from "hono";
import { cards } from "../db/schema";
import { db } from "../db/server";
import { eq } from "drizzle-orm";

const levels = new Hono();

const levelThresholds = [
    91, 100, 110, 121, 133, 146, 161, 177, 195, 215, 237, 261, 288, 317, 349, 385, 425, 469, 517, 570, 629, 694, 766, 845, 932, 1028, 1134, 1251, 1381, 1524, 1682, 1856, 2049, 2262, 2497, 2756, 3042, 3358, 3707, 4092, 4517, 4986, 5504, 6076, 6707, 7404, 8174, 9024, 9962, 10998, 12141, 13403, 14796, 16334, 18032, 19907, 21977, 24262, 26785, 29570, 32645, 36040, 39788, 43925, 48493, 53536, 59103, 65249, 72034, 79525, 87795, 96925, 107005, 118133, 130418, 143981, 158955, 175486, 193736, 213884, 236127, 260684, 287795, 317725, 350768, 387247, 427520, 471982, 521068, 575259, 635085, 701133, 774050, 854551, 943424, 1041540, 1149860, 1269445, 1401467, 1547219
];

function getLevel(experience: number) {
    let level = 0;
    for (let i = 0; i < levelThresholds.length; i++) {
        if (experience >= levelThresholds[i]) {
            level = i + 1;
        } else {
            break;
        }
    }
    return level;
}

levels.post("/", async(c)=>{
    // Adds XP to a card and auto calculates level increments
    const { cardId, xp } = await c.req.json();
    try {
        const card = await db.select().from(cards).where(eq(cards.uid, cardId)).limit(1);
        if (card.length === 0) {
            return c.json({ error: "Card not found" }, 404);
        }
        const currentExp = card[0].experience;
        const newExp = currentExp + xp;
        const newLevel = getLevel(newExp);
        const updatedCard = await db.update(cards).set({experience: newExp, level: newLevel}).where(eq(cards.uid, cardId));
        return c.json({ message: "Card experience updated successfully", experience: newExp, level: newLevel, card: updatedCard });
    } catch (err) {
        return c.json({ error: "Internal server error", details: err instanceof Error ? err.message : err }, 500);
    }
})

export default levels;