import { Video } from "@imagekit/next";
import { IVideo } from "@/models/Video";
import { useEffect } from "react";

interface VideoModalProps {
  video: IVideo;
  onClose: () => void;
  onDelete: (videoId: string) => void; // Function to handle delete
  canDelete: boolean; // Boolean to check ownership
}

export default function VideoModal({ video, onClose, onDelete, canDelete }: VideoModalProps) {
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Helper to get email safely
  const uploaderEmail = typeof video.uploader === 'object' && video.uploader?.email 
    ? video.uploader.email 
    : "Unknown User";

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
          
          <div className="mt-auto pt-4 border-t border-gray-100">
            {/* Display Uploader Email */}
            <p className="text-sm text-gray-500 mb-4">
              Uploaded by: <span className="font-medium text-gray-800">{uploaderEmail}</span>
            </p>

            {/* Conditional Delete Button */}
            {canDelete && (
              <button
                onClick={() => {
                  if(confirm("Are you sure you want to delete this video?")) {
                    onDelete(video._id as string);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
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