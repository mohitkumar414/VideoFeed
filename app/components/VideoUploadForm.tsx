// app/components/VideoUploadForm.tsx
"use client";

import { IKUpload } from "imagekitio-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// This is the response from ImageKit
interface ImageKitResponse {
  fileId: string;
  filePath: string;
  url: string; // This will be our videoUrl
  thumbnailUrl?: string; // Make this optional, as it's not in the response
}

export default function VideoUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const onUploadSuccess = async (res: ImageKitResponse) => {
    console.log("ImageKit upload response:", res);

    // --- THIS IS THE FIX ---
    // 1. We create the thumbnail URL ourselves.
    // This tells ImageKit to get the first frame of the video.
    const generatedThumbnailUrl = res.url + "?tr=w-360,h-640,th-auto";
    // -----------------------

    // 2. We remove this failing check:
    // if (!res.thumbnailUrl) { ... }

    try {
      // Call YOUR API route: /api/video
      const dbResponse = await fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send the exact body your API expects
        body: JSON.stringify({
          title: title,
          description: description,
          videoUrl: res.url,
          // 3. We use our new generatedThumbnailUrl
          thumbnailUrl: generatedThumbnailUrl,
        }),
      });

      if (!dbResponse.ok) {
        throw new Error("Failed to save video to database");
      }

      alert("Upload successful!");
      router.push("/feed");
    } catch (error) {
      console.error(error);
      alert("Error saving video. Check console.");
    } finally {
      setIsUploading(false);
    }
  };

  const onUploadError = (err: any) => {
    console.error("Upload error:", err);
    alert("Upload failed. Check the console for errors.");
    setIsUploading(false);
  };

  // This console log will now be used by the component
  console.log("My Public Key:", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);

  return (
    <div className="p-6 border rounded-lg shadow-md bg-white">
      {/* Title Input */}
      <div className="mb-4">
        <label htmlFor="title" className="block font-medium mb-2 text-black">
          Video Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A title of my video..."
          className="w-full p-2 border rounded text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isUploading}
        />
      </div> {/* <-- 4. Fixed syntax error here (removed the '.') */}

      {/* Description Input */}
      <div className="mb-4">
        <label htmlFor="description" className="block font-medium mb-2 text-black">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A description of my video..."
          className="w-full p-2 border rounded text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isUploading}
        />
      </div>

      <p className="mb-4 text-gray-600">Select your video file to upload</p>

      {/* --- THIS IS THE FIXED COMPONENT --- */}
      <div className="file-upload-wrapper">
        <IKUpload
          publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
          urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
          authenticator={async () => {
            const response = await fetch("/api/imagekit-auth");
            return await response.json();
          }}
          onUploadStart={() => setIsUploading(true)}
          onSuccess={onUploadSuccess}
          onError={onUploadError}
          disabled={isUploading || !title || !description}
        />
      </div>
      {/* ---------------------------------- */}

      {isUploading && <p className="mt-4 text-blue-700">Uploading, please wait...</p>}
    </div>
  );
}