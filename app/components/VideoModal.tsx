import { Video } from "@imagekit/next";
import { IVideo } from "@/models/Video";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Need session to know if "I" reacted

interface VideoModalProps {
  video: IVideo;
  onClose: () => void;
  onDelete: (videoId: string) => void;
  canDelete: boolean;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function VideoModal({ video, onClose, onDelete, canDelete }: VideoModalProps) {
  const { data: session } = useSession();
  const [reactions, setReactions] = useState(video.reactions || []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Handle Reaction Click
  const handleReaction = async (emoji: string) => {
    if (!session) {
      alert("Please login to react");
      return;
    }

    // 1. Optimistic Update (Update UI immediately)
    const userId = session.user.id;
    const currentReactions = [...reactions];
    const userReactionIndex = currentReactions.findIndex((r: any) => 
      (r.user._id || r.user) === userId
    );

    let newReactions = [...currentReactions];

    if (userReactionIndex > -1) {
      if (currentReactions[userReactionIndex].emoji === emoji) {
        // Toggle off
        newReactions.splice(userReactionIndex, 1);
      } else {
        // Update emoji
        newReactions[userReactionIndex] = { ...newReactions[userReactionIndex], emoji };
      }
    } else {
      // Add new
      newReactions.push({ user: userId, emoji });
    }

    setReactions(newReactions); // Update UI

    // 2. Call API
    try {
      const res = await fetch("/api/video/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video._id, emoji }),
      });

      if (!res.ok) {
        // Revert if failed
        setReactions(currentReactions);
        alert("Failed to react");
      }
    } catch (error) {
      setReactions(currentReactions);
    }
  };

  // Helper to get email safely
  const uploaderEmail = typeof video.uploader === 'object' && video.uploader?.email 
    ? video.uploader.email 
    : "Unknown User";

  // Check if current user has reacted
  const myReaction = reactions.find((r: any) => 
    (r.user._id || r.user) === session?.user?.id
  )?.emoji;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        
        <div className="flex-1 bg-black flex items-center justify-center relative">
           <Video
              urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT!}
              src={video.videoUrl}
              controls={true}
              autoPlay={true}
              className="max-w-full max-h-[70vh] md:max-h-[85vh] w-auto h-auto object-contain"
            />
        </div>

        <div className="p-6 w-full md:w-80 bg-white flex flex-col shrink-0 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h2>
          <p className="text-gray-600 whitespace-pre-wrap flex-1 mb-4">{video.description}</p>
          
          {/* --- REACTION SECTION --- */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Reactions</h3>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`px-3 py-2 rounded-full text-lg transition-all border ${
                    myReaction === emoji 
                      ? "bg-blue-100 border-blue-400 scale-110" 
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {emoji} <span className="text-xs text-gray-600 ml-1">
                    {reactions.filter((r: any) => r.emoji === emoji).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* ------------------------- */}

          <div className="mt-auto pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4">
              Uploaded by: <span className="font-medium text-gray-800">{uploaderEmail}</span>
            </p>

            {canDelete && (
              <button
                onClick={() => {
                  if(confirm("Are you sure you want to delete this video?")) {
                    onDelete(video._id as string);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                Delete Video
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}