import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
// TODO multiple auth strategies
// import GitHub from "next-auth/providers/github"
// import Google from "next-auth/providers/google"
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/auth/User";
import { UserRole } from "@/types/roles";
import bcrypt from "bcryptjs";
import { UserSchema } from "../validators/auth/user";
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials.email || !credentials.password) {
          throw new Error("Missing credentials");
        }
        const parsed = UserSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error(parsed.error.errors[0].message);
        }
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email }).exec();
        if (
          !user ||
          !bcrypt.compareSync(
            credentials.password as string,
            user.password as string
          )
        ) {
          throw new Error("Invalid credentials");
        }
        return {
          id: user.id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = ((token.firstName as string) +
        " " +
        token.lastName) as string;
      session.user.role = token.role as UserRole;
      return session;
    },
  },
});
