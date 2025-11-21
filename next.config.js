/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirect to Framer disabled - using local Next.js pages
  // async redirects() {
  //   const framerUrl = process.env.FRAMER_URL || 'https://your-site.framer.website';
  //   return [
  //     {
  //       source: '/',
  //       destination: framerUrl,
  //       permanent: false,
  //     },
  //   ];
  // },
};

module.exports = nextConfig;

