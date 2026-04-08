import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Creator sets placements — scores are auto-calculated
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Only the creator can set placements" }, { status: 403 });
    }

    // placements: [{ participantId: string, placement: number }]
    const { placements } = await request.json();

    if (!Array.isArray(placements)) {
      return NextResponse.json({ error: "Invalid placements data" }, { status: 400 });
    }

    // Calculate score based on leaderboard type
    for (const p of placements) {
      let score: number | null = null;

      if (tournament.leaderboardType === "points" && p.placement) {
        // Formula: basePoints * decay^(placement - 1)
        score = Math.round(tournament.basePoints * Math.pow(tournament.pointsDecay, p.placement - 1));
      }

      await prisma.tournamentParticipant.update({
        where: { id: p.participantId },
        data: {
          placement: p.placement || null,
          score,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
