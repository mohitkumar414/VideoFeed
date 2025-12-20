"use client";

import { apiClient } from "@/lib/api-client";
import { IVideo } from "@/models/Video";
import { useEffect, useState } from "react";
import VideoModal from "@/app/components/VideoModal";
import VideoCard from "@/app/components/VideoCard";
import SkeletonFeed from "@/app/components/SkeletonFeed";
import VideoUploadForm from "@/app/components/VideoUploadForm";
import { signOut } from "next-auth/react";

export default function FeedPage() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchVideos = async () => {
    try {
      const data = await apiClient.getVideos();
      setVideos(data as IVideo[]);
    } catch (err) {
      setError("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await fetch("/api/video", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: videoId }),
      });
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      setSelectedVideo(null);
    } catch (error) {
      console.error("Failed to delete video", error);
    }
  };

  const handleVideoUpdate = (updatedVideo: IVideo) => {
    setVideos((prev) => 
      prev.map((v) => (v._id === updatedVideo._id ? updatedVideo : v))
    );
    setSelectedVideo(updatedVideo);
  };

  // Filter videos based on search
  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* --- HEADER SECTION --- */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            VideoFeed
          </h1>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-none sm:w-72">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload
            </button>

            {/* Logout Button */}
            <button 
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600/20 text-red-500 hover:bg-red-600/30 border border-red-600/50 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* MAIN FEED CONTENT */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 bg-red-900/20 px-4 py-2 rounded-lg inline-block">
              {error}
            </p>
          </div>
        )}

        {loading && <SkeletonFeed />}

        {!loading && filteredVideos.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No videos found matching your search.</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video._id?.toString()}
                video={video}
                onClick={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        )}
      </main>

      {/* VIDEO PLAYER MODAL */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onDelete={handleDeleteVideo}
          canDelete={true}
          onVideoUpdate={handleVideoUpdate}
        />
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
             {/* Close Button */}
             <button 
               onClick={() => setShowUploadModal(false)}
               className="absolute top-4 right-4 text-gray-400 hover:text-white"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>

             <h2 className="text-xl font-bold text-white mb-4">Upload New Video</h2>
             
             {/* Render the Form */}
             <VideoUploadForm />
          </div>
        </div>
      )}
    </div>
  );
}