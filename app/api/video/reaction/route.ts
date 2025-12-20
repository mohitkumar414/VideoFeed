import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoId, emoji } = await request.json();

    if (!videoId || !emoji) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectToDatabase();

    const video = await Video.findById(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const existingReactionIndex = video.reactions.findIndex(
      (r: any) => r.user.toString() === session.user.id
    );

    if (existingReactionIndex > -1) {
      const existingReaction = video.reactions[existingReactionIndex];

      if (existingReaction.emoji === emoji) {
        video.reactions.splice(existingReactionIndex, 1);
      } else {
        existingReaction.emoji = emoji;
      }
    } else {
      video.reactions.push({
        user: session.user.id,
        emoji: emoji,
      });
    }

    await video.save();

    return NextResponse.json({ 
      message: "Reaction updated", 
      reactions: video.reactions 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update reaction" },
      { status: 500 }
    );
  }
}