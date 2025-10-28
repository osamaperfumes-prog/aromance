
// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Initialize ImageKit securely on the server
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  // --- TEMPORARY DIAGNOSTIC STEP ---
  // The private key is hardcoded here to test if the key value itself is the problem.
  // This is NOT a secure practice and should be reverted after testing.
  privateKey: "/NNxyjKnDB58I3OWclSeIRFpqQU=",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
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
