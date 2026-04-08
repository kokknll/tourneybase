"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["Gaming", "Sports", "Board Games", "Card Games", "Esports", "Other"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Open"];
const FORMATS = [
  { value: "single_elimination", label: "Single Elimination" },
  { value: "double_elimination", label: "Double Elimination" },
  { value: "round_robin", label: "Round Robin" },
  { value: "swiss", label: "Swiss" },
  { value: "free_for_all", label: "Free for All" },
];

export default function CreateTournamentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState("ladder");
  const [basePoints, setBasePoints] = useState(100);
  const [pointsDecay, setPointsDecay] = useState(0.5);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      activity: formData.get("activity"),
      difficulty: formData.get("difficulty"),
      format: formData.get("format"),
      prizeType: formData.get("prizeType") || null,
      prizeAmount: formData.get("prizeAmount") || null,
      isOnline,
      location: isOnline ? null : formData.get("location"),
      language: formData.get("language") || "English",
      maxPlayers: formData.get("maxPlayers"),
      startDate: formData.get("startDate"),
      leaderboardType,
      basePoints,
      pointsDecay,
    };

    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/tournaments/${result.id}`);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
  const labelClass = "mb-1.5 block text-sm font-medium text-muted";
  const selectClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to home
        </Link>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">Create Tournament</h1>
        <p className="mb-8 text-muted">Set up a new tournament and invite players to compete.</p>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-lg font-semibold">Basic Info</h2>

            <div>
              <label htmlFor="title" className={labelClass}>Tournament Name *</label>
              <input id="title" name="title" required placeholder="e.g. Friday Night Smash Bros" className={inputClass} />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>Description</label>
              <textarea id="description" name="description" rows={3} placeholder="What's this tournament about?" className={inputClass} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className={labelClass}>Category *</label>
                <select id="category" name="category" required className={selectClass}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="activity" className={labelClass}>Activity / Game *</label>
                <input id="activity" name="activity" required placeholder="e.g. Super Smash Bros, Football" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-lg font-semibold">Settings</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="difficulty" className={labelClass}>Difficulty *</label>
                <select id="difficulty" name="difficulty" required className={selectClass}>
                  <option value="">Select difficulty</option>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="format" className={labelClass}>Format</label>
                <select id="format" name="format" className={selectClass}>
                  {FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="maxPlayers" className={labelClass}>Max Players *</label>
                <input id="maxPlayers" name="maxPlayers" type="number" min="2" max="1024" required placeholder="e.g. 16" className={inputClass} />
              </div>

              <div>
                <label htmlFor="startDate" className={labelClass}>Start Date *</label>
                <input id="startDate" name="startDate" type="datetime-local" required className={inputClass} />
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-lg font-semibold">Leaderboard & Scoring</h2>

            <div>
              <label className={labelClass}>Leaderboard Type *</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setLeaderboardType("ladder")}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    leaderboardType === "ladder"
                      ? "border-accent bg-accent/10 text-accent-light"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  Ladder
                  <span className="block text-xs mt-0.5 opacity-70">Ranked by placement</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardType("points")}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    leaderboardType === "points"
                      ? "border-accent bg-accent/10 text-accent-light"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  Points
                  <span className="block text-xs mt-0.5 opacity-70">Score calculated from placement</span>
                </button>
              </div>
            </div>

            {leaderboardType === "points" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="basePoints" className={labelClass}>Base Points (1st place)</label>
                    <input
                      id="basePoints"
                      type="number"
                      min="10"
                      max="10000"
                      value={basePoints}
                      onChange={(e) => setBasePoints(parseInt(e.target.value) || 100)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="pointsDecay" className={labelClass}>Decay Factor</label>
                    <input
                      id="pointsDecay"
                      type="number"
                      min="0.1"
                      max="0.9"
                      step="0.1"
                      value={pointsDecay}
                      onChange={(e) => setPointsDecay(parseFloat(e.target.value) || 0.5)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs font-medium text-muted mb-2">Score Preview</p>
                  <p className="text-xs text-muted mb-3">
                    Formula: <code className="text-accent-light">base × decay^(place-1)</code>
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((place) => (
                      <div key={place} className="flex items-center justify-between rounded bg-surface px-3 py-1.5">
                        <span className="text-muted">#{place}</span>
                        <span className="font-medium text-foreground">
                          {Math.round(basePoints * Math.pow(pointsDecay, place - 1))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-lg font-semibold">Location</h2>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsOnline(true)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  isOnline
                    ? "border-accent bg-accent/10 text-accent-light"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setIsOnline(false)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  !isOnline
                    ? "border-accent bg-accent/10 text-accent-light"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                In Real Life
              </button>
            </div>

            {!isOnline && (
              <div>
                <label htmlFor="location" className={labelClass}>Location</label>
                <input id="location" name="location" placeholder="e.g. Amsterdam, Netherlands" className={inputClass} />
              </div>
            )}

            <div>
              <label htmlFor="language" className={labelClass}>Language</label>
              <input id="language" name="language" defaultValue="English" placeholder="e.g. English, Dutch" className={inputClass} />
            </div>
          </div>

          {/* Prize */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-lg font-semibold">Prize (optional)</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="prizeType" className={labelClass}>Prize Type</label>
                <select id="prizeType" name="prizeType" className={selectClass}>
                  <option value="">No prize</option>
                  <option value="cash">Cash</option>
                  <option value="gift_card">Gift Card</option>
                  <option value="trophy">Trophy</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="prizeAmount" className={labelClass}>Prize Details</label>
                <input id="prizeAmount" name="prizeAmount" placeholder="e.g. $100, Steam gift card" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-light hover:shadow-accent/40 hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Tournament"}
          </button>
        </form>
      </div>
    </div>
  );
}
