import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { anonymous } from "better-auth/plugins";
import { moveBoardData } from "@/app/(apps)/board/_lib/guest-migration";
import { moveExpenseData } from "@/app/(apps)/expenses/_lib/guest-migration";
import { moveSchedulerData } from "@/app/(apps)/schedule/_lib/guest-migration";
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
      // Each app moves its guest-owned rows to the real account here.
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        await moveSchedulerData(anonymousUser.user.id, newUser.user.id);
        await moveExpenseData(anonymousUser.user.id, newUser.user.id);
        await moveBoardData(anonymousUser.user.id, newUser.user.id);
      },
    }),
    nextCookies(), // must stay last
  ],
});

export type Session = typeof auth.$Infer.Session;
