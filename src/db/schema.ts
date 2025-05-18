import { pgEnum,primaryKey, pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const stanceEnum = pgEnum("stance", ["attack", "defense", "range"]);
export const stageEnum = pgEnum("stage", ["basic", "stage_1", "stage_2"]);
export const cosmeticType = pgEnum("cosmetic_type", ["frame", "morph", "glow", "flair", "sketch"]);
export const misprintType = pgEnum("misprint_type", ["low_toner", "ink_error", "obstruction_error", "miscut_error", "double_print_error"]);

export const users = table(
  "users",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar("name", { length: 256 }),
    discordId: t.varchar("discord_id", { length: 256 }),
  },
);

export const baseCards = table (
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
    packId: t.integer("pack_id").references(() => packs.id).notNull(),
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

export const baseCardsToMoves = table(
  "base_cards_to_moves",
  {
    baseCardId: t.integer("base_card_id").references(() => baseCards.id).notNull(),
    moveId: t.integer("move_id").references(() => moves.id).notNull(),
  },
  (table) => [
    primaryKey({columns: [table.baseCardId, table.moveId]}),
  ]
);

export const cards = table(
  "cards",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    uid: t.uuid().defaultRandom().notNull(),
    baseCardId: t.integer("base_card_id").references(() => baseCards.id).notNull(),
    misprint: misprintType(),
    cardGrade: t.integer("card_grade").default(1),
    ownerId: t.integer("owner_id").references(() => users.id),
    level: t.integer().notNull(),
    experience: t.integer().notNull(),
  }
)

export const cosmetics = table(
  "cosmetics",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar("name", { length: 256 }).notNull(),
    assetId: t.varchar("asset_id", { length: 256 }).notNull(),
    assetType: cosmeticType().notNull(),
    isAnimated: t.boolean().notNull(),
  }
)

export const cardsToCosmetics = table(
  "cards_to_cosmetics",
  {
    cardId: t.integer("card_id").references(() => cards.id).notNull(),
    cosmeticId: t.integer("cosmetic_id").references(() => cosmetics.id).notNull(),
  },
  (table) => [
    primaryKey({columns: [table.cardId, table.cosmeticId]}),
  ]
)


export const packs = table(
  "packs",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar("name", { length: 256 }).notNull(),
    assetId: t.varchar("asset_id", { length: 256 }).notNull(),
    description: t.varchar("description", { length: 256 }).notNull(),
    setId: t.integer("set_id").references(() => sets.id).notNull(),
  }
)

export const sets = table(
  "sets",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar("name", { length: 256 }).notNull(),
    assetId: t.varchar("asset_id", { length: 256 }).notNull(),
    description: t.varchar("description", { length: 256 }).notNull(),
  } 
)