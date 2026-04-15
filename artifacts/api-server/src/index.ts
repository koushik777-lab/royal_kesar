import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
import { connectDB } from "@workspace/db";

const rawPort = process.env["PORT"] || "5001";
const port = Number(rawPort);
const c = (code: number, msg: string) => `\x1b[${code}m${msg}\x1b[0m`;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function startServer() {
  try {
    await connectDB();

    // In development, proxy non-API requests to the Vite dev server
    if (process.env.NODE_ENV === "development") {
      const { createProxyMiddleware } = await import("http-proxy-middleware");
      const vitePort = process.env["VITE_PORT"] || "5173";
      app.use(
        createProxyMiddleware({
          target: `http://localhost:${vitePort}`,
          changeOrigin: true,
          ws: true, // proxy WebSockets for Vite HMR
          // Don't proxy API calls
          filter: (pathname: string) => !pathname.startsWith("/api"),
        } as any),
      );
    }

    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      const mode = process.env.NODE_ENV === "production" ? "production" : "development";
      console.log(`\n  ${c(32, "✅")} ${c(1, "Server ready")} [${mode}]`);
      console.log(`  ${c(36, "➜")}  ${c(1, `http://localhost:${port}`)}\n`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to connect to database");
    process.exit(1);
  }
}

startServer();
