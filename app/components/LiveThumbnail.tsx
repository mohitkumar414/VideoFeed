// app/components/LiveThumbnail.tsx
"use client";

import { useEffect, useRef } from "react";

interface LiveThumbnailProps {
  src: string;
}

export default function LiveThumbnail({ src }: LiveThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // When the component loads, try to play to skip black frames
    if (videoRef.current) {
      videoRef.current.currentTime = 1.5; // Jump to 1.5 seconds instantly
    }
  }, []);

  const handleMouseEnter = () => {
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    videoRef.current?.pause();
  };

  return (
    <div 
      className="w-full h-full bg-black relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        muted
        playsInline
        loop
        preload="metadata" // Only load enough to show a frame
      />
      {/* Overlay to indicate it's a video */}
      <div className="absolute top-2 right-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white drop-shadow-md">
          <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
        </svg>
      </div>
    </div>
  );
}