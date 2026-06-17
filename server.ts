import express from "express";
import path from "path";
import fs from "fs";
import readline from "readline";
import { createServer as createViteServer } from "vite";
import "dotenv/config";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

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
  searchStrReady: string; // pre-computed, normalized search string for lightning-fast matching
}

// In-Memory Index Structures for the State-District-Taluka/Tahsil-City/Village-Bank-Branch Hierarchy
const statesList: string[] = [];
const stateToDistricts = new Map<string, Set<string>>();
const districtToTalukas = new Map<string, Set<string>>(); // Key: STATE||DISTRICT
const talukaToCities = new Map<string, Set<string>>(); // Key: STATE||DISTRICT||TALUKA
const cityToBanks = new Map<string, Set<string>>(); // Key: STATE||DISTRICT||TALUKA||CITY_VILLAGE
const cascadeToBranches = new Map<string, BankRecord[]>(); // Key: STATE||DISTRICT||TALUKA||CITY_VILLAGE||BANK
const ifscLookup = new Map<string, BankRecord>();
const pincodeToRecords = new Map<string, BankRecord[]>();
const searchCache = new Map<string, any[]>();

// Helper for parsing CSV lines with double quotes (highly optimized for performance in Vercel)
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
  // Match "TEHSIL <name>", "TALUKA <name>", "TAHSIL <name>", "TALUK <name>"
  const talukaMatch = addrUpper.match(/(?:TALUKA|TEHSIL|TAHSIL|TALUK|TAL\.?|TEH\.?)\s*(?:AND\s+DIST\.?)?\s*([A-Z0-9]+[A-Z0-9\s]{1,15})(?:,|\.|\b)/);
  if (talukaMatch) {
    const match = talukaMatch[1].trim();
    if (match.length >= 3 && match !== "AND") return match;
  }
  // Match "AT & POST <name>", "AT PO <name>", "A/P <name>"
  const poMatch = addrUpper.match(/(?:AT &? POST|AT PO|A\/P|A\s+P)\s*([A-Z0-9]+[A-Z0-9\s]{1,15})(?:,|\.|\b)/);
  if (poMatch) {
     const match = poMatch[1].trim();
     if (match.length >= 3) return match;
  }
  // Fallback to cleaner first word of Branch
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
  if (bank.includes("HDFC BANK")) {
    aliases.push("HDFC");
  } else if (bank.includes("HDFC")) {
    aliases.push("HDFC");
  }
  if (bank.includes("ICICI BANK")) {
    aliases.push("ICICI");
  } else if (bank.includes("ICICI")) {
    aliases.push("ICICI");
  }
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

