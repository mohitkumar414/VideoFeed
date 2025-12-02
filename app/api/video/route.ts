import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Verify this path matches your project
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    // POPULATE: This fetches the 'email' from the User collection
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

// app/api/video/route.ts

// ... keep existing imports ...

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

    // --- 🚨 MODERATION CHECK START ---
    try {
      // 1. Construct the API URL for Sightengine
      // We check for 'nudity', 'wad' (Weapon, Alcohol, Drugs), and 'offensive' text
      const params = new URLSearchParams({
        'models': 'nudity,wad,offensive',
        'api_user': process.env.SIGHTENGINE_USER!,
        'api_secret': process.env.SIGHTENGINE_SECRET!,
        'url': body.thumbnailUrl, // Check the thumbnail image
      });

      const moderationRes = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`);
      const result = await moderationRes.json();

      // 2. Analyze the result
      // "nudity.safe" is a score from 0 to 1. (1 = Very Safe, 0 = Very NSFW)
      // "wad" (Weapons/Alcohol/Drugs) returns probability > 0.5 if present
      
      const isSafe = result.nudity?.safe > 0.8; // Must be 80% sure it's safe
      const hasWeapon = result.weapon > 0.5;
      const hasAlcohol = result.alcohol > 0.5;

      // 3. Reject if unsafe
      if (!isSafe || hasWeapon || hasAlcohol) {
        return NextResponse.json(
          { error: "Upload failed: Content violates community guidelines (NSFW/Violence detected)." },
          { status: 400 }
        );
      }
    } catch (modError) {
      console.error("Moderation API failed:", modError);
      // Optional: You can choose to fail the upload if moderation fails, 
      // or allow it and flag it for review. For now, we log it.
    }
    // --- 🚨 MODERATION CHECK END ---

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

// --- NEW DELETE ROUTE ---
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

    // SECURITY CHECK: Only allow delete if the current user is the uploader
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