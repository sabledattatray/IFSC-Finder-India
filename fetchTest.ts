async function test() {
  console.log("--- Testing /api/search with mode=master ---");
  try {
    const q = "MUMBAI";
    const res = await fetch(`http://127.0.0.1:3000/api/search?q=${encodeURIComponent(q)}&mode=master`);
    console.log(`Query: '${q}', Status:`, res.status);
    const data = await res.json();
    console.log("Data count:", Array.isArray(data) ? data.length : "Not an array");
    if (data.length > 0) {
      console.log("First Match:", data[0]);
    }
  } catch (err: any) {
    console.error("Test failed:", err.message);
  }

  try {
    const q = "ABHY0065001";
    const res = await fetch(`http://127.0.0.1:3000/api/search?q=${encodeURIComponent(q)}&mode=master`);
    console.log(`Query: '${q}', Status:`, res.status);
    const data = await res.json();
    console.log("Data count:", Array.isArray(data) ? data.length : "Not an array");
    if (data.length > 0) {
      console.log("First Match:", data[0]);
    }
  } catch (err: any) {
    console.error("Test failed:", err.message);
  }
}
test();
