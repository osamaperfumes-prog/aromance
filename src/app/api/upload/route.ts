
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

export async function POST(request: Request) {
  try {
    const { fileName } = await request.json();
    if (!fileName) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Pass the filename to getAuthenticationParameters to include it in the signature
    const authenticationParameters = imagekit.getAuthenticationParameters(undefined, undefined, {
        fileName: fileName
    });
    
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

// Keeping GET for backward compatibility or direct access checks, though POST is now primary
export async function GET(request: Request) {
    try {
        const authenticationParameters = imagekit.getAuthenticationParameters();
        return NextResponse.json(authenticationParameters);
    } catch (error) {
        console.error('Error getting ImageKit auth params:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: `Failed to get authentication parameters via GET. Please check credentials. Details: ${errorMessage}` },
            { status: 500 }
        );
    }
}
