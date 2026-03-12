/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@roadmapper/db",
    "@roadmapper/schemas",
    "@roadmapper/scoring",
    "@roadmapper/prompts",
  ],
}

export default nextConfig
