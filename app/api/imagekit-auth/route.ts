import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Initialize ImageKit with credentials
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

// This route handles the authentication request
export async function GET() {
  try {
    const authParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authParameters);
  } catch (error) {
    console.error("Error generating ImageKit auth params:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}