/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server external packages for Prisma
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
