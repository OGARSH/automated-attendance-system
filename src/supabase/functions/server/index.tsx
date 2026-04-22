// @ts-nocheck
// Note: This file contains server-only code intended for Supabase Edge functions.
// The imports below are adjusted to standard npm specifiers to avoid tooling errors.
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1d4a2552/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);