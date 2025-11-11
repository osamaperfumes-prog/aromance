
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/CartContext';
import { FirebaseClientProvider } from '@/firebase';
import { getAdminApp } from '@/firebase/admin-config';
import { siteMetadata as defaultMetadata } from '@/lib/site-metadata';
import type { Metadata } from 'next';


// This function fetches metadata from Firebase on the server.
export async function generateMetadata(): Promise<Metadata> {
  // Only attempt to fetch from Firebase if the necessary env var is present.
  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      const adminDb = (await getAdminApp()).database();
      const metadataRef = adminDb.ref('settings/siteMetadata');
      const snapshot = await metadataRef.once('value');
      const metadata = snapshot.val();

      if (metadata && metadata.title && metadata.description) {
        return {
          title: metadata.title,
          description: metadata.description,
        };
      }
    } catch (error) {
      console.error("Failed to fetch dynamic metadata, falling back to default:", error);
      // Fallback to default metadata if Firebase fetch fails
      return defaultMetadata;
    }
  }
  
  // Fallback if env var is not set or data is not present in DB
  return defaultMetadata;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='hsl(210 100% 12.5%)'%3e%3cpath d='M16 7.5V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2.5a.5.5 0 00.5.5h3a.5.5 0 00.5-.5z' /%3e%3cpath fill-rule='evenodd' d='M11 9H7a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3v-6a3 3 0 00-3-3h-4zm-2 2a1 1 0 100 2h8a1 1 0 100-2H9z' clip-rule='evenodd' /%3e%3c/svg%3e" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
