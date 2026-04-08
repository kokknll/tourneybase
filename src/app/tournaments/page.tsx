"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Tournament {
  id: string;
  title: string;
  description: string | null;
  category: string;
  activity: string;
  difficulty: string;
  format: string;
  leaderboardType: string;
  isOnline: boolean;
  location: string | null;
  prizeType: string | null;
  prizeAmount: string | null;
  maxPlayers: number;
  startDate: string;
  status: string;
  creator: { email: string; name: string | null };
  _count: { participants: number };
}

const CATEGORIES = ["All", "Gaming", "Sports", "Board Games", "Card Games", "Esports", "Other"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced", "Open"];

export default function BrowseTournamentsPage() {
  const { data: session } = useSession();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [onlineFilter, setOnlineFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== "All") params.set("category", category);
      if (difficulty !== "All") params.set("difficulty", difficulty);
      if (onlineFilter === "true" || onlineFilter === "false") params.set("online", onlineFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/tournaments?${params}`);
      if (res.ok) {
        setTournaments(await res.json());
      }
      setLoading(false);
    }

    const debounce = setTimeout(fetchTournaments, 300);
    return () => clearTimeout(debounce);
  }, [category, difficulty, onlineFilter, search]);

  const formatLabel: Record<string, string> = {
    single_elimination: "Single Elim",
    double_elimination: "Double Elim",
    round_robin: "Round Robin",
    swiss: "Swiss",
    free_for_all: "FFA",
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Browse Tournaments</h1>
              <p className="mt-1 text-muted">Find and join tournaments that match your style.</p>
            </div>
            {session && (
              <Link
                href="/tournaments/create"
                className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-light hover:shadow-accent/40 hover:-translate-y-0.5"
              >
                Create Tournament
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="mb-8 rounded-2xl border border-border bg-surface p-4 space-y-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />

            <div className="flex flex-wrap gap-3">
              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Category:</span>
                <div className="flex gap-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                        category === c
                          ? "bg-accent text-white"
                          : "bg-background text-muted hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Difficulty */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Difficulty:</span>
                <div className="flex gap-1">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                        difficulty === d
                          ? "bg-accent text-white"
                          : "bg-background text-muted hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Online/IRL */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Type:</span>
                <div className="flex gap-1">
                  {[
                    { value: "all", label: "All" },
                    { value: "true", label: "Online" },
                    { value: "false", label: "IRL" },
                  ].map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setOnlineFilter(o.value)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                        onlineFilter === o.value
                          ? "bg-accent text-white"
                          : "bg-background text-muted hover:text-foreground"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <p className="text-center text-muted py-16">Loading tournaments...</p>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted mb-4">No tournaments found.</p>
              {session && (
                <Link
                  href="/tournaments/create"
                  className="text-sm font-medium text-accent-light hover:underline"
                >
                  Create one!
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((t) => (
                <Link
                  key={t.id}
                  href={`/tournaments/${t.id}`}
                  className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/30 hover:bg-surface-light"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.status === "upcoming" ? "bg-accent/10 text-accent-light" :
                      t.status === "active" ? "bg-emerald-500/10 text-emerald-400" :
                      "bg-muted/10 text-muted"
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-xs text-muted">
                      {t._count.participants}/{t.maxPlayers}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold mb-1 group-hover:text-accent-light transition-colors">
                    {t.title}
                  </h3>

                  <p className="text-sm text-muted mb-3">{t.activity}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="rounded bg-background px-2 py-0.5 text-xs text-muted">{t.category}</span>
                    <span className="rounded bg-background px-2 py-0.5 text-xs text-muted">{t.difficulty}</span>
                    <span className="rounded bg-background px-2 py-0.5 text-xs text-muted">
                      {formatLabel[t.format] || t.format}
                    </span>
                    <span className="rounded bg-background px-2 py-0.5 text-xs text-muted">
                      {t.isOnline ? "Online" : t.location || "IRL"}
                    </span>
                  </div>

                  {t.prizeType && (
                    <div className="mb-3 text-xs text-accent-light">
                      Prize: {t.prizeAmount || t.prizeType}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{new Date(t.startDate).toLocaleDateString()}</span>
                    <span>{t.creator.name || t.creator.email}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
