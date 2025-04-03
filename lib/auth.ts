import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
// auth strategies will be implemented later
// import GitHub from "next-auth/providers/github"
// import Google from "next-auth/providers/google"
import { User, UserSchema } from "../models/User"
import { connectToDatabase } from "./db"
import bcrypt from "bcryptjs"
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials:{
        email:{},
        password:{}
      },authorize: async (credentials)=>{
        if(!credentials.email||!credentials.password){
          throw new Error('Missing credentials')
        }
        const parsed = UserSchema.safeParse(credentials)
        if (!parsed.success) {
          throw new Error(parsed.error.errors[0].message);
        }
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email }).exec();
        if (!user || !bcrypt.compareSync(credentials.password as string, user.password as string)) {
          throw new Error('Invalid credentials');
        }
        return { id: user._id.toString(), email: user.email };

      }
    })
  ],
  pages:{
    signIn:'/login',
  },
  callbacks:{
    async session({session, token}){
      if(token.sub){
        session.user.id = token.sub
      }
      return session
    }
  }
})