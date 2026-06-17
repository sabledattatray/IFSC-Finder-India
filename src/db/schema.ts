import { pgTable, text, boolean, varchar, serial } from "drizzle-orm/pg-core";

export const bankBranches = pgTable("bank_branches", {
  id: serial("id").primaryKey(),
  bank: varchar("bank", { length: 255 }),
  ifsc: varchar("ifsc", { length: 15 }).unique().notNull(),
  branch: varchar("branch", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  district: varchar("district", { length: 255 }),
  taluka: varchar("taluka", { length: 255 }),
  cityVillage: varchar("city_village", { length: 255 }),
  pincode: varchar("pincode", { length: 20 }),
  contact: varchar("contact", { length: 255 }),
  micr: varchar("micr", { length: 50 }),
  swift: varchar("swift", { length: 50 }),
  imps: boolean("imps"),
  neft: boolean("neft"),
  rtgs: boolean("rtgs"),
  upi: boolean("upi"),
  searchStrReady: text("search_str_ready"),
});
