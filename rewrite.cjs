const fs = require('fs');

let content = fs.readFileSync('api/index.ts', 'utf8');

const newCode = `import express from "express";
import serverless from "serverless-http";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { db } from "../src/db/index.js";
import { bankBranches } from "../src/db/schema.js";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import fs from "fs";

const app = express();

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

function normalizeSearchText(t: string): string {
  return (t || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function recToApi(rec: any) {
  return {
    BANK: rec.bank,
    BRANCH: rec.branch,
    IFSC: rec.ifsc,
    ADDRESS: rec.address,
    CITY: rec.cityVillage || rec.city,
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
    BANKCODE: rec.ifsc ? rec.ifsc.substring(0, 4) : "GENERIC"
  };
}

app.use(express.json());

app.get("/api/debug-status", (req, res) => {
  res.json({
    isUsingPostgres: true,
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY
  });
});

app.get("/api/states", async (req, res) => {
  try {
    const states = await db.selectDistinct({ state: bankBranches.state }).from(bankBranches);
    res.json(states.map(s => s.state).filter(Boolean).sort());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/districts", async (req, res) => {
  const state = (req.query.state as string || "").toUpperCase();
  try {
    let query = db.selectDistinct({ district: bankBranches.district }).from(bankBranches);
    if (state && state !== "ALL") query = query.where(eq(bankBranches.state, state));
    const districts = await query;
    res.json(districts.map(d => d.district).filter(Boolean).sort());
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/talukas", async (req, res) => {
  const state = (req.query.state as string || "").toUpperCase();
  const district = (req.query.district as string || "").toUpperCase();
  try {
    let conditions = [];
    if (state && state !== "ALL") conditions.push(eq(bankBranches.state, state));
    if (district && district !== "ALL") conditions.push(eq(bankBranches.district, district));
    let query = db.selectDistinct({ taluka: bankBranches.taluka }).from(bankBranches);
    if (conditions.length > 0) query = query.where(and(...conditions));
    const talukas = await query;
    res.json(talukas.map(t => t.taluka).filter(Boolean).sort());
  } catch(err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/cities", async (req, res) => {
  const state = (req.query.state as string || "").toUpperCase();
  const district = (req.query.district as string || "").toUpperCase();
  const taluka = (req.query.taluka as string || "").toUpperCase();
  try {
    let conditions = [];
    if (state && state !== "ALL") conditions.push(eq(bankBranches.state, state));
    if (district && district !== "ALL") conditions.push(eq(bankBranches.district, district));
    if (taluka && taluka !== "ALL") conditions.push(eq(bankBranches.taluka, taluka));
    let query = db.selectDistinct({ city: bankBranches.cityVillage }).from(bankBranches);
    if (conditions.length > 0) query = query.where(and(...conditions));
    const cities = await query;
    res.json(cities.map(c => c.city).filter(Boolean).sort());
  } catch(err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/banks", async (req, res) => {
  const state = (req.query.state as string || "").toUpperCase();
  const district = (req.query.district as string || "").toUpperCase();
  const taluka = (req.query.taluka as string || "").toUpperCase();
  const city = (req.query.city as string || "").toUpperCase();
  try {
    let conditions = [];
    if (state && state !== "ALL") conditions.push(eq(bankBranches.state, state));
    if (district && district !== "ALL") conditions.push(eq(bankBranches.district, district));
    if (taluka && taluka !== "ALL") conditions.push(eq(bankBranches.taluka, taluka));
    if (city && city !== "ALL") conditions.push(eq(bankBranches.cityVillage, city));
    let query = db.selectDistinct({ bank: bankBranches.bank }).from(bankBranches);
    if (conditions.length > 0) query = query.where(and(...conditions));
    const banks = await query;
    res.json(banks.map(b => b.bank).filter(Boolean).sort());
  } catch(err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/branches", async (req, res) => {
  const state = (req.query.state as string || "").toUpperCase();
  const district = (req.query.district as string || "").toUpperCase();
  const taluka = (req.query.taluka as string || "").toUpperCase();
  const city = (req.query.city as string || "").toUpperCase();
  const bank = (req.query.bank as string || "").toUpperCase();

  try {
    let conditions = [];
    if (state && state !== "ALL") conditions.push(eq(bankBranches.state, state));
    if (district && district !== "ALL") conditions.push(eq(bankBranches.district, district));
    if (taluka && taluka !== "ALL") conditions.push(eq(bankBranches.taluka, taluka));
    if (city && city !== "ALL") conditions.push(eq(bankBranches.cityVillage, city));
    if (bank && bank !== "ALL") conditions.push(eq(bankBranches.bank, bank));

    let query = db.select().from(bankBranches);
    if (conditions.length > 0) query = query.where(and(...conditions));
    const results = await query.limit(500);

    res.json(results.map(recToApi).sort((a, b) => a.BRANCH.localeCompare(b.BRANCH)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/branch/:ifsc", async (req, res) => {
  const ifsc = (req.params.ifsc || "").toUpperCase().trim();
  try {
    const results = await db.select().from(bankBranches).where(eq(bankBranches.ifsc, ifsc)).limit(1);
    if (results.length > 0) res.json(recToApi(results[0]));
    else res.status(404).json({ error: "Branch not found." });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/search-micr", async (req, res) => {
  const q = (req.query.q as string || "").trim().toUpperCase();
  try {
    let results = [];
    if (!q) {
      results = await db.select().from(bankBranches).where(sql\`length("micr") = 9\`).limit(35);
    } else if (/^\\d{9}$/.test(q)) {
      results = await db.select().from(bankBranches).where(eq(bankBranches.micr, q)).limit(1);
    } else {
      results = await db.select().from(bankBranches).where(ilike(bankBranches.micr, \`%\${q}%\`)).limit(50);
    }
    res.json(results.map(recToApi));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/search-swift", async (req, res) => {
  const q = (req.query.q as string || "").trim().toUpperCase();
  try {
    let results = [];
    if (!q) {
      results = await db.select().from(bankBranches).where(sql\`"swift" != '-'\`).limit(35);
    } else {
      results = await db.select().from(bankBranches).where(ilike(bankBranches.swift, \`%\${q}%\`)).limit(50);
    }
    res.json(results.map(recToApi));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/search", async (req, res) => {
  const q = (req.query.q as string || "").trim().toUpperCase();
  const mode = req.query.mode as string || "fuzzy";

  if (!q) return res.json([]);

  try {
    let results = [];
    if (mode === "ifsc") {
      results = await db.select().from(bankBranches).where(eq(bankBranches.ifsc, q)).limit(1);
    } else if (mode === "pincode") {
      if (q.length === 6 && /^\\d{6}$/.test(q)) {
        results = await db.select().from(bankBranches).where(eq(bankBranches.pincode, q)).limit(250);
      } else {
        const normQ = normalizeSearchText(q);
        results = await db.select().from(bankBranches).where(ilike(bankBranches.searchStrReady, \`%\${normQ}%\`)).limit(250);
      }
    } else {
      const normQuery = normalizeSearchText(q);
      const terms = normQuery.split(/\\s+/).filter(Boolean);
      let conditions = terms.map(term => ilike(bankBranches.searchStrReady, \`%\${term}%\`));
      
      let query = db.select().from(bankBranches);
      if (conditions.length > 0) query = query.where(and(...conditions));
      results = await query.limit(250);
    }

    res.json(results.map(recToApi));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
`;

let endIndex = content.indexOf('// Live Online Grounded Gemini Search');
let finalStr = newCode + '\n' + content.substring(endIndex);

fs.writeFileSync('api/index.ts', finalStr);
