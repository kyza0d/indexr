/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["cloudflare-ipfs.com", "avatars.githubusercontent.com"], // Add any other domains you need here
  },
};

module.exports = nextConfig;
