import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { bankBranches } from "./schema.js";
import fs from "fs";
import * as path from "path";

let pool: Pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
} else {
  pool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
  });
}
const db = drizzle(pool);

function parseCsvLineCustom(line: string): string[] {
  const result: string[] = [];
  let currentStr = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        currentStr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(currentStr);
      currentStr = "";
    } else {
      currentStr += char;
    }
  }
  result.push(currentStr);
  return result;
}

function getBankAliases(bankName: string): string {
    const up = bankName.toUpperCase();
    if (up.includes("STATE BANK OF INDIA")) return "SBI";
    if (up.includes("HDFC")) return "HDFC BANK HOUSING DEVELOPMENT FINANCE CORPORATION";
    if (up.includes("ICICI")) return "ICICI BANK INDUSTRIAL CREDIT AND INVESTMENT CORPORATION OF INDIA";
    if (up.includes("PUNJAB NATIONAL BANK")) return "PNB";
    if (up.includes("BANK OF BARODA")) return "BOB";
    if (up.includes("BANK OF INDIA")) return "BOI";
    return "";
}
function normalizeSearchText(t: string): string {
    return t.replace(/[^A-Z0-9]/g, "");
}
function getCityVillage(address: string, branch: string, district: string): string {
    let result = "UNKNOWN";
    if (district && district !== "GENERAL") result = district;
    return result;
}
function getTaluka(address: string, branch: string, city: string): string {
    return city;
}

async function run() {
  const csvPath = "Bank_Data.csv";
  if (!fs.existsSync(csvPath)) {
    console.error("No Bank_Data.csv to seed!");
    process.exit(1);
  }
  console.log("Loading CSV lines...");
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split(/\r?\n/);
  
  const records = [];
  console.log(`Parsing ${lines.length} lines...`);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const cols = parseCsvLineCustom(line);
    if (cols.length < 6) continue;
    
    const bankOriginal = cols[0] || "";   // col 0: bank name
    const ifsc = cols[1] || "";           // col 1: IFSC code
    const branch = cols[2] || "";         // col 2: branch name
    const address = cols[3] || "";        // col 3: address
    const pincode = cols[4] || "";        // col 4: pincode
    const state = cols[5] || "";          // col 5: state
    const districtOrig = cols[6] || "";   // col 6: district
    const contact = cols[7] || "";        // col 7: contact
    const imps = (cols[8] || "").toUpperCase() === "TRUE";  // col 8: IMPS
    const rtgs = (cols[9] || "").toUpperCase() === "TRUE";  // col 9: RTGS
    const cityNew = cols[10] || "";       // col 10: city/village
    const _col11 = cols[11] || "";        // col 11: (reserved/unused column - kept for index alignment)
    const neft = (cols[12] || "").toUpperCase() === "TRUE"; // col 12: NEFT
    const micr = cols[13] || "";          // col 13: MICR
    const upi = (cols[14] || "").toUpperCase() === "TRUE";  // col 14: UPI
    const swift = cols[15] || "";         // col 15: SWIFT

    const bankUp = bankOriginal.toUpperCase();
    const branchUp = branch.toUpperCase();
    const districtUp = districtOrig ? districtOrig.toUpperCase() : "GENERAL";
    const cityUp = cityNew ? cityNew.toUpperCase() : getCityVillage(address, branchUp, districtUp);

    const aliases = getBankAliases(bankUp);
    const rawSearchStr = `${bankUp} ${aliases} ${branchUp} ${ifsc} ${address} ${cityUp} ${districtUp} ${state} ${pincode}`;

    records.push({
      bank: bankUp,
      ifsc: ifsc.toUpperCase(),
      branch: branchUp,
      address,
      city: cityUp,
      state: state.toUpperCase(),
      district: districtUp,
      taluka: getTaluka(address, branchUp, cityUp),
      cityVillage: cityUp,
      pincode,
      contact,
      micr,
      swift,
      imps,
      neft,
      rtgs,
      upi,
      searchStrReady: normalizeSearchText(rawSearchStr)
    });
  }

  console.log(`Inserting ${records.length} records into Postgres in chunks...`);
  
  const CHUNK_SIZE = 1000;
  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    try {
      await db.insert(bankBranches).values(chunk).onConflictDoNothing();
    } catch (err: any) {
      console.error(`Error inserting chunk:`, err.message);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

run();
