/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignora errores de estilo en producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora errores de tipos en producción
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
