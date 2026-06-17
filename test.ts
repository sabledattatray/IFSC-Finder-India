import fetch from "node-fetch";

async function run() {
  const start = Date.now();
  console.log("Fetching local server...");
  try {
    const res = await fetch("http://127.0.0.1:3000/api/search?q=GANGARDA&mode=master");
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Result length:", (json as any).length);
    console.log("Finished in:", Date.now() - start, "ms");
  } catch (e) {
    console.error(e);
  }
}
run();
