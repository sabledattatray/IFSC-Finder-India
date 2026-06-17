import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const safeDirname = path.dirname(fileURLToPath(import.meta.url));

export function searchForFile(filename: string): string | null {
  const startPaths = [process.cwd(), safeDirname];
  for (const base of startPaths) {
    let current = base;
    for (let i = 0; i < 6; i++) {
       const p = path.join(current, filename);
       if (fs.existsSync(p)) return p;
       const p2 = path.join(current, "public", filename);
       if (fs.existsSync(p2)) return p2;
       const parent = path.dirname(current);
       if (parent === current) break;
       current = parent;
    }
  }
  return null;
}
