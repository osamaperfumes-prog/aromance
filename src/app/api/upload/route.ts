
// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Initialize ImageKit securely on the server
// DIAGNOSTIC: Hardcoding credentials to isolate the issue.
// This is NOT a secure practice for production.
const imagekit = new ImageKit({
  publicKey: "public_yw+V6c+9VKyU+t7YiV7o189QGeQ=",
  privateKey: "/NNxyjKnDB58I3OWclSeIRFpqQU=",
  urlEndpoint: "https://ik.imagekit.io/74zo8wkyp",
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
