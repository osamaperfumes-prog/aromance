import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    buildActivity: false,
  },
  // When running inside Cloud Workstations, the preview is served from a different
  // origin. This is a security measure to prevent issues like XSS.
  // We need to explicitly allow this origin to connect to the dev server.
  // For more details, see: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  ...(process.env.GITPOD_WORKSPACE_URL && {
    experimental: {
      allowedDevOrigins: [
        new URL(process.env.GITPOD_WORKSPACE_URL).hostname.replace(
          /^\d+/,
          '6000'
        ),
      ],
    },
  }),
};

export default nextConfig;
