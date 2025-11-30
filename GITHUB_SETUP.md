# 🚀 Guía para Subir el Repositorio a GitHub

## ✅ Checklist Pre-Subida

### 1. Verificar Archivos Críticos

- [x] `.gitignore` configurado correctamente
- [x] `README.md` actualizado
- [x] `package.json` con información correcta
- [ ] `.env.local` **NO debe subirse** (ya está en .gitignore)
- [ ] Iconos PWA creados en `public/icons/` (opcional, pero recomendado)

### 2. Variables de Entorno

**IMPORTANTE**: El archivo `.env.local` contiene credenciales sensibles y **NO debe subirse a GitHub**.

Si necesitas compartir las variables con tu equipo, crea un archivo `.env.example`:
```bash
# .env.example (este SÍ se puede subir)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📋 Pasos para Subir a GitHub

### Paso 1: Inicializar Git (si no está inicializado)

```bash
cd "/Users/Kebara/Desktop/Lets-App & Web/Lets-App-2.0"
git init
```

### Paso 2: Verificar que .gitignore esté funcionando

```bash
# Verificar que .env.local NO aparece en los archivos a subir
git status
```

Si ves `.env.local` en la lista, verifica que esté en `.gitignore`.

### Paso 3: Agregar todos los archivos

```bash
git add .
```

### Paso 4: Verificar qué se va a subir (recomendado)

```bash
# Ver todos los archivos que se van a commitear
git status

# Ver archivos específicos que NO deberían estar
git status | grep -E "\.env|node_modules|\.next"
```

**Si ves `.env.local`, `node_modules`, o `.next` en la lista, DETENTE y verifica el `.gitignore`.**

### Paso 5: Crear el primer commit

```bash
git commit -m "Initial commit: LETS 2.0 - Luxury Travel Companion PWA"
```

### Paso 6: Crear repositorio en GitHub

1. Ve a [GitHub.com](https://github.com)
2. Click en "New repository" (o el botón "+" → "New repository")
3. Nombre sugerido: `lets-app-2.0` o `lets-travel-companion`
4. **NO inicialices con README, .gitignore, o licencia** (ya los tienes)
5. Click en "Create repository"

### Paso 7: Conectar repositorio local con GitHub

```bash
# Reemplaza USERNAME y REPO_NAME con tus valores
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Verificar que se agregó correctamente
git remote -v
```

### Paso 8: Subir el código

```bash
# Primera vez (establecer upstream)
git push -u origin main

# O si tu rama se llama 'master':
git branch -M main  # Renombrar a main si es necesario
git push -u origin main
```

## 🔒 Seguridad: Verificar que NO se suban secretos

### Antes de hacer push, verifica:

```bash
# Buscar posibles secretos en el código
git log -p | grep -i "supabase\|api.*key\|secret\|password" | head -20

# Verificar que .env.local NO está en el historial
git ls-files | grep "\.env"
```

Si encuentras secretos en el historial:
1. **NO hagas push todavía**
2. Usa `git filter-branch` o `git filter-repo` para limpiar el historial
3. O mejor: crea un nuevo repositorio limpio

## 📝 Comandos Rápidos (Copy-Paste)

```bash
# 1. Inicializar (si es necesario)
cd "/Users/Kebara/Desktop/Lets-App & Web/Lets-App-2.0"
git init

# 2. Agregar archivos
git add .

# 3. Verificar (IMPORTANTE)
git status

# 4. Commit
git commit -m "Initial commit: LETS 2.0 PWA"

# 5. Agregar remote (reemplaza URL)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# 6. Push
git push -u origin main
```

## 🎯 Después de Subir

1. **Agregar descripción en GitHub**: Edita el repositorio y agrega una descripción
2. **Agregar topics/tags**: `pwa`, `nextjs`, `typescript`, `supabase`, `travel-app`
3. **Configurar GitHub Secrets** (si usas CI/CD):
   - Ve a Settings → Secrets and variables → Actions
   - Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Configurar Vercel/Deploy** (opcional):
   - Conecta el repositorio a Vercel
   - Agrega las variables de entorno en el dashboard de Vercel

## ⚠️ Problemas Comunes

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/USERNAME/REPO_NAME.git
```

### Error: "failed to push some refs"
```bash
# Si GitHub tiene archivos que no tienes localmente
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error: "branch 'main' has no upstream branch"
```bash
git push -u origin main
```

## 📚 Recursos

- [GitHub Docs](https://docs.github.com)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

