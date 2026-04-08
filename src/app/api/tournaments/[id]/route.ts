import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        creator: { select: { email: true, name: true } },
        participants: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(tournament);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
