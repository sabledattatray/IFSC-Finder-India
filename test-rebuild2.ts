import fs from 'fs';
import readline from 'readline';

function getCityVillage(address: string, branch: string, city: string): string {
  return city.toUpperCase();
}
function getTaluka(address: string, branch: string, city: string): string {
  return city;
}

function parseCsvLine(line: string): string[] {
  if (!line.includes('"')) {
    return line.split(',');
  }
  const result = [];
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

async function rebuild() {
  const start = Date.now();
  console.log("Reading Bank_Data.csv to rebuild JSON catalogs...");
  const rl = readline.createInterface({
    input: fs.createReadStream("Bank_Data.csv"),
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
    
    // Simplistic extraction just for parsing speed test
    const bankName = cols[0] || "";
    const branchName = cols[2] || "";
    const address = cols[3] || "";
    const stateOriginal = cols[5] || "";
    const districtOriginal = cols[6] || "";
    const cityNew = cols[10] || "";

    const bank = bankName.toUpperCase();
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
  console.log(`Parsed ${lineCount} lines with robust parseCsvLine in ${Date.now() - start}ms`);
}
rebuild();
