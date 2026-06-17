import fs from "fs";
import path from "path";
import readline from "readline";

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

async function diagnose() {
  console.log("Starting full parseCsvLine CSV diagnosis...");
  const csvPath = path.join(process.cwd(), 'Bank_Data.csv');
  if (!fs.existsSync(csvPath)) {
    console.error("Bank_Data.csv does not exist!");
    return;
  }

  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  const statesSet = new Set<string>();
  const samples: string[][] = [];

  for await (const line of rl) {
    if (count === 0) {
      count++;
      continue;
    }
    const cols = parseCsvLine(line);
    const state = cols[5] || "";
    statesSet.add(state.trim().toUpperCase());

    if (count <= 5) {
      samples.push(cols);
    }
    count++;
  }
  
  console.log(`Total CSV lines read: ${count}`);
  console.log(`Total Unique States loaded: ${statesSet.size}`);
  console.log("Unique States (first 15):", Array.from(statesSet).slice(0, 15));
  console.log("Sample rows length:", samples.map(s => s.length));
  console.log("Sample 1 columns:", samples[0]);
}

diagnose().catch(err => console.error("Diagnosis error:", err));
