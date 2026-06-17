import fs from 'fs';
import readline from 'readline';

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

async function run() {
  console.log("Generating dummy csv...");
  const w = fs.createWriteStream("dummy.csv");
  for (let i=0; i<166000; i++) {
    w.write(`BANK OF STATE,${i}CODE,BRANCH NAME,SOME ADDRESS WITH COMMAS AND STUFF PUNE 411038,411038,MAHARASHTRA,PUNE,0123456789,TRUE,TRUE,PUNE,TRUE,123456789,TRUE,SWIFT123\n`);
  }
  w.end();
  
  await new Promise(r => setTimeout(r, 1000));
  
  const start = Date.now();
  console.log("Reading...");
  const rl = readline.createInterface({
    input: fs.createReadStream("dummy.csv"),
    crlfDelay: Infinity
  });
  
  let i = 0;
  for await (const line of rl) {
    parseCsvLine(line);
    i++;
  }
  console.log("Done reading " + i + " lines in " + (Date.now()-start) + "ms");
}
run();
