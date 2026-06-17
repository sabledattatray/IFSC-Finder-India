import express from "express";
import serverless from "serverless-http";
import path from "path";
import fs from "fs";
import readline from "readline";
import "dotenv/config";
import { GoogleGenAI, Type } from "@google/genai";
import { fileURLToPath } from "url";

// ESM-native directory resolution with CJS fallback for bundled output
const safeDirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

interface BankRecord {
  bank: string;
  ifsc: string;
  branch: string;
  address: string;
  city: string; // Original, parsed city column
  state: string;
  district: string;
  taluka: string;
  cityVillage: string;
  pincode: string;
  contact: string;
  micr: string;
  swift: string;
  imps: boolean;
  neft: boolean;
  rtgs: boolean;
  upi: boolean;
  searchStrReady: string;
}

// Compact Pre-Compiled Index Containers for instant cold starts
let statesList: string[] = [];
let stateToDistrictsObj: Record<string, string[]> = {};
let districtToTalukasObj: Record<string, string[]> = {};
let talukaToCitiesObj: Record<string, string[]> = {};
let cityToBanksObj: Record<string, string[]> = {};
const searchCache = new Map<string, any[]>();

// Helper for parsing CSV lines with double quotes
function parseCsvLine(line: string): string[] {
  if (!line.includes('"')) {
    return line.split(',');
  }
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  const len = line.length;
  for (let i = 0; i < len; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Extract Taluka/Tehsil/Tahsil from address & branch
function getTaluka(address: string, branch: string, city: string): string {
  const addrUpper = address.toUpperCase();
  const talukaMatch = addrUpper.match(/(?:TALUKA|TEHSIL|TAHSIL|TALUK|TAL\.?|TEH\.?)\s*(?:AND\s+DIST\.?)?\s*([A-Z0-9]+[A-Z0-9\s]{1,15})(?:,|\.|\b)/);
  if (talukaMatch) {
    const match = talukaMatch[1].trim();
    if (match.length >= 3 && match !== "AND") return match;
  }
  const poMatch = addrUpper.match(/(?:AT &? POST|AT PO|A\/P|A\s+P)\s*([A-Z0-9]+[A-Z0-9\s]{1,15})(?:,|\.|\b)/);
  if (poMatch) {
     const match = poMatch[1].trim();
     if (match.length >= 3) return match;
  }
  const cleanBranch = branch.toUpperCase().replace(/\b(?:BRANCH|ADB|COMMERCIAL|PERSONAL|RTGS|HO|SERVICE|MICRO)\b/g, '').trim();
  if (cleanBranch.length >= 3 && cleanBranch.length <= 15) {
    return cleanBranch;
  }
  return city.split(' ')[0].toUpperCase();
}

// Extract City/Village from address & branch
function getCityVillage(address: string, branch: string, city: string): string {
  const addrUpper = address.toUpperCase();
  const villMatch = addrUpper.match(/(?:VILLAGE|VILL\.?|TOWN)\s+([A-Z0-9]+[A-Z0-9\s]{1,15})(?:,|\.|\b)/);
  if (villMatch) {
    const match = villMatch[1].trim();
    if (match.length >= 3) return match;
  }
  const cleanBranch = branch.toUpperCase().replace(/\b(?:BRANCH|ADB|COMMERCIAL|PERSONAL|RTGS|HO|SERVICE|MICRO)\b/g, '').trim();
  if (cleanBranch.length >= 3) {
    return cleanBranch;
  }
  return city.toUpperCase();
}

function getBankAliases(bankName: string): string {
  const bank = bankName.toUpperCase();
  const aliases: string[] = [];
  if (bank.includes("STATE BANK OF INDIA")) aliases.push("SBI");
  if (bank.includes("HDFC BANK") || bank.includes("HDFC")) aliases.push("HDFC");
  if (bank.includes("ICICI BANK") || bank.includes("ICICI")) aliases.push("ICICI");
  if (bank.includes("PUNJAB NATIONAL BANK")) aliases.push("PNB");
  if (bank.includes("BANK OF BARODA")) aliases.push("BOB");
  if (bank.includes("BANK OF INDIA") && !bank.includes("STATE BANK OF INDIA") && !bank.includes("UNION BANK OF INDIA") && !bank.includes("CENTRAL BANK OF INDIA")) aliases.push("BOI");
  if (bank.includes("CENTRAL BANK OF INDIA")) aliases.push("CBI");
  if (bank.includes("BANK OF MAHARASHTRA")) aliases.push("BOM");
  if (bank.includes("UNION BANK OF INDIA")) aliases.push("UBI");
  if (bank.includes("INDIAN OVERSEAS BANK")) aliases.push("IOB");
  if (bank.includes("JAMMU AND KASHMIR") || bank.includes("JAMMU & KASHMIR")) aliases.push("JKB", "J&K", "J AND K");
  if (bank.includes("SOUTH INDIAN BANK")) aliases.push("SIB");
  if (bank.includes("INDIAN BANK") && !bank.includes("UNION BANK OF INDIA") && !bank.includes("STATE BANK OF INDIA") && !bank.includes("CENTRAL BANK OF INDIA")) aliases.push("IB");
  if (bank.includes("CANARA BANK")) aliases.push("CB");
  if (bank.includes("KOTAK MAHINDRA")) aliases.push("KOTAK");
  if (bank.includes("COOPERATIVE") || bank.includes("CO-OPERATIVE")) aliases.push("COOP", "COOPERATIVE");
  if (bank.includes("FEDERAL BANK")) aliases.push("FEDERAL");
  if (bank.includes("YES BANK")) aliases.push("YES");
  if (bank.includes("INDUSIND BANK")) aliases.push("INDUSIND");
  if (bank.includes("UCO BANK")) aliases.push("UCO");
  if (bank.includes("SIDBI")) aliases.push("SIDBI");
  if (bank.includes("NABARD")) aliases.push("NABARD");
  return aliases.join(" ");
}

function normalizeSearchText(str: string): string {
  return str
    .toUpperCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCsvPath(): string {
  const filename = 'Bank_Data.csv';
  const startPaths = [
    process.cwd(), 
    safeDirname, 
    typeof __dirname !== 'undefined' ? __dirname : '',
    '/tmp'
  ].filter(Boolean);
  
  for (const base of startPaths) {
    let current = base;
    for (let i = 0; i < 6; i++) {
       const p = path.join(current, filename);
       if (fs.existsSync(p)) return p;
       const p2 = path.join(current, "public", filename);
       if (fs.existsSync(p2)) return p2;
       const parent = path.dirname(current);
       if (parent === current) break;
       current = parent;
    }
  }
  // Fallback to /tmp if all else fails
  return path.join('/tmp', filename);
}

// Function to load and index precomputed cascaded metadata on startup
async function loadDatabase() {
  console.log("Loading and indexing metadata from CSV...");
  const start = Date.now();
  try {
    let csvPath = getCsvPath();
    if (!fs.existsSync(csvPath)) {
      console.warn(`WARNING: Bank_Data.csv not found locally. Attempting to download it to /tmp...`);
      try {
        const fetch = (await import("node-fetch")).default;
        const res = await fetch("https://docs.google.com/spreadsheets/d/1H0cB4IsodVhx11WeZy4nIDzxK1t6aBVQ/export?format=csv");
        const body = await res.text();
        fs.writeFileSync("/tmp/Bank_Data.csv", body);
        csvPath = "/tmp/Bank_Data.csv";
        console.log("Download to /tmp complete!");
      } catch (dlErr) {
        console.error("Failed to download CSV dynamically:", dlErr);
        return;
      }
    }

    const rl = readline.createInterface({
      input: fs.createReadStream(csvPath),
      crlfDelay: Infinity
    });

    const statesSet = new Set<string>();
    const stateDistricts = new Map<string, Set<string>>();
    const districtTalukas = new Map<string, Set<string>>();
    const talukaCities = new Map<string, Set<string>>();
    const cityBanks = new Map<string, Set<string>>();

    let lineCount = 0;
    for await (const line of rl) {
      if (lineCount === 0) {
        lineCount++;
        continue;
      }
      const cols = parseCsvLine(line);
      if (cols.length < 6) continue;

      const bankNameOriginal = cols[0] || "";
      const branchName = cols[2] || "";
      const address = cols[3] || "";
      const stateOriginal = cols[5] || "";
      const districtOriginal = cols[6] || "";
      const cityNew = cols[10] || "";

      const bank = bankNameOriginal.toUpperCase();
      const branch = branchName.toUpperCase();
      const state = stateOriginal.toUpperCase();
      const district = districtOriginal ? districtOriginal.toUpperCase() : "GENERAL";
      const cityVillage = cityNew ? cityNew.toUpperCase() : getCityVillage(address, branch, district);
      const taluka = getTaluka(address, branch, cityVillage);

      if (state) {
        statesSet.add(state);
        if (!stateDistricts.has(state)) stateDistricts.set(state, new Set());
        stateDistricts.get(state)!.add(district);
      }
      if (district) {
        if (!districtTalukas.has(district)) districtTalukas.set(district, new Set());
        districtTalukas.get(district)!.add(taluka);
      }
      if (taluka) {
        if (!talukaCities.has(taluka)) talukaCities.set(taluka, new Set());
        talukaCities.get(taluka)!.add(cityVillage);
      }
      if (cityVillage) {
        if (!cityBanks.has(cityVillage)) cityBanks.set(cityVillage, new Set());
        cityBanks.get(cityVillage)!.add(bank);
      }
      lineCount++;
    }

    // Convert sets to sorted arrays
    statesList = Array.from(statesSet).sort();
    
    stateToDistrictsObj = {};
    for (const [s, dists] of stateDistricts.entries()) {
      stateToDistrictsObj[s] = Array.from(dists).sort();
    }

    districtToTalukasObj = {};
    for (const [d, tals] of districtTalukas.entries()) {
      districtToTalukasObj[d] = Array.from(tals).sort();
    }

    talukaToCitiesObj = {};
    for (const [t, cities] of talukaCities.entries()) {
      talukaToCitiesObj[t] = Array.from(cities).sort();
    }

    cityToBanksObj = {};
    for (const [c, banks] of cityBanks.entries()) {
      cityToBanksObj[c] = Array.from(banks).sort();
    }

    console.log(`Cascading lookup metadata loaded from ${lineCount} lines in ${Date.now() - start}ms!`);
  } catch (err) {
    console.error("Critical error loading CSV catalog:", err);
  }
}

let isDatabaseLoaded = false;
let databaseLoadingPromise: Promise<void> | null = null;
let globalBankRecords: BankRecord[] = [];

function ensureDatabaseLoaded(): Promise<void> {
  if (isDatabaseLoaded) {
    return Promise.resolve();
  }
  if (!databaseLoadingPromise) {
    databaseLoadingPromise = loadDatabase().then(() => {
      // Also load all records for fast memory queries
      try {
        const csvPath = getCsvPath();
        if (fs.existsSync(csvPath)) {
          console.log("Loading full database into memory for lightning fast search...");
          const lines = fs.readFileSync(csvPath, "utf8").split(/\r?\n/);
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            const cols = parseCsvLine(line);
            if (cols.length < 6) continue;
            
            const bankOriginal = cols[0] || "";
            const ifsc = cols[1] || "";
            const branch = cols[2] || "";
            const address = cols[3] || "";
            const pincode = cols[4] || "";
            const state = cols[5] || "";
            const districtOrig = cols[6] || "";
            const contact = cols[7] || "";
            const imps = (cols[8] || "").toUpperCase() === "TRUE";
            const rtgs = (cols[9] || "").toUpperCase() === "TRUE";
            const cityNew = cols[10] || "";
            const neft = (cols[12] || "").toUpperCase() === "TRUE";
            const micr = cols[13] || "";
            const upi = (cols[14] || "").toUpperCase() === "TRUE";
            const swift = cols[15] || "";

            const bankUp = bankOriginal.toUpperCase();
            const branchUp = branch.toUpperCase();
            const districtUp = districtOrig ? districtOrig.toUpperCase() : "GENERAL";
            const cityUp = cityNew ? cityNew.toUpperCase() : getCityVillage(address, branchUp, districtUp);

            const aliases = getBankAliases(bankUp);
            const rawSearchStr = `${bankUp} ${aliases} ${branchUp} ${ifsc} ${address} ${cityUp} ${districtUp} ${state} ${pincode}`;

            globalBankRecords.push({
              bank: bankUp,
              ifsc: ifsc.toUpperCase(),
              branch: branchUp,
              address,
              city: cityUp, // keep original usage for compatibility
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
          console.log(`Loaded ${globalBankRecords.length} records into memory.`);
        }
      } catch (err) {
        console.error("Failed to load records into memory:", err);
      }
      isDatabaseLoaded = true;
    });
  }
  return databaseLoadingPromise;
}

// Memory-backed fast query
async function queryCsvStream(filterFn: (record: BankRecord) => boolean, limit: number = 100): Promise<any[]> {
  const csvPath = getCsvPath();
  if (!fs.existsSync(csvPath) && globalBankRecords.length === 0) {
    console.error(`ERROR: Bank_Data.csv not found at ${csvPath}`);
    return [];
  }

  const results: any[] = [];
  
  for (let i = 0; i < globalBankRecords.length; i++) {
    const rec = globalBankRecords[i];
    if (filterFn(rec)) {
        results.push({
          BANK: rec.bank,
          BRANCH: rec.branch,
          IFSC: rec.ifsc,
          ADDRESS: rec.address,
          CITY: rec.cityVillage,
          DISTRICT: rec.district,
          STATE: rec.state,
          TALUKA: rec.taluka,
          MICR: rec.micr && rec.micr !== "-" ? rec.micr : "N/A",
          CONTACT: rec.contact && rec.contact !== "-" ? rec.contact : "Not Provided",
          IMPS: rec.imps,
          NEFT: rec.neft,
          RTGS: rec.rtgs,
          UPI: rec.upi,
          SWIFT: rec.swift && rec.swift !== "-" ? rec.swift : "N/A",
          BANKCODE: rec.ifsc.substring(0, 4)
        });
        if (results.length >= limit) {
          break;
        }
    }
  }

  return results;
}

// Trigger background database load
ensureDatabaseLoaded().catch(err => {
  console.error("Background database load failed:", err);
});

app.use(express.json());

// Verify database is fully online before serving any API requests
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api")) {
    try {
      await ensureDatabaseLoaded();
      next();
    } catch (err: any) {
      console.error("Database initialization error during request:", err);
      res.status(500).json({ error: "Failed to load database. Please check back shortly." });
    }
  } else {
    next();
  }
});

// Diagnostics
app.get("/api/debug-status", (req, res) => {
  res.json({
    statesCount: statesList.length,
    isLoaded: isDatabaseLoaded,
    cwd: process.cwd(),
    dirname: safeDirname,
    csvExistsInCwd: fs.existsSync(path.join(process.cwd(), 'Bank_Data.csv')),
    csvExistsInDirname: fs.existsSync(path.join(safeDirname, 'Bank_Data.csv')),
    envNodeEnv: process.env.NODE_ENV,
    envVercel: process.env.VERCEL,
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Dropdown cascading lookups
app.get("/api/states", (req, res) => {
  res.json(statesList);
});

app.get("/api/districts", (req, res) => {
  const state = (req.query.state as string || "").toUpperCase();
  if (state === "ALL" || !state) {
    const allDistricts = new Set<string>();
    for (const districts of Object.values(stateToDistrictsObj)) {
      for (const dist of districts) {
        allDistricts.add(dist);
      }
    }
    return res.json(Array.from(allDistricts).sort());
  }
  res.json(stateToDistrictsObj[state] || []);
});

app.get("/api/talukas", (req, res) => {
  const state = (req.query.state as string || "").toUpperCase();
  const district = (req.query.district as string || "").toUpperCase();

  if (!state && !district) {
    const allTalukas = new Set<string>();
    for (const talukas of Object.values(districtToTalukasObj)) {
      for (const tal of talukas) {
        allTalukas.add(tal);
      }
    }
    return res.json(Array.from(allTalukas).sort());
  }

  const key = `${state}||${district}`;
  res.json(districtToTalukasObj[key] || []);
});

app.get("/api/cities", (req, res) => {
  const state = (req.query.state as string || "").toUpperCase();
  const district = (req.query.district as string || "").toUpperCase();
  const taluka = (req.query.taluka as string || "").toUpperCase();

  if (!state && !district && !taluka) {
    const allCities = new Set<string>();
    for (const cities of Object.values(talukaToCitiesObj)) {
      for (const c of cities) {
        allCities.add(c);
      }
    }
    return res.json(Array.from(allCities).sort());
  }

  const key = `${state}||${district}||${taluka}`;
  res.json(talukaToCitiesObj[key] || []);
});

app.get("/api/banks", (req, res) => {
  const state = (req.query.state as string || "").toUpperCase();
  const district = (req.query.district as string || "").toUpperCase();
  const taluka = (req.query.taluka as string || "").toUpperCase();
  const city = (req.query.city as string || "").toUpperCase();

  if (!state && !district && !taluka && !city) {
    const allBanks = new Set<string>();
    for (const banks of Object.values(cityToBanksObj)) {
      for (const b of banks) {
        allBanks.add(b);
      }
    }
    return res.json(Array.from(allBanks).sort());
  }

  const key = `${state}||${district}||${taluka}||${city}`;
  res.json(cityToBanksObj[key] || []);
});

app.get("/api/branches", async (req, res) => {
  const state = (req.query.state as string || "").toUpperCase();
  const district = (req.query.district as string || "").toUpperCase();
  const taluka = (req.query.taluka as string || "").toUpperCase();
  const city = (req.query.city as string || "").toUpperCase();
  const bank = (req.query.bank as string || "").toUpperCase();

  try {
    const results = await queryCsvStream((rec) => {
      const matchState = (state === "ALL" || !state || rec.state === state);
      const matchDist = (district === "ALL" || !district || rec.district === district);
      const matchTal = (taluka === "ALL" || !taluka || rec.taluka === taluka);
      const matchCity = (city === "ALL" || !city || rec.cityVillage === city);
      const matchBank = (bank === "ALL" || !bank || rec.bank === bank);
      return matchState && matchDist && matchTal && matchCity && matchBank;
    }, 500);

    res.json(results.sort((a, b) => a.BRANCH.localeCompare(b.BRANCH)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Detailed IFSC search
app.get("/api/branch/:ifsc", async (req, res) => {
  const ifsc = (req.params.ifsc || "").toUpperCase().trim();
  try {
    const results = await queryCsvStream((rec) => rec.ifsc === ifsc, 1);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: "Branch not found." });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Search by MICR code
app.get("/api/search-micr", async (req, res) => {
  const q = (req.query.q as string || "").trim().toUpperCase();
  try {
    let results: any[] = [];
    if (!q) {
      results = await queryCsvStream((rec) => rec.micr && /^\d{9}$/.test(rec.micr), 35);
    } else if (/^\d{9}$/.test(q)) {
      results = await queryCsvStream((rec) => rec.micr === q, 1);
    } else {
      results = await queryCsvStream((rec) => rec.micr.includes(q), 50);
    }
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Search by SWIFT code
app.get("/api/search-swift", async (req, res) => {
  const q = (req.query.q as string || "").trim().toUpperCase();
  try {
    let results: any[] = [];
    if (!q) {
      results = await queryCsvStream((rec) => rec.swift && rec.swift !== "-", 35);
    } else {
      results = await queryCsvStream((rec) => rec.swift.toUpperCase().includes(q), 50);
    }
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Global search
app.get("/api/search", async (req, res) => {
  const q = (req.query.q as string || "").trim().toUpperCase();
  const mode = req.query.mode as string || "fuzzy";

  if (!q) {
    return res.json([]);
  }

  const cacheKey = `${mode}||${q}`;
  if (searchCache.has(cacheKey)) {
    return res.json(searchCache.get(cacheKey));
  }

  try {
    let results: any[] = [];

    if (mode === "ifsc") {
      results = await queryCsvStream((rec) => rec.ifsc === q, 1);
    } else if (mode === "pincode") {
      if (q.length === 6 && /^\d{6}$/.test(q)) {
        results = await queryCsvStream((rec) => rec.pincode === q, 250);
      } else {
        const normQ = normalizeSearchText(q);
        results = await queryCsvStream((rec) => normalizeSearchText(rec.address).includes(normQ), 250);
      }
    } else {
      const normQuery = normalizeSearchText(q);
      const terms = normQuery.split(/\s+/).filter(Boolean);
      results = await queryCsvStream((rec) => {
        const aliases = getBankAliases(rec.bank);
        const rawSearchStr = `${rec.bank} ${aliases} ${rec.branch} ${rec.ifsc} ${rec.address} ${rec.cityVillage} ${rec.district} ${rec.state} ${rec.pincode}`;
        const searchStrReady = normalizeSearchText(rawSearchStr);
        for (const term of terms) {
          if (!searchStrReady.includes(term)) {
            return false;
          }
        }
        return true;
      }, 250);
    }

    if (searchCache.size > 2000) {
      searchCache.clear();
    }
    searchCache.set(cacheKey, results);

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Live Online Grounded Gemini Search
app.get("/api/online-search", async (req, res) => {
  const q = (req.query.q as string || "").trim();
  if (!q) {
    return res.json({ results: [] });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      results: [],
      error: "GEMINI_API_KEY is not configured on the server. To enable 'very power online search', go to Settings > Secrets and add GEMINI_API_KEY."
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search the web to find verified, authentic details for the bank branch matching query: "${q}".
You MUST return a JSON list of matches containing as many of these fields as possible:
BANK, BRANCH, IFSC, ADDRESS, CITY, STATE, DISTRICT, MICR (or N/A), CONTACT (or Not Provided), SWIFT (or N/A), IMPS (boolean, default true), NEFT (boolean, default true), RTGS (boolean, default true), UPI (boolean, default true).
Ground your answer carefully in Google Search results. If no bank branch exists for the prompt, return empty array.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let responseText = response.text || "";
    console.log("Raw Gemini Response:", responseText);

    // Try to extract the first JSON array from the response
    const arrayMatch = responseText.match(/\[.*\]/s);
    if (arrayMatch) {
      responseText = arrayMatch[0];
    } else {
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    }
    
    if (!responseText) {
      return res.json({ results: [], info: "Empty response from Gemini online search." });
    }

    const parsedResults = JSON.parse(responseText);
    const enrichedResults = parsedResults.map((item: any) => ({
      ...item,
      isOnlineResult: true,
      BANKCODE: item.IFSC ? item.IFSC.substring(0, 4) : "GENERIC"
    }));

    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const ch of chunks) {
        if (ch.web?.uri) {
          sources.push({
            title: ch.web.title || "Web Reference",
            uri: ch.web.uri
          });
        }
      }
    }

    res.json({
      results: enrichedResults,
      sources: sources
    });

  } catch (err: any) {
    console.error("Gemini online-search failed:", err);
    res.json({
      results: [],
      error: "Online search was unable to gather live results: " + err.message
    });
  }
});

export { app };
export default serverless(app);
