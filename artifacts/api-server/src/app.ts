import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    autoLogging: !isDev,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API routes
app.use("/api", router);

// In production: serve the built frontend static files
if (!isDev) {
  const staticDir = path.resolve(__dirname, "public");
  app.use(express.static(staticDir));
  // SPA fallback – send index.html for any non-API route
  app.get("*splat", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
