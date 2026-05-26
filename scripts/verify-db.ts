/**
 * Quick MongoDB connection check.
 * Run: npx tsx scripts/verify-db.ts
 * Requires MONGODB_URI in .env.local (loaded via dotenv if installed) or exported in shell.
 */

import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set. Copy .env.local.example → .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB (database: african_stores)…");

  await mongoose.connect(uri, { bufferCommands: false, dbName: "african_stores" });

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("No database handle after connect");
  }

  const count = await db.collection("stores").countDocuments();
  const sample = await db
    .collection("stores")
    .find({})
    .project({ name: 1, city: 1, category: 1 })
    .limit(3)
    .toArray();

  console.log(`✅ Connected. stores collection: ${count} document(s)`);
  if (sample.length > 0) {
    console.log("Sample stores:");
    for (const doc of sample) {
      console.log(`  - ${doc.name} (${doc.city ?? "no city"}) — ${doc.category}`);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error("❌ Connection failed:", err.message ?? err);
  process.exit(1);
});
