# PWA Icons Setup

## Required Icons

Para que la PWA funcione correctamente, necesitas crear dos iconos en esta carpeta:

### 1. `icon-192.png` (192x192 pixels)
- Tamaño: 192x192 píxeles
- Formato: PNG con transparencia
- Uso: Icono estándar para Android y iOS

### 2. `icon-512.png` (512x512 pixels)
- Tamaño: 512x512 píxeles
- Formato: PNG con transparencia
- Uso: Icono de alta resolución para Android

## Cómo Crear los Iconos

### Opción 1: Herramientas Online (Recomendado)
1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
   - Sube un logo o imagen
   - Genera automáticamente todos los tamaños necesarios
   - Descarga los archivos `icon-192.png` e `icon-512.png`

2. **RealFaviconGenerator**: https://realfavicongenerator.net/
   - Genera iconos para múltiples plataformas
   - Incluye PWA icons

### Opción 2: Diseño Manual
1. Crea un diseño cuadrado (recomendado: logo centrado con fondo sólido o transparente)
2. Exporta en 512x512 píxeles
3. Redimensiona a 192x192 para el icono pequeño
4. Guarda ambos como PNG

### Opción 3: Script de Generación (Si tienes un logo base)
Si tienes un archivo `logo.png` o `logo.svg` en la raíz del proyecto, puedes usar ImageMagick:

```bash
# Instalar ImageMagick (si no lo tienes)
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Generar iconos desde un logo base
convert logo.png -resize 192x192 public/icons/icon-192.png
convert logo.png -resize 512x512 public/icons/icon-512.png
```

## Colores Sugeridos
- **Fondo**: #F5EFE6 (beige claro) o transparente
- **Tema**: #1B4734 (verde oscuro - color principal de LETS)

## Verificación
Una vez creados los iconos, verifica que:
- ✅ Los archivos existen en `public/icons/`
- ✅ `icon-192.png` es exactamente 192x192 píxeles
- ✅ `icon-512.png` es exactamente 512x512 píxeles
- ✅ Ambos son archivos PNG válidos

## Testing
1. Abre la app en Chrome/Edge (Android) o Safari (iOS)
2. Busca la opción "Agregar a pantalla de inicio" o "Add to Home Screen"
3. Verifica que el icono aparece correctamente

