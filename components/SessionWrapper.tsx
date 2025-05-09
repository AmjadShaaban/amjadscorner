"use client";
import { ReactNode, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/state";
import { AuthUser } from "@/types/user";

type SessionWrapperProps = {
  children: ReactNode;
  initialSession: any;
};

const SyncAuthStore = () => {
  const { data: session } = useSession();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as AuthUser;
      setUser({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } else {
      setUser(null);
    }
  }, [session, setUser]);

  return null;
};

const SessionWrapper = ({ children, initialSession }: SessionWrapperProps) => {
  return (
    <SessionProvider session={initialSession}>
      <SyncAuthStore />
      {children}
    </SessionProvider>
  );
};

export default SessionWrapper;
