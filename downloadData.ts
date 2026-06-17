import fs from "fs";
import https from "https";
import { execSync } from "child_process";

async function downloadIfMissing() {
  const file = "Bank_Data.csv";
  if (!fs.existsSync(file)) {
    console.log("Bank_Data.csv not found, downloading...");
    try {
      execSync('curl -Lo Bank_Data.csv "https://docs.google.com/spreadsheets/d/1H0cB4IsodVhx11WeZy4nIDzxK1t6aBVQ/export?format=csv"', {stdio: 'inherit'});
      console.log("Download complete!");
    } catch (e) {
      console.error("Failed to download CSV with curl, trying node-fetch...");
      try {
        const res = await fetch("https://docs.google.com/spreadsheets/d/1H0cB4IsodVhx11WeZy4nIDzxK1t6aBVQ/export?format=csv");
        const body = await res.text();
        fs.writeFileSync(file, body);
        console.log("Download complete using node-fetch!");
      } catch (e2) {
        console.error("Fetch also failed:", e2);
        process.exit(1);
      }
    }
  } else {
    console.log("Bank_Data.csv already exists locally, skipping download.");
  }
}

downloadIfMissing();
