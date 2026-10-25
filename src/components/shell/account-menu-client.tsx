"use client";

import { UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { SocialProvider } from "@/lib/auth";

const providerLabels: Record<SocialProvider, string> = { github: "GitHub", google: "Google" };

type Props = {
  user: { name: string; email: string; isAnonymous: boolean } | null;
  providers: readonly SocialProvider[];
};

export function AccountMenuClient({ user, providers }: Props) {
  const router = useRouter();
  const isGuest = !user || user.isAnonymous;

  async function signInWith(provider: SocialProvider) {
    const { error } = await authClient.signIn.social({ provider, callbackURL: window.location.pathname });
    if (error) toast.error(error.message ?? "Sign-in failed");
  }

  async function signOut() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Account" />}>
        <UserIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {isGuest ? "Browsing as guest" : user.name}
            {!isGuest && <div className="truncate text-xs font-normal text-muted-foreground">{user.email}</div>}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        {isGuest && providers.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {providers.map((p) => (
                <DropdownMenuItem key={p} onClick={() => signInWith(p)}>
                  Sign in with {providerLabels[p]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
        {isGuest && providers.length === 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              No sign-in providers configured.
            </DropdownMenuLabel>
          </DropdownMenuGroup>
        )}
        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
