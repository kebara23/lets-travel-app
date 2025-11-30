#!/bin/bash

# Script para verificar que el repositorio esté listo para subir a GitHub
# Uso: bash scripts/check-before-push.sh

echo "🔍 Verificando repositorio antes de subir a GitHub..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Verificar que .env.local NO está en git
echo "1. Verificando archivos sensibles..."
if git ls-files | grep -q "\.env\.local"; then
    echo -e "${RED}❌ ERROR: .env.local está siendo rastreado por git!${NC}"
    echo "   Esto es un riesgo de seguridad. Verifica tu .gitignore"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .env.local no está en git${NC}"
fi

# 2. Verificar que node_modules NO está en git
if git ls-files | grep -q "node_modules"; then
    echo -e "${RED}❌ ERROR: node_modules está siendo rastreado!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ node_modules no está en git${NC}"
fi

# 3. Verificar que .next NO está en git
if git ls-files | grep -q "\.next"; then
    echo -e "${RED}❌ ERROR: .next está siendo rastreado!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .next no está en git${NC}"
fi

# 4. Verificar que hay un README.md
echo ""
echo "2. Verificando documentación..."
if [ -f "README.md" ]; then
    echo -e "${GREEN}✅ README.md existe${NC}"
else
    echo -e "${YELLOW}⚠️  README.md no existe${NC}"
fi

# 5. Verificar que hay un .gitignore
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✅ .gitignore existe${NC}"
else
    echo -e "${RED}❌ ERROR: .gitignore no existe!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 6. Verificar que hay un package.json
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json existe${NC}"
else
    echo -e "${RED}❌ ERROR: package.json no existe!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 7. Verificar que hay un manifest.json
echo ""
echo "3. Verificando configuración PWA..."
if [ -f "public/manifest.json" ]; then
    echo -e "${GREEN}✅ manifest.json existe${NC}"
else
    echo -e "${YELLOW}⚠️  manifest.json no existe (PWA no configurada)${NC}"
fi

# 8. Verificar iconos PWA (opcional)
if [ -f "public/icons/icon-192.png" ] && [ -f "public/icons/icon-512.png" ]; then
    echo -e "${GREEN}✅ Iconos PWA existen${NC}"
else
    echo -e "${YELLOW}⚠️  Iconos PWA faltantes (opcional pero recomendado)${NC}"
fi

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Todo listo para subir a GitHub!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. git add ."
    echo "2. git commit -m 'Initial commit'"
    echo "3. git remote add origin https://github.com/USERNAME/REPO.git"
    echo "4. git push -u origin main"
    exit 0
else
    echo -e "${RED}❌ Se encontraron $ERRORS error(es). Corrígelos antes de subir.${NC}"
    exit 1
fi

