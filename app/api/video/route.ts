import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const videos = await Video.find({})
      .sort({ createdAt: -1 })
      .populate("uploader", "email") 
      .lean();

    if (!videos || videos.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body: IVideo = await request.json();

    if (!body.title || !body.videoUrl || !body.thumbnailUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      const params = new URLSearchParams({
        'models': 'nudity,wad,offensive',
        'api_user': process.env.SIGHTENGINE_USER!,
        'api_secret': process.env.SIGHTENGINE_SECRET!,
        'url': body.thumbnailUrl,
      });

      const moderationRes = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`);
      const result = await moderationRes.json();

      //Check for explicit guilt
      const hasRawNudity = result.nudity?.raw > 0.8;
      const hasWeapon = result.weapon > 0.5;
      const hasAlcohol = result.alcohol > 0.5;

      if (hasRawNudity || hasWeapon || hasAlcohol) {
        console.log("Blocked due to:", { hasRawNudity, hasWeapon, hasAlcohol });
        return NextResponse.json(
          { error: "Upload failed: Content detected as Explicit or Unsafe." },
          { status: 400 }
        );
      }
    } catch (modError) {
      console.error("Moderation API failed:", modError);
    }

    // Create the video in the database
    const videoData = {
      ...body,
      uploader: session.user.id,
    };

    const newVideo = await Video.create(videoData);
    return NextResponse.json(newVideo);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}

// DELETE ROUTE
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
    }

    await connectToDatabase();

    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Only allow delete if the current user is the uploader
    if (video.uploader.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this video" },
        { status: 403 }
      );
    }

    await Video.findByIdAndDelete(id);

    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}