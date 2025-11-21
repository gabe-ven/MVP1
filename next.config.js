/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Redirect root path to Framer landing page
    // Set FRAMER_URL environment variable (e.g., https://your-site.framer.website)
    const framerUrl = process.env.FRAMER_URL || 'https://your-site.framer.website';
    
    return [
      {
        source: '/',
        destination: framerUrl,
        permanent: false, // Use false for 307 redirect, true for 308 permanent redirect
      },
    ];
  },
};

module.exports = nextConfig;

