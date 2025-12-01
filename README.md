# Video Sharing App 🎥

A full-stack video sharing application built with Next.js 15 (App Router), TypeScript, and MongoDB. This app allows users to create accounts, upload videos, and view a responsive video feed.

## 🚀 Features

* **User Authentication:** Secure signup and login using NextAuth.js (Credentials Provider).
* **Video Upload:** Direct-to-cloud uploads using ImageKit for performance.
* **Media Storage:** Videos and thumbnails stored/optimized via ImageKit.
* **Database:** MongoDB for storing user profiles and video metadata.
* **Responsive Feed:** Mobile-friendly video feed with smart thumbnail generation.
* **Secure Deletion:** Users can only delete videos they uploaded.

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Database:** MongoDB & Mongoose
* **Authentication:** NextAuth.js
* **Storage:** ImageKit.io
* **Styling:** Tailwind CSS

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file:

```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_SECRET=your_generated_secret_key
NEXTAUTH_URL=http://localhost:3000

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_URL_ENDPOINT=your_url_endpoint
IMAGEKIT_PRIVATE_KEY=your_private_key