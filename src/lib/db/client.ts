import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __pg: ReturnType<typeof postgres> | undefined;
}

const connection =
  global.__pg ??
  postgres(process.env.DATABASE_URL ?? "", {
    prepare: false,
    max: 1,
  });

if (process.env.NODE_ENV !== "production") global.__pg = connection;

export const db = drizzle(connection, { schema });
export { schema };
