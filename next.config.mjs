/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scorelabapp.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i1.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i2.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i3.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i4.ytimg.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
