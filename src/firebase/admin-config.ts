// This file is for server-side use only.
import admin from 'firebase-admin';
import 'dotenv/config';

// Ensure you have the necessary environment variables set in your .env file
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const databaseURL = process.env.FIREBASE_DATABASE_URL;

/**
 * Gets the initialized Firebase Admin app.
 * Creates a new one if it doesn't exist.
 */
export function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey || !databaseURL) {
    throw new Error('Firebase Admin SDK credentials are not set in environment variables.');
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    databaseURL: databaseURL,
  });

  return app;
}
