# 🚀 LETS 2.0 - Instrucciones de Instalación

## 📦 Repositorio GitHub

**Link del Repositorio:** https://github.com/kebara23/lets-travel-app

## ✅ Estado del Repositorio

- ✅ **Commits**: 2 commits iniciales
- ✅ **Archivos**: 95 archivos listos
- ✅ **Branch**: `main`
- ✅ **PWA**: Configurada y lista
- ✅ **Seguridad**: Archivos sensibles protegidos

## 🔧 Instalación Local

### Prerrequisitos

- Node.js 18+ instalado
- npm o yarn
- Cuenta de Supabase (para variables de entorno)

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/kebara23/lets-travel-app.git
cd lets-travel-app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crea un archivo .env.local con:
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima

# 4. Ejecutar en desarrollo
npm run dev

# 5. Abrir en el navegador
# http://localhost:3000
```

## 📱 Instalación como PWA

### En Android (Chrome)

1. Abre la app en Chrome
2. Menú (3 puntos) → "Agregar a pantalla de inicio"
3. La app se instalará como aplicación nativa

### En iOS (Safari)

1. Abre la app en Safari
2. Compartir (botón cuadrado con flecha) → "Agregar a pantalla de inicio"
3. La app aparecerá en tu pantalla de inicio

## 🔐 Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

**Obtén estas credenciales desde:**
- Supabase Dashboard → Settings → API

## 📋 Scripts Disponibles

```bash
npm run dev      # Desarrollo (localhost:3000)
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

## 🎯 Características Principales

- ✅ **PWA Completa**: Instalable en iOS y Android
- ✅ **Dashboard Cliente**: Gestión de viajes y itinerarios
- ✅ **Panel Admin**: Gestión completa de viajes y clientes
- ✅ **Mensajería en Tiempo Real**: Concierge integrado
- ✅ **Tracking de Ubicación**: GPS en tiempo real
- ✅ **SOS Center**: Sistema de emergencias
- ✅ **Explore Posts**: Contenido y experiencias
- ✅ **Notificaciones**: Sistema completo de alertas

## 📚 Documentación Adicional

- `README.md` - Documentación principal
- `GITHUB_SETUP.md` - Guía de configuración de GitHub
- `PUSH_INSTRUCTIONS.md` - Instrucciones para hacer push
- `LETS_2.0_MASTER_TECHNICAL_DOCUMENTATION.md` - Documentación técnica completa

## 🆘 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que `.env.local` existe
- Verifica que las variables tienen el prefijo `NEXT_PUBLIC_`

### Error: "Module not found"
- Ejecuta `npm install` nuevamente
- Elimina `node_modules` y `package-lock.json`, luego `npm install`

### PWA no se instala
- Verifica que los iconos existen en `public/icons/`
- Verifica que `manifest.json` está en `public/`
- Abre en HTTPS (requerido para PWA)

## 🔗 Links Útiles

- **Repositorio**: https://github.com/kebara23/lets-travel-app
- **Supabase**: https://supabase.com
- **Next.js Docs**: https://nextjs.org/docs
- **PWA Builder**: https://www.pwabuilder.com

---

**¡Listo para desarrollar! 🚀**

