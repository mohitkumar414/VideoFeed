import mongoose, { Schema, model, models } from "mongoose";

export const VIDEO_DIMENSIONS = {
  width: 1080,
  heigth: 1920,
} as const;

export interface IVideo {
  _id?: mongoose.Types.ObjectId | string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls?: boolean;
  // UPDATED: uploader can be a string (ID) OR an object (Populated User)
  uploader?: {
    _id: string;
    email: string;
    username?: string;
  } | string; 
  // --- NEW FIELD ---
  reactions?: {
    user: string | mongoose.Types.ObjectId;
    emoji: string;
  }[];
  // ----------------
  createdAt?: Date;
  updatedAt?: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    controls: { type: Boolean, default: true },
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true }, // This allows population
    // --- NEW SCHEMA DEFINITION ---
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        emoji: { type: String, required: true },
      },
    ],
    // -----------------------------
  },
  { timestamps: true }
);

const Video = models?.Video || model<IVideo>("Video", videoSchema);
export default Video;