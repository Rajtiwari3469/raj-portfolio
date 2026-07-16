import "dotenv/config";
import { defineConfig } from "prisma/config";

const rawUrl = process.env["DATABASE_URL"] || "postgresql://localhost:5432/dummy?sslmode=disable";
const datasourceUrl = rawUrl.replace(/sslmode=[^&]*&?/, "").replace(/\?$/, "");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
