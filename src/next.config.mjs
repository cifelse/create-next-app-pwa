import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Your Next.js configuration here
};

/** DO NOT TOUCH */
const withSerwist = withSerwistInit({
  swSrc: "sw.ts",
  swDest: "public/sw.js",
});

export default withSerwist(nextConfig);