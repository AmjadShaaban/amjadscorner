import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { anonymous } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";

function provider(clientId?: string, clientSecret?: string) {
  return clientId && clientSecret ? { clientId, clientSecret } : undefined;
}

const github = provider(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET);
const google = provider(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);

export type SocialProvider = "github" | "google";
export const enabledSocialProviders: SocialProvider[] = [
  ...(github ? (["github"] as const) : []),
  ...(google ? (["google"] as const) : []),
];

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: {
    ...(github && { github }),
    ...(google && { google }),
  },
  plugins: [
    anonymous({
      // TODO: move guest-owned app data to the real user once app tables exist.
      onLinkAccount: async () => {},
    }),
    nextCookies(), // must stay last
  ],
});

export type Session = typeof auth.$Infer.Session;
