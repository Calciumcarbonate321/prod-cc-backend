import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const stanceEnum = pgEnum("stance", ["attack", "defense", "range"]);
export const stageEnum = pgEnum("stage", ["basic", "stage_1", "stage_2"]);
export const cosmeticsEnum = pgEnum("cosmetic_type", ["frame", "morph", "glow", "flair", "sketch"]);

export const users = table(
  "users",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar("first_name", { length: 256 }),
    discordId: t.varchar("discord_id", { length: 256 }),
  },
);

export const base_cards = table (
  "base_cards",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar("name", { length: 256 }).notNull(),
    assetId: t.varchar("asset_id", { length: 256 }).notNull(),
    flavourText: t.varchar("flavour_text", { length: 256 }).notNull(),
    stance: stanceEnum().notNull(),
    stage: stageEnum().notNull(),
    rarity: t.integer().notNull(),
    fallbackCost: t.integer("fallback_cost").notNull(),
    health: t.integer().notNull(),
  }
);

export const moves = table(
  "moves", 
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar("name", { length: 256 }).notNull(),
    cost: t.integer().notNull(),
    damage: t.integer().notNull(),
    moveEffect: t.varchar("move_effect", { length: 256 }).notNull(),
  }
);

export const base_cards_to_moves = table(
  "base_cards_to_moves",
  {
    base_card_id: t.integer().references(() => base_cards.id).notNull(),
    move_id: t.integer().references(() => moves.id).notNull(),
  },
  (table) => ({
    pk: t.primaryKey({ columns: [table.base_card_id, table.move_id] }),
  })
);

export const cards = table(
  "cards",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    base_card_id: t.integer().references(() => base_cards.id).notNull(),
    owner_id: t.integer().references(() => users.id),
    level: t.integer().notNull(),
    experience: t.integer().notNull(),
    cosmetics_id: t.integer(),
  }
)

export const cosmetics = table(
  "cosmetics",
  {
    "id": t.integer().primaryKey().generatedAlwaysAsIdentity(),
    "name": t.varchar("name", { length: 256 }).notNull(),
    "assetId": t.varchar("asset_id", { length: 256 }).notNull(),
    "assetType": cosmeticsEnum().notNull(),
    "isAnimated": t.boolean().notNull(),
  }
)

export const cards_to_cosmetics = table(
  "cards_to_cosmetics",
  {
    card_id: t.integer().references(() => cards.id).notNull(),
    cosmetic_id: t.integer().references(() => cosmetics.id).notNull(),
  },
  (table) => ({
    pk: t.primaryKey({ columns: [table.card_id, table.cosmetic_id] }),
  })
)
