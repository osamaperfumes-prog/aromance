// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Initialize ImageKit securely on the server
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function GET(request: Request) {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error('Error getting ImageKit auth params:', error);
    return NextResponse.json(
      { error: 'Failed to get authentication parameters' },
      { status: 500 }
    );
  }
}