// Function to load and index the 173,000+ branch records on startup
async function loadDatabase() {
  const csvPath = path.join(process.cwd(), 'Bank_Data.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`ERROR: Bank_Data.csv not found at ${csvPath}`);
    return;
  }

  console.log("Loading & Indexing Bank Master Database with state-district-taluka hierarchy...");
  const start = Date.now();

  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  const statesSet = new Set<string>();

  for await (const line of rl) {
    if (lineCount === 0) {
      lineCount++;
      continue; // Skip headers
    }
    const cols = parseCsvLine(line);
    if (cols.length < 6) continue;

    const bankNameOriginal = cols[0] || "";
    const ifscCode = cols[1] || "";
    const branchName = cols[2] || "";
    const address = cols[3] || "";
    const pincode = cols[4] || "";
    const stateOriginal = cols[5] || "";
    const districtOriginal = cols[6] || "";
    const contact = cols[7] || "";
    const imps = (cols[8] || "").toUpperCase() === "TRUE";
    const rtgs = (cols[9] || "").toUpperCase() === "TRUE";
    const cityNew = cols[10] || "";
    const iso3166 = cols[11] || "";
    const neft = (cols[12] || "").toUpperCase() === "TRUE";
    const micr = cols[13] || "";
    const upi = (cols[14] || "").toUpperCase() === "TRUE";
    const swift = cols[15] || "";
    
    const bank = bankNameOriginal.toUpperCase();
    const ifsc = ifscCode.toUpperCase();
    const branch = branchName.toUpperCase();
    const state = stateOriginal.toUpperCase();
    const district = districtOriginal ? districtOriginal.toUpperCase() : "GENERAL";
    const cityVillage = cityNew ? cityNew.toUpperCase() : getCityVillage(address, branch, district);

    // Determine derived fields
    const taluka = getTaluka(address, branch, cityVillage);

    const aliases = getBankAliases(bank);
    const rawSearchStr = `${bank} ${aliases} ${branch} ${ifsc} ${address} ${cityVillage} ${district} ${state} ${pincode}`;
    const searchStrReady = normalizeSearchText(rawSearchStr);

    const record: BankRecord = {
      bank,
      ifsc,
      branch,
      address,
      city: district,
      state,
      district,
      taluka,
      cityVillage,
      pincode,
      contact,
      micr,
      swift,
      imps,
      neft,
      rtgs,
      upi,
      searchStrReady
    };

    // Store in global maps
    ifscLookup.set(ifsc, record);

    statesSet.add(state);

    // 1. State -> Districts Map
    if (!stateToDistricts.has(state)) {
      stateToDistricts.set(state, new Set());
    }
    stateToDistricts.get(state)!.add(district);

    // 2. District -> Talukas Map
    const stateDistKey = `${state}||${district}`;
    if (!districtToTalukas.has(stateDistKey)) {
      districtToTalukas.set(stateDistKey, new Set());
    }
    districtToTalukas.get(stateDistKey)!.add(taluka);

    // 3. Taluka -> Cities/Villages Map
    const stateDistTalKey = `${state}||${district}||${taluka}`;
    if (!talukaToCities.has(stateDistTalKey)) {
      talukaToCities.set(stateDistTalKey, new Set());
    }
    talukaToCities.get(stateDistTalKey)!.add(cityVillage);

    // 4. City/Village -> Banks Map
    const stateDistTalCityKey = `${state}||${district}||${taluka}||${cityVillage}`;
    if (!cityToBanks.has(stateDistTalCityKey)) {
      cityToBanks.set(stateDistTalCityKey, new Set());
    }
    cityToBanks.get(stateDistTalCityKey)!.add(bank);

    // 5. Cascade to Branches list
    const stateDistTalCityBankKey = `${state}||${district}||${taluka}||${cityVillage}||${bank}`;
    if (!cascadeToBranches.has(stateDistTalCityBankKey)) {
      cascadeToBranches.set(stateDistTalCityBankKey, []);
    }
    cascadeToBranches.get(stateDistTalCityBankKey)!.push(record);

    // Speed up pincode index using explicit PINCODE column or regex fallback
    if (pincode && /^\d+$/.test(pincode)) {
      if (!pincodeToRecords.has(pincode)) {
        pincodeToRecords.set(pincode, []);
      }
      pincodeToRecords.get(pincode)!.push(record);
    } else {
      const pinMatch = address.match(/\b\d{6}\b/);
      if (pinMatch) {
        const pin = pinMatch[0];
        if (!pincodeToRecords.has(pin)) {
          pincodeToRecords.set(pin, []);
        }
        pincodeToRecords.get(pin)!.push(record);
      }
    }

    lineCount++;
  }

  statesList.push(...Array.from(statesSet).sort());
  
  const end = Date.now();
  console.log(`Database loaded successfully! Indexed ${lineCount} records in ${((end - start)/1000).toFixed(2)}s.`);
  console.log(`Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
}

let isDatabaseLoaded = false;
let databaseLoadingPromise: Promise<void> | null = null;

function ensureDatabaseLoaded(): Promise<void> {
  if (isDatabaseLoaded) {
    return Promise.resolve();
  }
  if (!databaseLoadingPromise) {
    databaseLoadingPromise = loadDatabase().then(() => {
      isDatabaseLoaded = true;
    });
  }
  return databaseLoadingPromise;
}

async function startServer() {
  // Trigger database loading in background, do not block route registrations
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
        res.status(500).json({ error: "Failed to load offline database. Please check back shortly." });
      }
    } else {
      next();
    }
  });

  // API Endpoints for UI Droplist cascades
  app.get("/api/states", (req, res) => {
    res.json(statesList);
  });

  app.get("/api/districts", (req, res) => {
    const state = (req.query.state as string || "").toUpperCase();
    if (state === "ALL" || !state) {
      const allDistricts = new Set<string>();
      for (const districts of stateToDistricts.values()) {
        for (const dist of districts) {
          allDistricts.add(dist);
        }
      }
      return res.json(Array.from(allDistricts).sort());
    }
    const districts = stateToDistricts.get(state);
    if (!districts) return res.json([]);
    res.json(Array.from(districts).sort());
  });

  app.get("/api/talukas", (req, res) => {
    const state = (req.query.state as string || "").toUpperCase();
    const district = (req.query.district as string || "").toUpperCase();

    const results = new Set<string>();
    for (const [key, talukasSet] of districtToTalukas.entries()) {
      const [kState, kDist] = key.split("||");
      const matchState = (state === "ALL" || !state || kState === state);
      const matchDist = (district === "ALL" || !district || kDist === district);
      if (matchState && matchDist) {
        for (const t of talukasSet) {
          results.add(t);
        }
      }
    }
    res.json(Array.from(results).sort());
  });

  app.get("/api/cities", (req, res) => {
    const state = (req.query.state as string || "").toUpperCase();
    const district = (req.query.district as string || "").toUpperCase();
    const taluka = (req.query.taluka as string || "").toUpperCase();

    const results = new Set<string>();
    for (const [key, citiesSet] of talukaToCities.entries()) {
      const [kState, kDist, kTal] = key.split("||");
      const matchState = (state === "ALL" || !state || kState === state);
      const matchDist = (district === "ALL" || !district || kDist === district);
      const matchTal = (taluka === "ALL" || !taluka || kTal === taluka);
      if (matchState && matchDist && matchTal) {
        for (const c of citiesSet) {
          results.add(c);
        }
      }
    }
    res.json(Array.from(results).sort());
  });

  app.get("/api/banks", (req, res) => {
    const state = (req.query.state as string || "").toUpperCase();
    const district = (req.query.district as string || "").toUpperCase();
    const taluka = (req.query.taluka as string || "").toUpperCase();
    const city = (req.query.city as string || "").toUpperCase();

    const results = new Set<string>();
    for (const [key, banksSet] of cityToBanks.entries()) {
      const [kState, kDist, kTal, kCity] = key.split("||");
      const matchState = (state === "ALL" || !state || kState === state);
      const matchDist = (district === "ALL" || !district || kDist === district);
      const matchTal = (taluka === "ALL" || !taluka || kTal === taluka);
      const matchCity = (city === "ALL" || !city || kCity === city);
      if (matchState && matchDist && matchTal && matchCity) {
        for (const b of banksSet) {
          results.add(b);
        }
      }
    }
    res.json(Array.from(results).sort());
  });

  app.get("/api/branches", (req, res) => {
    const state = (req.query.state as string || "").toUpperCase();
    const district = (req.query.district as string || "").toUpperCase();
    const taluka = (req.query.taluka as string || "").toUpperCase();
    const city = (req.query.city as string || "").toUpperCase();
    const bank = (req.query.bank as string || "").toUpperCase();

    const results: any[] = [];
    for (const [key, branchRecords] of cascadeToBranches.entries()) {
      const [kState, kDist, kTal, kCity, kBank] = key.split("||");
      const matchState = (state === "ALL" || !state || kState === state);
      const matchDist = (district === "ALL" || !district || kDist === district);
      const matchTal = (taluka === "ALL" || !taluka || kTal === taluka);
      const matchCity = (city === "ALL" || !city || kCity === city);
      const matchBank = (bank === "ALL" || !bank || kBank === bank);
      if (matchState && matchDist && matchTal && matchCity && matchBank) {
        results.push(...branchRecords);
        if (results.length >= 1000) break; // sanity limit to prevent huge client payload
      }
    }

    res.json(results.slice(0, 500).map(b => ({
      bank: b.bank,
      branchName: b.branch,
      ifsc: b.ifsc,
      address: b.address,
      district: b.district,
      state: b.state,
      taluka: b.taluka,
      cityVillage: b.cityVillage,
      pincode: b.pincode,
      contact: b.contact,
      micr: b.micr,
      swift: b.swift,
      imps: b.imps,
      neft: b.neft,
      rtgs: b.rtgs,
      upi: b.upi
    })).sort((a, b) => a.branchName.localeCompare(b.branchName)));
  });

  // Detailed IFSC search 
  app.get("/api/branch/:ifsc", (req, res) => {
    const ifsc = (req.params.ifsc || "").toUpperCase();
    const branch = ifscLookup.get(ifsc);
    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }
    res.json({
      BANK: branch.bank,
      BRANCH: branch.branch,
      IFSC: branch.ifsc,
      ADDRESS: branch.address,
      CITY: branch.cityVillage,
      STATE: branch.state,
      DISTRICT: branch.district,
      TALUKA: branch.taluka,
      MICR: branch.micr && branch.micr !== "-" ? branch.micr : "N/A",
      CONTACT: branch.contact && branch.contact !== "-" ? branch.contact : "Not Provided",
      IMPS: branch.imps,
      NEFT: branch.neft,
      RTGS: branch.rtgs,
      UPI: branch.upi,
      SWIFT: branch.swift && branch.swift !== "-" ? branch.swift : "N/A",
      BANKCODE: branch.ifsc.substring(0, 4)
    });
  });

  // Global search (text query, pincode, or general bank name)
  app.get("/api/search", (req, res) => {
    const q = (req.query.q as string || "").trim().toUpperCase();
    const mode = req.query.mode as string || "fuzzy";

    if (!q) {
      return res.json([]);
    }

    // Cache lookup for instantaneous repeat searches
    const cacheKey = `${mode}||${q}`;
    if (searchCache.has(cacheKey)) {
      return res.json(searchCache.get(cacheKey));
    }

    const results: any[] = [];
    
    if (mode === "ifsc") {
      const b = ifscLookup.get(q);
      if (b) {
        results.push({
          BANK: b.bank,
          BRANCH: b.branch,
          IFSC: b.ifsc,
          ADDRESS: b.address,
          CITY: b.cityVillage,
          DISTRICT: b.district,
          STATE: b.state,
          TALUKA: b.taluka,
          MICR: b.micr && b.micr !== "-" ? b.micr : "N/A",
          CONTACT: b.contact && b.contact !== "-" ? b.contact : "Not Provided",
          IMPS: b.imps,
          NEFT: b.neft,
          RTGS: b.rtgs,
          UPI: b.upi,
          SWIFT: b.swift && b.swift !== "-" ? b.swift : "N/A",
          BANKCODE: b.ifsc.substring(0, 4)
        });
      }
    } else if (mode === "pincode") {
      // 1. If it's a valid 6-digit Indian pincode, do a constant-time indexed lookup
      if (q.length === 6 && /^\d{6}$/.test(q)) {
        const matches = pincodeToRecords.get(q) || [];
        for (const b of matches) {
          results.push({
            BANK: b.bank,
            BRANCH: b.branch,
            IFSC: b.ifsc,
            ADDRESS: b.address,
            CITY: b.cityVillage,
            DISTRICT: b.district,
            STATE: b.state,
            TALUKA: b.taluka,
            MICR: b.micr && b.micr !== "-" ? b.micr : "N/A",
            CONTACT: b.contact && b.contact !== "-" ? b.contact : "Not Provided",
            IMPS: b.imps,
            NEFT: b.neft,
            RTGS: b.rtgs,
            UPI: b.upi,
            SWIFT: b.swift && b.swift !== "-" ? b.swift : "N/A",
            BANKCODE: b.ifsc.substring(0, 4)
          });
          if (results.length >= 100) break;
        }
      } else {
        // 2. Substring fallback for partial numbers or coordinates
        const normQ = normalizeSearchText(q);
        for (const [ifsc, b] of ifscLookup.entries()) {
          const normAddr = normalizeSearchText(b.address);
          if (normAddr.includes(normQ)) {
            results.push({
              BANK: b.bank,
              BRANCH: b.branch,
              IFSC: b.ifsc,
              ADDRESS: b.address,
              CITY: b.cityVillage,
              DISTRICT: b.district,
              STATE: b.state,
              TALUKA: b.taluka,
              MICR: b.micr && b.micr !== "-" ? b.micr : "N/A",
              CONTACT: b.contact && b.contact !== "-" ? b.contact : "Not Provided",
              IMPS: b.imps,
              NEFT: b.neft,
              RTGS: b.rtgs,
              UPI: b.upi,
              SWIFT: b.swift && b.swift !== "-" ? b.swift : "N/A",
              BANKCODE: b.ifsc.substring(0, 4)
            });
            if (results.length >= 100) break;
          }
        }
      }
    } else {
      // General fuzzy split-keyword search across all relevant fields (bank, branch, address, city, district, state, pin)
      const normQuery = normalizeSearchText(q);
      const terms = normQuery.split(/\s+/).filter(Boolean);
      for (const [ifsc, b] of ifscLookup.entries()) {
        let matchesAll = true;
        for (const term of terms) {
          if (!b.searchStrReady.includes(term)) {
            matchesAll = false;
            break;
          }
        }
        if (matchesAll) {
          results.push({
            BANK: b.bank,
            BRANCH: b.branch,
            IFSC: b.ifsc,
            ADDRESS: b.address,
            CITY: b.cityVillage,
            DISTRICT: b.district,
            STATE: b.state,
            TALUKA: b.taluka,
            MICR: b.micr && b.micr !== "-" ? b.micr : "N/A",
            CONTACT: b.contact && b.contact !== "-" ? b.contact : "Not Provided",
            IMPS: b.imps,
            NEFT: b.neft,
            RTGS: b.rtgs,
            UPI: b.upi,
            SWIFT: b.swift && b.swift !== "-" ? b.swift : "N/A",
            BANKCODE: b.ifsc.substring(0, 4)
          });
          if (results.length >= 250) break; 
        }
      }
    }

    // Save outputs in the high-performance cache
    if (searchCache.size > 2000) {
      searchCache.clear();
    }
    searchCache.set(cacheKey, results);

    res.json(results);
  });

  // Parallel Online Search leveraging Gemini 3.5 with Search Grounding
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
        model: "gemini-3.5-flash",
        contents: `Search the web to find verified, authentic details for the bank branch matching query: "${q}".
You MUST return a JSON list of matches containing as many of these fields as possible:
BANK, BRANCH, IFSC, ADDRESS, CITY, STATE, DISTRICT, MICR (or N/A), CONTACT (or Not Provided), SWIFT (or N/A), IMPS (boolean, default true), NEFT (boolean, default true), RTGS (boolean, default true), UPI (boolean, default true).
Ground your answer carefully in Google Search results. If no bank branch exists for the prompt, return empty array.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "A list of bank branches matching the user search query found online.",
            items: {
              type: Type.OBJECT,
              properties: {
                BANK: { type: Type.STRING, description: "Official full name of the Bank (e.g. HDFC BANK)" },
                BRANCH: { type: Type.STRING, description: "Name of the branch (e.g. MG ROAD BANGALORE)" },
                IFSC: { type: Type.STRING, description: "11-character alphanumeric Indian Financial System Code (e.g. HDFC0001234)" },
                ADDRESS: { type: Type.STRING, description: "Full physical address of the bank branch" },
                CITY: { type: Type.STRING, description: "City or town of the branch" },
                DISTRICT: { type: Type.STRING, description: "District" },
                STATE: { type: Type.STRING, description: "State" },
                MICR: { type: Type.STRING, description: "9-digit MICR code or N/A" },
                CONTACT: { type: Type.STRING, description: "Contact number or Not Provided" },
                SWIFT: { type: Type.STRING, description: "SWIFT code if found or N/A" },
                IMPS: { type: Type.BOOLEAN, description: "Is IMPS supported?" },
                NEFT: { type: Type.BOOLEAN, description: "Is NEFT supported?" },
                RTGS: { type: Type.BOOLEAN, description: "Is RTGS supported?" },
                UPI: { type: Type.BOOLEAN, description: "Is UPI supported?" }
              },
              required: ["BANK", "BRANCH", "IFSC", "ADDRESS", "CITY", "STATE"]
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        return res.json({ results: [], info: "Empty response from Gemini online search." });
      }

      const parsedResults = JSON.parse(responseText.trim());
      
      const enrichedResults = parsedResults.map((item: any) => ({
        ...item,
        isOnlineResult: true,
        BANKCODE: item.IFSC ? item.IFSC.substring(0, 4) : "GENERIC"
      }));

      // Extract web sources from grounding metadata
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

  // Vite development / production fallback
  if (!process.env.VERCEL) {
    if (process.env.DISABLE_HMR === 'true' || process.env.NODE_ENV === "production") {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

export default app;
