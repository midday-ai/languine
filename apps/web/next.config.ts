import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/:locale/docs",
        destination: "/:locale/docs/introduction",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX();

export default withNextIntl(withMDX(nextConfig));
