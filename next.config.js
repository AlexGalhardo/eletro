/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,

  turbopack: {
    root: __dirname,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  allowedDevOrigins: ["192.168.15.33"],

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    qualities: [75, 85, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eletroradar",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.eletroradar",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },

  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*\\.(jpg|jpeg|png|gif|webp|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*\\.(woff|woff2|ttf|eot|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*\\.(mp4|webm|ogg|mp3|wav)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
