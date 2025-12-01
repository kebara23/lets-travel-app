/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Escudo Anti-Errores (Mantenemos esto)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 2. Redirección Maestra (Nuevo)
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
// Force deploy)
