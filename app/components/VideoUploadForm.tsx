"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VideoUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");

  // 1. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // Check file size (100 MB = 100 * 1024 * 1024 bytes)
    if (selectedFile.size > 100 * 1024 * 1024) {
      alert("File size exceeds 100 MB limit.");
      e.target.value = ""; // Clear the input
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  // 2. Manual Upload Logic
  const handleUpload = async () => {
    if (!file || !title || !description) {
      alert("Please fill in all fields and select a file.");
      return;
    }

    setUploading(true);
    setProgress("Starting upload...");

    try {
      // Step A: Get Auth Parameters from your backend
      const authResponse = await fetch("/api/imagekit-auth");
      if (!authResponse.ok) throw new Error("Failed to get auth params");
      const { signature, expire, token } = await authResponse.json();

      // Step B: Prepare the form data for ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", title.replace(/\s+/g, "-")); // Clean filename
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
      formData.append("signature", signature);
      formData.append("expire", expire);
      formData.append("token", token);
      formData.append("useUniqueFileName", "true");
      formData.append("tags", "video");

      setProgress("Uploading to ImageKit...");

      // Step C: Upload directly to ImageKit API
      const uploadResponse = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || "Upload to ImageKit failed");
      }

      const uploadResult = await uploadResponse.json();

      // Step D: Generate Thumbnail URL (Standard logic)
      // Manually constructing the thumbnail URL to skip black frames
      const thumbnailUrl = `${uploadResult.url}?tr=w-400,so-1.5`;

      setProgress("Saving details...");

      // Step E: Save metadata to your MongoDB
      const dbResponse = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          videoUrl: uploadResult.url,
          thumbnailUrl,
        }),
      });

      if (!dbResponse.ok) {
        // Parse the error message from the backend
        const errorData = await dbResponse.json();
        throw new Error(errorData.error || "Failed to save to database");
      }

      alert("Upload successful!");
      router.push("/feed");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-md bg-white">
      {/* Title Input */}
      <div className="mb-4">
        <label htmlFor="title" className="block font-medium mb-2 text-gray-900">
          Video Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My cool video"
          className="w-full p-2 border rounded text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={uploading}
        />
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <label htmlFor="description" className="block font-medium mb-2 text-gray-900">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A description of my video..."
          className="w-full p-2 border rounded text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={uploading}
        />
      </div>

      {/* File Input */}
      <div className="mb-6">
        <p className="mb-2 text-gray-900 font-medium">Select your video file</p>
        
        {/* Custom File Wrapper for CSS Styling */}
        <div className="file-upload-wrapper">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            "
          />
        </div>
        
        {/* Helper Note */}
        <p className="mt-1 text-xs text-gray-500">
          Max upload size: 100 MB
        </p>
      </div>

      {/* Upload Button - Only visible when file is selected */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading || !title || !description}
          className={`w-full py-2 px-4 rounded font-bold text-white transition-colors ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? (progress || "Uploading...") : "Upload Video"}
        </button>
      )}
    </div>
  );
}