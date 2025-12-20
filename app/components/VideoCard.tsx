import { IVideo } from "@/models/Video";
import { useRef, useState } from "react";

interface VideoCardProps {
  video: IVideo;
  onClick: () => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
      });
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Video Container */}
      <div className="relative aspect-[9/16] w-full bg-black">
        <video
          ref={videoRef}
          src={video.videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
        
        {/* Play Icon Overlay (Only shows when NOT hovering) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
             <div className="rounded-full bg-white/20 p-3 backdrop-blur-md border border-white/30">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                 <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
               </svg>
             </div>
          </div>
        )}
      </div>

      {/* Text Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-12 pointer-events-none">
        <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        
        <div className="flex items-center justify-between mt-1"> 
          {video.reactions && video.reactions.length >= 0 && (
            <div className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm text-white">
              <span>👍❤️😂😮😢🔥</span>
              <span>{video.reactions.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}