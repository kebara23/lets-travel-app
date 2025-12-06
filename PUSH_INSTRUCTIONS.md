# 🚀 Instrucciones para Hacer Push a GitHub

## ✅ Estado Actual

- ✅ Git inicializado correctamente
- ✅ Commit inicial creado (94 archivos)
- ✅ Remote configurado: `https://github.com/kebara23/lets-travel-app.git`
- ✅ Credential helper configurado

## 🔐 Autenticación Requerida

GitHub ya no acepta contraseñas para HTTPS. Necesitas un **Personal Access Token**.

### Paso 1: Crear Personal Access Token

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Configura:
   - **Note**: "LETS App Development"
   - **Expiration**: Elige una duración (90 días recomendado)
   - **Scopes**: Marca **`repo`** (esto da acceso completo a repositorios)
4. Click en **"Generate token"**
5. **⚠️ IMPORTANTE**: Copia el token inmediatamente (solo se muestra una vez)
   - Ejemplo: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Paso 2: Hacer Push

Ejecuta en tu terminal:

```bash
cd "/Users/Kebara/Desktop/Lets-App & Web/Lets-App-2.0"
git push -u origin main
```

Cuando te pida credenciales:
- **Username**: `kebara23`
- **Password**: Pega tu Personal Access Token (no tu contraseña de GitHub)

### Paso 3: Guardar Credenciales (Opcional)

Si quieres que macOS guarde el token:

```bash
# Ya está configurado, pero si necesitas verificar:
git config --global credential.helper osxkeychain
```

La próxima vez que hagas push, macOS usará el token guardado.

## 🔄 Alternativa: GitHub CLI

Si prefieres usar GitHub CLI:

```bash
# Instalar GitHub CLI (si no lo tienes)
brew install gh

# Autenticarse
gh auth login

# Hacer push
git push -u origin main
```

## ✅ Verificación

Después del push, verifica en:
https://github.com/kebara23/lets-travel-app

Deberías ver todos tus archivos subidos.

## 🆘 Problemas Comunes

### Error: "Authentication failed"
- Verifica que el token tenga el scope `repo`
- Asegúrate de copiar el token completo (empieza con `ghp_`)

### Error: "Repository not found"
- Verifica que el repositorio existe en GitHub
- Verifica que tienes permisos de escritura

### Error: "Permission denied"
- El token necesita el scope `repo`
- Regenera el token si es necesario

## 📝 Notas de Seguridad

- ⚠️ **NUNCA** subas el token a GitHub
- ⚠️ **NUNCA** compartas el token públicamente
- ✅ El token está guardado de forma segura en macOS Keychain
- ✅ Puedes revocar el token en cualquier momento desde GitHub Settings

