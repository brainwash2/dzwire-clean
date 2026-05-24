import createNextIntlPlugin from 'next-intl/plugin';
import { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "3000-firebase-dzwire-1779209350233.cluster-cbeiita7rbe7iuwhvjs5zww2i4.cloudworkstations.dev",
    "localhost:3000",
    "*.vercel.app"
  ]
};

export default withNextIntl(nextConfig);
