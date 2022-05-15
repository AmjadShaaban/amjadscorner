import { DefaultSession } from 'next-auth';
import 'next-auth/jwt';
import { Roles } from '../interfaces/interfaces';

declare module 'next-auth' {
  interface User {
    role?: Roles;
  }
  interface Session {
    user: {
      id?: string | undefined;
      role?: Roles | undefined;
    } & DefaultSession['user'];
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    role?: Roles;
  }
}
