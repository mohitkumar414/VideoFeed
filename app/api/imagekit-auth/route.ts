// app/api/imagekit-auth/route.ts

import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Initialize ImageKit with your credentials
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

// This route handles the authentication request
export async function GET() {
  try {
    // Get the temporary authentication parameters
    const authParameters = imagekit.getAuthenticationParameters();

    // Return the parameters { token, expire, signature } as JSON
    return NextResponse.json(authParameters);
    
  } catch (error) {
    console.error("Error generating ImageKit auth params:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}