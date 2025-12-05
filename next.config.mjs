/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Escudo Anti-Errores (Mantenemos esto)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 2. Permitir imágenes de dominios externos (Supabase, etc.)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Permitir todas las fuentes por ahora para evitar bloqueos
      },
    ],
  },

  // 3. Redirección Maestra
  // Esto dice: "Si alguien entra a la raíz (/), mándalo a /login inmediatamente"
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
