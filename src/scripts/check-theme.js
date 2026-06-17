import mongoose from "mongoose";
import dotenv from "dotenv";
import dbConnect from "../lib/db.js";
import Theme from "../models/Theme.js";

dotenv.config({ path: ".env.local" });

async function run() {
  await dbConnect();
  const active = await Theme.findOne({ isActive: true }).lean();
  console.log("Active Theme Config:", JSON.stringify(active, null, 2));
  mongoose.connection.close();
}

run().catch(console.error);
