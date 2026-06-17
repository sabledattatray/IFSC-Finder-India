import fs from 'fs';
import readline from 'readline';

function getCityVillage(address: string, branch: string, city: string): string {
  return city.toUpperCase();
}
function getTaluka(address: string, branch: string, city: string): string {
  return city;
}
function getBankAliases(bankName: string): string {
  return "SBI";
}
function normalizeSearchText(str: string): string {
  return str
    .toUpperCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCsvLine(line: string): string[] {
  if (!line.includes('"')) {
    return line.split(',');
  }
  const result: string[] = [];
  let current = '';
  // ... ommiting exact for brevity
  return line.split(',');
}

async function run() {
  const start = Date.now();
  console.log("Reading...");
  const rl = readline.createInterface({
    input: fs.createReadStream("dummy.csv"),
    crlfDelay: Infinity
  });
  
  let i = 0;
  const terms = ["GANGARDA"];
  
  for await (const line of rl) {
      const cols = parseCsvLine(line);
      if (cols.length < 6) continue;

      const bankNameOriginal = cols[0] || "";
      const ifscCode = cols[1] || "";
      const branchName = cols[2] || "";
      const address = cols[3] || "";
      const pincode = cols[4] || "";
      const stateOriginal = cols[5] || "";
      const districtOriginal = cols[6] || "";
      const cityNew = cols[10] || "";

      const bank = bankNameOriginal.toUpperCase();
      const ifsc = ifscCode.toUpperCase();
      const branch = branchName.toUpperCase();
      const state = stateOriginal.toUpperCase();
      const district = districtOriginal ? districtOriginal.toUpperCase() : "GENERAL";
      const cityVillage = cityNew ? cityNew.toUpperCase() : getCityVillage(address, branch, district);
      const taluka = getTaluka(address, branch, cityVillage);
      
      const aliases = getBankAliases(bank);
      const rawSearchStr = `${bank} ${aliases} ${branch} ${ifsc} ${address} ${cityVillage} ${district} ${state} ${pincode}`;
      const searchStrReady = normalizeSearchText(rawSearchStr);
      let match = true;
      for (const term of terms) {
        if (!searchStrReady.includes(term)) {
          match = false; break;
        }
      }
      i++;
  }
  console.log("Done reading " + i + " lines in " + (Date.now()-start) + "ms");
}
run();
