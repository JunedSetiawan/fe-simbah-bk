import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: true,      // Enable React strict mode for improved error handling
    swcMinify: true,            // Enable SWC minification for improved performance
    transpilePackages: ["@refinedev/antd"],
    compiler: {
        removeConsole: process.env.NODE_ENV !== "development"     // Remove console.log in production
    },
    async rewrites() {
            return [
                {
                    source: '/api/:path*',
                    destination: `${process.env.BACKEND_API_URL}/:path*`,
                },
            ];
        },
};

export default withPWA({
    dest: "public",         // destination directory for the PWA files
    disable: process.env.NODE_ENV === "development",        // disable PWA in the development environment
    register: true,         // register the PWA service worker
    skipWaiting: true,      // skip waiting for service worker activation
})(nextConfig);