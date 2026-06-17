import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Dynamic import based on environment
async function run() {
  const dataDir = "./ifsc-local-data";

  // Check if DB already seeded
  if (fs.existsSync(dataDir)) {
    console.log("[Setup] Local PGlite database already exists, skipping seed.");
    return;
  }

  const csvFile = "Bank_Data.csv";
  if (!fs.existsSync(csvFile)) {
    console.error("[Setup] dummy.csv not found! Please place it in the project root.");
    process.exit(1);
  }

  console.log("[Setup] Initializing PGlite database...");
  const { PGlite } = await import("@electric-sql/pglite");
  const client = new PGlite(dataDir);

  // Create table
  await client.exec(`
    CREATE TABLE IF NOT EXISTS bank_branches (
      id SERIAL PRIMARY KEY,
      bank VARCHAR(255),
      ifsc VARCHAR(15) UNIQUE NOT NULL,
      branch VARCHAR(255),
      address TEXT,
      city VARCHAR(255),
      state VARCHAR(255),
      district VARCHAR(255),
      taluka VARCHAR(255),
      city_village VARCHAR(255),
      pincode VARCHAR(20),
      contact VARCHAR(255),
      micr VARCHAR(50),
      swift VARCHAR(50),
      imps BOOLEAN,
      neft BOOLEAN,
      rtgs BOOLEAN,
      upi BOOLEAN,
      search_str_ready TEXT
    );
  `);
  console.log("[Setup] Table created.");

  // Parse CSV
  console.log("[Setup] Reading Bank_Data.csv...");
  const content = fs.readFileSync(csvFile, "utf-8");
  const lines = content.split(/\r?\n/).filter(Boolean);

  // Skip header row if present
  const dataLines = lines[0].startsWith("BANK") ? lines.slice(1) : lines;

  function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(cur); cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result;
  }

  function normalizeSearchText(t: string): string {
    return t.toUpperCase().replace(/[^A-Z0-9]/g, "");
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

  console.log(`[Setup] Parsing ${dataLines.length} data lines (header skipped)...`);
  let inserted = 0;
  let errors = 0;
  const CHUNK_SIZE = 500;

  for (let i = 0; i < dataLines.length; i += CHUNK_SIZE) {
    const chunk = dataLines.slice(i, i + CHUNK_SIZE);
    let values: string[] = [];
    let paramIndex = 1;
    let params: any[] = [];

    for (const line of chunk) {
      const cols = parseCsvLine(line);
      if (cols.length < 6) continue;

      const bankUp = (cols[0] || "").toUpperCase();
      const ifsc = (cols[1] || "").toUpperCase();
      const branchUp = (cols[2] || "").toUpperCase();
      const address = cols[3] || "";
      const pincode = cols[4] || "";
      const state = (cols[5] || "").toUpperCase();
      const districtUp = cols[6] ? cols[6].toUpperCase() : "GENERAL";
      const contact = cols[7] || "";
      const imps = (cols[8] || "").toUpperCase() === "TRUE";
      const rtgs = (cols[9] || "").toUpperCase() === "TRUE";
      const cityUp = cols[10] ? cols[10].toUpperCase() : districtUp;
      const neft = (cols[12] || "").toUpperCase() === "TRUE";
      const micr = cols[13] || "";
      const upi = (cols[14] || "").toUpperCase() === "TRUE";
      const swift = cols[15] || "";

      const aliases = getBankAliases(bankUp);
      const rawSearch = `${bankUp} ${aliases} ${branchUp} ${ifsc} ${address} ${cityUp} ${districtUp} ${state} ${pincode}`;
      const searchReady = normalizeSearchText(rawSearch);

      const p = paramIndex;
      values.push(`($${p},$${p+1},$${p+2},$${p+3},$${p+4},$${p+5},$${p+6},$${p+7},$${p+8},$${p+9},$${p+10},$${p+11},$${p+12},$${p+13},$${p+14},$${p+15},$${p+16},$${p+17})`);
      params.push(bankUp, ifsc, branchUp, address, cityUp, state, districtUp, cityUp, pincode, contact, micr, swift, imps, neft, rtgs, upi, searchReady, cityUp);
      paramIndex += 18;
    }

    if (values.length === 0) continue;

    const sql = `INSERT INTO bank_branches (bank, ifsc, branch, address, city, state, district, taluka, pincode, contact, micr, swift, imps, neft, rtgs, upi, search_str_ready, city_village)
      VALUES ${values.join(",")}
      ON CONFLICT (ifsc) DO NOTHING`;

    try {
      await client.query(sql, params);
      inserted += values.length;
    } catch (err: any) {
      errors++;
      if (errors <= 3) console.error(`[Setup] Insert error: ${err.message}`);
    }

    if ((i + CHUNK_SIZE) % 5000 === 0 || i + CHUNK_SIZE >= dataLines.length) {
      console.log(`[Setup] Progress: ${Math.min(i + CHUNK_SIZE, dataLines.length)}/${dataLines.length} lines processed, ${inserted} inserted`);
    }
  }

  console.log(`[Setup] Seeding complete! ${inserted} records inserted. ${errors} errors.`);
  await client.close();
}

run().catch(err => {
  console.error("[Setup] Fatal error:", err);
  process.exit(1);
});
