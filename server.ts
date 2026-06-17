import { app } from "./api/index";
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

async function startLocalServer() {
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV === "production") {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startLocalServer().catch(err => {
  console.error("Failed to start local development/production wrapper server:", err);
});

export default app;
