import fs from "fs";
import readline from "readline";
import path from "path";

// Simple CSV line parser
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Helpers to extract Taluka
function getTaluka(address: string, branch: string, city: string): string {
  const addrUpper = address.toUpperCase();
  const branchUpper = branch.toUpperCase();

  // 1. Try to find "TALUKA <name>" or "TAL <name>"
  let match = addrUpper.match(/\b(?:TALUKA|TAL)[.\s:]+([A-Z0-9-]+)\b/);
  if (match && match[1]) {
    const t = match[1].trim();
    if (t.length > 2 && t !== "TAL" && t !== "DIST" && t !== "DISTRICT") {
      return t;
    }
  }

  // 2. Try to find "TEHSIL <name>" or "TENSIL <name>"
  match = addrUpper.match(/\b(?:TEHSIL|TAHSIL)[.\s:]+([A-Z0-9-]+)\b/);
  if (match && match[1]) {
    return match[1].trim();
  }

  // 3. Try to find "TAL: <name>" or "TAL. <name>" inside branch name if it has TAL
  if (branchUpper.includes("TAL")) {
    const parts = branchUpper.split("TAL");
    if (parts.length > 1) {
      const candidate = parts[1].replace(/[.\s:]+/g, "").trim().split(/\s+/)[0];
      if (candidate && candidate.length > 2) return candidate;
    }
  }

  // 4. Default to city/district if nothing else is found
  return city || "GENERAL";
}

// Helpers to extract City/Village
function getCityVillage(address: string, branch: string, district: string): string {
  const addr = address.toUpperCase();
  const br = branch.toUpperCase();

  // Try to find "AT & POST <name>"
  let match = addr.match(/\b(?:AT\s*&\s*POST|AT\s*AND\s*POST|A\/P)[.\s:]+([A-Z0-9-]+)\b/);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Try to find "AT <name>"
  match = addr.match(/\b(?:AT|VILLAGE|VILL)[.\s:]+([A-Z0-9-]+)\b/);
  if (match && match[1] && match[1] !== "POST" && match[1] !== "TALUKA") {
    return match[1].trim();
  }

  // Fallback to branch if not matching common words
  const cleanBr = br.replace(/\b(?:MAIN|BRANCH|CHOWK|ROADS?|BAZAR)\b/g, "").trim();
  if (cleanBr.length > 3) {
    return cleanBr;
  }

  return district || "GENERAL";
}

async function run() {
  const csvPath = "Bank_Data.csv";
  if (!fs.existsSync(csvPath)) {
    console.error("CSV not found!");
    return;
  }

  console.log("Analyzing CSV...");
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  const statesSet = new Set<string>();
  const stateToDistricts = new Map<string, Set<string>>();
  const districtToTalukas = new Map<string, Set<string>>();
  const talukaToCities = new Map<string, Set<string>>();
  const cityToBanks = new Map<string, Set<string>>();

  for await (const line of rl) {
    if (lineCount === 0) {
      lineCount++;
      continue;
    }
    const cols = parseCsvLine(line);
    if (cols.length < 6) continue;

    const bankName = (cols[0] || "").toUpperCase().trim();
    const branchName = (cols[2] || "").toUpperCase().trim();
    const address = (cols[3] || "").toUpperCase().trim();
    const state = (cols[5] || "").toUpperCase().trim();
    const district = (cols[6] || "").toUpperCase().trim() || "GENERAL";
    const cityOriginal = (cols[10] || "").toUpperCase().trim();

    if (!state) continue;

    const city = cityOriginal ? cityOriginal : getCityVillage(address, branchName, district);
    const taluka = getTaluka(address, branchName, city);

    statesSet.add(state);

    if (!stateToDistricts.has(state)) stateToDistricts.set(state, new Set());
    stateToDistricts.get(state)!.add(district);

    const distKey = `${state}||${district}`;
    if (!districtToTalukas.has(distKey)) districtToTalukas.set(distKey, new Set());
    districtToTalukas.get(distKey)!.add(taluka);

    const talukaKey = `${state}||${district}||${taluka}`;
    if (!talukaToCities.has(talukaKey)) talukaToCities.set(talukaKey, new Set());
    talukaToCities.get(talukaKey)!.add(city);

    const cityKey = `${state}||${district}||${taluka}||${city}`;
    if (!cityToBanks.has(cityKey)) cityToBanks.set(cityKey, new Set());
    cityToBanks.get(cityKey)!.add(bankName);

    lineCount++;
    if (lineCount % 50000 === 0) {
      console.log(`Parsed ${lineCount} rows...`);
    }
  }

  console.log("Writing indexes to disk...");
  const publicDir = "public";
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Write files
  fs.writeFileSync(path.join(publicDir, "states.json"), JSON.stringify(Array.from(statesSet).sort()));

  const stateDistObj: Record<string, string[]> = {};
  for (const [s, dists] of stateToDistricts.entries()) {
    stateDistObj[s] = Array.from(dists).sort();
  }
  fs.writeFileSync(path.join(publicDir, "state-districts.json"), JSON.stringify(stateDistObj));

  const distTalObj: Record<string, string[]> = {};
  for (const [key, tals] of districtToTalukas.entries()) {
    distTalObj[key] = Array.from(tals).sort();
  }
  fs.writeFileSync(path.join(publicDir, "district-talukas.json"), JSON.stringify(distTalObj));

  const talCityObj: Record<string, string[]> = {};
  for (const [key, cities] of talukaToCities.entries()) {
    talCityObj[key] = Array.from(cities).sort();
  }
  fs.writeFileSync(path.join(publicDir, "taluka-cities.json"), JSON.stringify(talCityObj));

  const cityBankObj: Record<string, string[]> = {};
  for (const [key, banks] of cityToBanks.entries()) {
    cityBankObj[key] = Array.from(banks).sort();
  }
  fs.writeFileSync(path.join(publicDir, "city-banks.json"), JSON.stringify(cityBankObj));

  console.log("Done generating static cascading search lookup models!");
}

run();
