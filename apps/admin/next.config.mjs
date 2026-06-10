/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@exlege/types'],
  output: 'standalone',
};

export default nextConfig;
