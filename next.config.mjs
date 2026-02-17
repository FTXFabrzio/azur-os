import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: false, // FORCE ENABLE ALWAYS FOR DEBUG
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default withSerwist(nextConfig);
