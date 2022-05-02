import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '../../../utils/auth';
import dbConnect from '../../../utils/dbConnect';
import { User } from '../../../utils/models/users';

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
        const client = await dbConnect();
        const user = await User.findOne({ email: username });

        if (!user) {
          throw new Error('User not found!');
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          throw new Error('Incorrect Password');
        }

        let authenticatedUser = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        };

        return authenticatedUser;
      },
    }),
  ],
});
