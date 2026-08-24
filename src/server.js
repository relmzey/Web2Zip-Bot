import express from "express";
import pinoHttp from "pino-http";
import { logger } from "./logger.js";

export function createServer() {
  const app = express();
  app.use(pinoHttp({ logger }));
  app.get("/api/healthz", (_request, response) => response.json({ status: "ok" }));
  app.get("/", (_request, response) => response.json({ service: "web2zip-bot", status: "ok" }));
  return app;
}