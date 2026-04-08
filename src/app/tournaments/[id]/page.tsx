"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Participant {
  id: string;
  placement: number | null;
  score: number | null;
  user: { id: string; email: string; name: string | null };
}

interface Tournament {
  id: string;
  title: string;
  description: string | null;
  category: string;
  activity: string;
  difficulty: string;
  format: string;
  leaderboardType: string;
  basePoints: number;
  pointsDecay: number;
  prizeType: string | null;
  prizeAmount: string | null;
  isOnline: boolean;
  location: string | null;
  language: string;
  maxPlayers: number;
  startDate: string;
  status: string;
  creatorId: string;
  creator: { email: string; name: string | null };
  participants: Participant[];
}

export default function TournamentPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPlacements, setEditingPlacements] = useState(false);
  const [placements, setPlacements] = useState<Record<string, number>>({});

  const fetchTournament = useCallback(async () => {
    const res = await fetch(`/api/tournaments/${id}`);
    if (res.ok) {
      const data = await res.json();
      setTournament(data);
      // Init placements from existing data
      const existing: Record<string, number> = {};
      data.participants.forEach((p: Participant) => {
        if (p.placement) existing[p.id] = p.placement;
      });
      setPlacements(existing);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted">Tournament not found</p>
        <Link href="/" className="text-accent-light hover:underline">Go home</Link>
      </div>
    );
  }

  const isCreator = session?.user?.id === tournament.creatorId;
  const isParticipant = tournament.participants.some(
    (p) => p.user.id === session?.user?.id,
  );
  const isFull = tournament.participants.length >= tournament.maxPlayers;

  const sorted = [...tournament.participants].sort((a, b) => {
    if (tournament.leaderboardType === "points") {
      return (b.score ?? 0) - (a.score ?? 0);
    }
    if (a.placement === null) return 1;
    if (b.placement === null) return -1;
    return a.placement - b.placement;
  });

  async function handleJoin() {
    setJoining(true);
    const res = await fetch(`/api/tournaments/${id}/join`, { method: "POST" });
    if (res.ok) {
      fetchTournament();
    }
    setJoining(false);
  }

  async function handleSavePlacements() {
    setSaving(true);
    const data = Object.entries(placements).map(([participantId, placement]) => ({
      participantId,
      placement,
    }));

    const res = await fetch(`/api/tournaments/${id}/placements`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placements: data }),
    });

    if (res.ok) {
      setEditingPlacements(false);
      fetchTournament();
    }
    setSaving(false);
  }

  function calculatePreviewScore(placement: number) {
    return Math.round(tournament!.basePoints * Math.pow(tournament!.pointsDecay, placement - 1));
  }

  const formatLabel: Record<string, string> = {
    single_elimination: "Single Elimination",
    double_elimination: "Double Elimination",
    round_robin: "Round Robin",
    swiss: "Swiss",
    free_for_all: "Free for All",
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{tournament.title}</h1>
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                tournament.status === "upcoming" ? "bg-accent/10 text-accent-light" :
                tournament.status === "active" ? "bg-emerald-500/10 text-emerald-400" :
                "bg-muted/10 text-muted"
              }`}>
                {tournament.status}
              </span>
            </div>
            {tournament.description && (
              <p className="text-muted mb-4">{tournament.description}</p>
            )}

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-lg border border-border bg-surface px-3 py-1.5">{tournament.category}</span>
              <span className="rounded-lg border border-border bg-surface px-3 py-1.5">{tournament.activity}</span>
              <span className="rounded-lg border border-border bg-surface px-3 py-1.5">{tournament.difficulty}</span>
              <span className="rounded-lg border border-border bg-surface px-3 py-1.5">{formatLabel[tournament.format] || tournament.format}</span>
              <span className="rounded-lg border border-border bg-surface px-3 py-1.5">{tournament.isOnline ? "Online" : tournament.location || "IRL"}</span>
              <span className="rounded-lg border border-border bg-surface px-3 py-1.5">{tournament.language}</span>
            </div>

            <div className="mt-4 flex items-center gap-6 text-sm text-muted">
              <span>{tournament.participants.length}/{tournament.maxPlayers} players</span>
              <span>Starts {new Date(tournament.startDate).toLocaleDateString()}</span>
              <span>By {tournament.creator.name || tournament.creator.email}</span>
            </div>

            {tournament.prizeType && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-1.5 text-sm text-accent-light">
                Prize: {tournament.prizeAmount || tournament.prizeType}
              </div>
            )}
          </div>

          {/* Join button */}
          {session && !isCreator && !isParticipant && !isFull && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="mb-8 rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-light hover:shadow-accent/40 disabled:opacity-50"
            >
              {joining ? "Joining..." : "Join Tournament"}
            </button>
          )}

          {isParticipant && !isCreator && (
            <p className="mb-8 text-sm text-emerald-400">You&apos;re in this tournament!</p>
          )}

          {isFull && !isParticipant && !isCreator && (
            <p className="mb-8 text-sm text-red-400">Tournament is full</p>
          )}

          {/* Leaderboard */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Leaderboard
                <span className="ml-2 text-xs font-normal text-muted">
                  ({tournament.leaderboardType === "points" ? "Points" : "Ladder"})
                </span>
              </h2>
              {isCreator && tournament.participants.length > 0 && (
                <button
                  onClick={() => setEditingPlacements(!editingPlacements)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
                >
                  {editingPlacements ? "Cancel" : "Set Placements"}
                </button>
              )}
            </div>

            {tournament.participants.length === 0 ? (
              <p className="text-sm text-muted py-8 text-center">No participants yet</p>
            ) : (
              <div className="space-y-2">
                {(editingPlacements ? tournament.participants : sorted).map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                      !editingPlacements && i === 0 && p.placement === 1
                        ? "border-yellow-500/30 bg-yellow-500/5"
                        : !editingPlacements && i === 1 && p.placement === 2
                        ? "border-gray-400/30 bg-gray-400/5"
                        : !editingPlacements && i === 2 && p.placement === 3
                        ? "border-amber-600/30 bg-amber-600/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {!editingPlacements && p.placement && (
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          p.placement === 1 ? "bg-yellow-500/20 text-yellow-400" :
                          p.placement === 2 ? "bg-gray-400/20 text-gray-300" :
                          p.placement === 3 ? "bg-amber-600/20 text-amber-500" :
                          "bg-surface-light text-muted"
                        }`}>
                          {p.placement}
                        </span>
                      )}
                      <span className="text-sm font-medium">
                        {p.user.name || p.user.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {editingPlacements ? (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted">Place:</label>
                          <input
                            type="number"
                            min="1"
                            max={tournament.participants.length}
                            value={placements[p.id] || ""}
                            onChange={(e) =>
                              setPlacements({ ...placements, [p.id]: parseInt(e.target.value) })
                            }
                            className="w-16 rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-accent focus:outline-none"
                          />
                          {tournament.leaderboardType === "points" && placements[p.id] && (
                            <span className="text-xs text-accent-light">
                              → {calculatePreviewScore(placements[p.id])} pts
                            </span>
                          )}
                        </div>
                      ) : (
                        <>
                          {tournament.leaderboardType === "points" && p.score !== null && (
                            <span className="text-sm font-semibold text-accent-light">
                              {p.score} pts
                            </span>
                          )}
                          {!p.placement && (
                            <span className="text-xs text-muted">Unranked</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingPlacements && (
              <button
                onClick={handleSavePlacements}
                disabled={saving}
                className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-light disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Placements"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
