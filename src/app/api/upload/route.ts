
// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Initialize ImageKit securely on the server
// These values must be set in your .env file
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function GET(request: Request) {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error('Error getting ImageKit auth params:', error);
    // Provide a more specific error message in development
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: `Failed to get authentication parameters. Please check your server-side ImageKit credentials. Details: ${errorMessage}` },
      { status: 500 }
    );
  }
}
