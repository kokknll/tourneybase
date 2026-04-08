import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const online = searchParams.get("online");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {
      status: { not: "ended" },
    };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (online === "true") where.isOnline = true;
    if (online === "false") where.isOnline = false;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { activity: { contains: search } },
      ];
    }

    const tournaments = await prisma.tournament.findMany({
      where,
      include: {
        creator: { select: { email: true, name: true } },
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tournaments);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      activity,
      difficulty,
      format,
      leaderboardType,
      basePoints,
      pointsDecay,
      prizeType,
      prizeAmount,
      isOnline,
      location,
      language,
      maxPlayers,
      startDate,
    } = body;

    if (!title || !category || !activity || !difficulty || !maxPlayers || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const tournament = await prisma.tournament.create({
      data: {
        title,
        description: description || null,
        category,
        activity,
        difficulty,
        format: format || "single_elimination",
        leaderboardType: leaderboardType || "ladder",
        basePoints: parseInt(basePoints) || 100,
        pointsDecay: parseFloat(pointsDecay) || 0.5,
        prizeType: prizeType || null,
        prizeAmount: prizeAmount || null,
        isOnline: isOnline ?? true,
        location: location || null,
        language: language || "English",
        maxPlayers: parseInt(maxPlayers),
        startDate: new Date(startDate),
        creatorId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, id: tournament.id });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
