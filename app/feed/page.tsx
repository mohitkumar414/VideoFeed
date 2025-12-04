"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IVideo } from "@/models/Video";
import VideoModal from "../components/VideoModal";
import LiveThumbnail from "../components/LiveThumbnail";
import { signOut, useSession } from "next-auth/react"; // Import useSession

export default function FeedPage() {
  const { data: session } = useSession(); // Get the logged-in user
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/video");
        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();
        setVideos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // --- HANDLE DELETE FUNCTION ---
  const handleDeleteVideo = async (videoId: string) => {
    try {
      const response = await fetch("/api/video", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: videoId }),
      });

      if (response.ok) {
        // Remove video from the list locally so we don't have to refresh
        setVideos((prev) => prev.filter((v) => v._id !== videoId));
        setSelectedVideo(null); // Close the modal
        alert("Video deleted successfully");
      } else {
        alert("Failed to delete video");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Error occurred while deleting");
    }
  };

  // 1. ADD THIS FUNCTION
  const handleVideoUpdate = (updatedVideo: IVideo) => {
    // Update the main list so it persists when modal closes
    setVideos((prev) => 
      prev.map((v) => (v._id === updatedVideo._id ? updatedVideo : v))
    );
    // Update the currently selected video so the modal doesn't flicker
    setSelectedVideo(updatedVideo);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Video Feed</h1>
        
        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            + Upload Video
          </Link>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-white text-red-600 font-medium rounded-full border border-red-200 shadow-sm hover:bg-red-50 hover:border-red-300 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {videos.map((video) => (
            <div
              key={video._id?.toString()}
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-100"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="aspect-[9/16] relative bg-gray-200">
                <LiveThumbnail src={video.videoUrl} />
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVideo && (
        <VideoModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)}
          onDelete={handleDeleteVideo}
          // CHECK OWNERSHIP: Compare session user ID with video uploader ID
          canDelete={
            session?.user?.id === 
            (typeof selectedVideo.uploader === "object" 
              ? selectedVideo.uploader._id 
              : selectedVideo.uploader)
          }
          // 2. PASS THE FUNCTION HERE
          onVideoUpdate={handleVideoUpdate}
        />
      )}
    </div>
  );
}