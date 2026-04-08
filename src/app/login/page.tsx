import { Suspense } from "react";
import LoginContent from "./LoginContent";

function LoginFallback() {
  return (
    <div className="relative z-10 w-full max-w-sm">
      <div className="mb-8 flex items-center justify-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0019.875 10.875h0A3.375 3.375 0 0016.5 7.5h0V3.75m-9 15v-4.5A3.375 3.375 0 014.125 10.875h0A3.375 3.375 0 017.5 7.5h0V3.75m0 0h9" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight">TourneyBase</span>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-8">
        <div className="mb-2 h-8 w-40 animate-pulse rounded bg-border" />
        <div className="mb-6 h-4 w-56 animate-pulse rounded bg-border" />
        <div className="flex flex-col gap-4">
          <div className="h-10 animate-pulse rounded-lg bg-border" />
          <div className="h-10 animate-pulse rounded-lg bg-border" />
          <div className="mt-2 h-10 animate-pulse rounded-lg bg-border" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="pointer-events-none absolute top-20 h-[400px] w-[600px] rounded-full bg-accent/10 blur-[120px]" />
      <Suspense fallback={<LoginFallback />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
