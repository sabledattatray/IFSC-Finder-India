import express from "express";
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

app.get("/api/debug-status", async (req, res) => {
  const isUsingPostgres = !!(process.env.DATABASE_URL || process.env.SQL_HOST);
  let dbStatus = "Unknown";
  let rowCount = 0;
  let error = null;

  // Perform quick TCP checks to diagnose connection issues
  const checkPort = (port: number, host: string): Promise<string> => {
    return new Promise((resolve) => {
      const socket = require("net").connect(port, host);
      socket.setTimeout(2500);
      socket.on("connect", () => {
        socket.destroy();
        resolve("Connected successfully");
      });
      socket.on("timeout", () => {
        socket.destroy();
        resolve("Connection timed out after 2.5s");
      });
      socket.on("error", (err: any) => {
        socket.destroy();
        resolve(`Connection failed: ${err.message}`);
      });
    });
  };

  const host = "aws-1-ap-southeast-1.pooler.supabase.com";
  const tcp6543 = await checkPort(6543, host);
  const tcp5432 = await checkPort(5432, host);

  try {
    // Only query database if TCP port 6543 is accessible
    if (tcp6543 === "Connected successfully") {
      const countPromise = db.select({ count: sql`COUNT(*)` }).from(bankBranches);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database query timed out after 3 seconds")), 3000)
      );
      const result = await Promise.race([countPromise, timeoutPromise]) as any;
      rowCount = Number(result[0]?.count || 0);
      dbStatus = "Connected";
    } else {
      dbStatus = "TCP Port Blocked";
      error = `Cannot query database because port 6543 is not accessible: ${tcp6543}`;
    }
  } catch (err: any) {
    dbStatus = "Error";
    error = err.message;
  }

  res.json({
    databaseType: isUsingPostgres ? "PostgreSQL" : "PGlite",
    connectionStatus: dbStatus,
    rowCount: rowCount,
    error: error,
    tcpDiagnostics: {
      host,
      port6543: tcp6543,
      port5432: tcp5432
    },
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
    databaseUrlMasked: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@") : null,
    envKeys: Object.keys(process.env).filter(k => k.includes("DATABASE") || k.includes("SQL") || k.includes("GEMINI") || k.includes("VERCEL"))
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
      results = await db.select().from(bankBranches).where(sql`length("micr") = 9`).limit(35);
    } else if (/^\d{9}$/.test(q)) {
      results = await db.select().from(bankBranches).where(eq(bankBranches.micr, q)).limit(1);
    } else {
      results = await db.select().from(bankBranches).where(ilike(bankBranches.micr, `%${q}%`)).limit(50);
    }
    res.json(results.map(recToApi));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/search-swift", async (req, res) => {
  const q = (req.query.q as string || "").trim().toUpperCase();
  try {
    let results = [];
    if (!q) {
      results = await db.select().from(bankBranches).where(sql`"swift" != '-'`).limit(35);
    } else {
      results = await db.select().from(bankBranches).where(ilike(bankBranches.swift, `%${q}%`)).limit(50);
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
      if (q.length === 6 && /^\d{6}$/.test(q)) {
        results = await db.select().from(bankBranches).where(eq(bankBranches.pincode, q)).limit(250);
      } else {
        const normQ = normalizeSearchText(q);
        results = await db.select().from(bankBranches).where(ilike(bankBranches.searchStrReady, `%${normQ}%`)).limit(250);
      }
    } else {
      const normQuery = normalizeSearchText(q);
      const terms = normQuery.split(/\s+/).filter(Boolean);
      let conditions = terms.map(term => ilike(bankBranches.searchStrReady, `%${term}%`));
      
      let query = db.select().from(bankBranches);
      if (conditions.length > 0) query = query.where(and(...conditions));
      results = await query.limit(250);
    }

    res.json(results.map(recToApi));
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
