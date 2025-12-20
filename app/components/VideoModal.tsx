import { IKVideo } from "imagekitio-next";
import { IVideo } from "@/models/Video";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; 

interface VideoModalProps {
  video: IVideo;
  onClose: () => void;
  onDelete: (videoId: string) => void;
  canDelete: boolean;
  onVideoUpdate: (updatedVideo: IVideo) => void;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function VideoModal({ video, onClose, onDelete, canDelete, onVideoUpdate }: VideoModalProps) {
  const { data: session } = useSession();
  const [reactions, setReactions] = useState(video.reactions || []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleReaction = async (emoji: string) => {
    if (!session) {
      alert("Please login to react");
      return;
    }

    const userId = session.user.id;
    const currentReactions = [...reactions];
    const userReactionIndex = currentReactions.findIndex((r: any) => 
      (r.user._id || r.user) === userId
    );

    let newReactions = [...currentReactions];

    if (userReactionIndex > -1) {
      if (currentReactions[userReactionIndex].emoji === emoji) {
        newReactions.splice(userReactionIndex, 1);
      } else {
        newReactions[userReactionIndex] = { ...newReactions[userReactionIndex], emoji };
      }
    } else {
      newReactions.push({ user: userId, emoji });
    }

    setReactions(newReactions);

    try {
      const res = await fetch("/api/video/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video._id, emoji }),
      });

      if (!res.ok) {
        setReactions(currentReactions);
      } else {
        const data = await res.json();
        const updatedVideo = {
          ...video,
          reactions: data.reactions
        };
        onVideoUpdate(updatedVideo);
      }
    } catch (error) {
      setReactions(currentReactions);
    }
  };

  const uploaderEmail = typeof video.uploader === 'object' && video.uploader?.email 
    ? video.uploader.email 
    : "Unknown User";
  
  const uploaderName = uploaderEmail.split("@")[0];

  const myReaction = reactions.find((r: any) => 
    (r.user._id || r.user) === session?.user?.id
  )?.emoji;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      {/* Close Button (Absolute Top Right) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/10">
        
        {/* LEFT: VIDEO PLAYER */}
        <div className="flex-1 bg-black flex items-center justify-center relative min-h-[40vh]">
           <IKVideo
              src={video.videoUrl}
              urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
              controls={true}
              autoPlay={true}
              className="w-full h-full max-h-[85vh] object-contain"
            />
        </div>

        {/* RIGHT: SIDEBAR DETAILS */}
        <div className="w-full md:w-96 bg-gray-900/95 border-l border-white/10 flex flex-col shrink-0">
          
          {/* Header Section */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
              {video.title}
            </h2>
            
            <div className="flex items-center gap-2 mt-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                {uploaderName[0].toUpperCase()}
              </div>
              <p className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                {uploaderName}
              </p>
            </div>
          </div>

          {/* Scrollable Description */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {video.description}
            </p>
          </div>
          
          {/* Footer: Reactions & Actions */}
          <div className="p-6 bg-gray-800/50 border-t border-white/10">
            
            {/* Reaction Dock */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 font-medium">React to this video</span>
                <span className="text-xs text-gray-500">{reactions.length} total</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center bg-black/20 p-3 rounded-xl border border-white/5">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`
                      relative w-10 h-10 flex items-center justify-center rounded-full text-lg transition-all duration-200
                      hover:scale-110 active:scale-95
                      ${myReaction === emoji 
                        ? "bg-blue-500/20 border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                        : "bg-white/5 border border-white/5 hover:bg-white/10"}
                    `}
                  >
                    {emoji}
                    {/* Tiny counter badge for specific emoji */}
                    <span className="absolute -top-1 -right-1 text-[9px] bg-black text-gray-300 px-1 rounded-full">
                       {reactions.filter((r: any) => r.emoji === emoji).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Delete Button (Only if Owner) */}
            {canDelete && (
              <button
                onClick={() => {
                  if(confirm("Are you sure you want to delete this video?")) {
                    onDelete(video._id as string);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-all text-sm font-medium group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete Video
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Background Click to Close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}