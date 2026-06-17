import XLSX from "xlsx";
import fs from "fs";

const inputFile = "public/Bank_Data_Updated.xlsx";
const outputFile = "Bank_Data.csv";

console.log(`[Convert] Reading ${inputFile}...`);
const workbook = XLSX.readFile(inputFile);
const sheetName = workbook.SheetNames[0];
console.log(`[Convert] Using sheet: "${sheetName}"`);

const sheet = workbook.Sheets[sheetName];
const csv = XLSX.utils.sheet_to_csv(sheet);

fs.writeFileSync(outputFile, csv, "utf-8");
const lines = csv.split("\n").filter(Boolean).length;
console.log(`[Convert] Written ${outputFile} with ${lines} lines.`);

// Show first 3 lines for verification
const preview = csv.split("\n").slice(0, 3);
console.log("[Convert] Preview:");
preview.forEach((line, i) => console.log(`  Line ${i + 1}: ${line.substring(0, 150)}...`));
