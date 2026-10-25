import { config } from "dotenv";

// Integration tests talk to the local Docker Postgres configured in .env.local (CI sets env vars directly).
config({ path: ".env.local", quiet: true });
