import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '../../../utils';
import { dbConnect } from '../../../utils';
import { User } from '../../../utils/models';

interface Credentials {
  username: string;
  password: string;
}
export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      //@ts-expect-error
      async authorize(credentials: Credentials) {
        const { username, password } = credentials;
        await dbConnect();
        const user = await User.findOne({ email: username });

        if (!user) {
          throw new Error('User not found!');
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          throw new Error('Incorrect Password');
        }

        let authenticatedUser = {
          name: user.firstName + ' ' + user.lastName,
          email: user.email,
          role: user.role,
          id: user._id,
        };

        return authenticatedUser;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token }) => {
      return token;
    },
    session: async ({ session, token }) => {
      // session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },
  },
});
