import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: true,      // Enable React strict mode for improved error handling
    swcMinify: true,            // Enable SWC minification for improved performance
    transpilePackages: ["@refinedev/antd"],
    compiler: {
        removeConsole: process.env.NODE_ENV !== "development"     // Remove console.log in production
    },
    // Add headers configuration
//    async headers() {
//     return [
//         {
//             source: '/:path*',
//             headers: [
//                 {
//                     key: 'Content-Security-Policy',
//                     // Using a different directive that allows mixed content
//                     value: 'block-all-mixed-content',
//                 },
//             ],
//         },
//     ];
// },
 async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://45.13.132.248:8080/api/:path*',
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