import "dotenv/config";
import { defineConfig } from "prisma/config";

const rawUrl = process.env["DIRECT_URL"] || process.env["DATABASE_URL"] || "postgresql://localhost:5432/dummy?sslmode=disable";
const datasourceUrl = rawUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: datasourceUrl,
  },
});
