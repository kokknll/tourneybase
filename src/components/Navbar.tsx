"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0019.875 10.875h0A3.375 3.375 0 0016.5 7.5h0V3.75m-9 15v-4.5A3.375 3.375 0 014.125 10.875h0A3.375 3.375 0 017.5 7.5h0V3.75m0 0h9" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">TourneyBase</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/tournaments" className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground">
            Browse
          </Link>
          {status === "loading" ? (
            <div className="h-9 w-20" />
          ) : session?.user ? (
            <>
              <Link href="/tournaments/create" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-light">
                Create Tournament
              </Link>
              <span className="text-sm text-muted">{session.user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-light"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground">
                Log in
              </Link>
              <Link href="/signup" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-light">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
