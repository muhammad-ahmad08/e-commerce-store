import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = supabaseUrl ? new URL(supabaseUrl) : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabase ? [{
      protocol: supabase.protocol.replace(":", "") as "http" | "https",
      hostname: supabase.hostname,
      port: supabase.port,
      pathname: "/storage/v1/object/public/product-images/**",
    }] : [],
  },
};

export default nextConfig;
