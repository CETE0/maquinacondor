# Correcciones para el Despliegue en Vercel

Este documento explica las correcciones aplicadas para resolver errores de compilación en Vercel.

## ✅ Cambios Aplicados

### 1. Eliminación de `node-fetch`
- **Problema**: `node-fetch` no es necesario en Next.js 14 (tiene fetch nativo)
- **Solución**: Eliminado de `package.json` y sus tipos
- **Archivo modificado**: `package.json`

### 2. Configuración de Cheerio
- **Problema**: Cheerio puede causar problemas en el build de Next.js
- **Solución**: Agregado como `serverComponentsExternalPackages` en `next.config.js`
- **Archivo modificado**: `next.config.js`

### 3. Tipos de Cheerio
- **Problema**: Faltaban tipos para cheerio
- **Solución**: Agregado `@types/cheerio` en devDependencies
- **Archivo modificado**: `package.json`

## 🔍 Si Aún Hay Errores

### Verificar el Error Completo
El mensaje que compartiste se cortó. Necesito ver el error completo. Puedes:

1. **En Vercel Dashboard**:
   - Ve a tu proyecto
   - Click en "Deployments"
   - Click en el deployment fallido
   - Copia el error completo del build log

2. **Errores Comunes y Soluciones**:

#### Error: "Cannot find module '@/lib/...'"
**Solución**: Verifica que `tsconfig.json` tenga:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### Error: "Module not found: Can't resolve 'cheerio'"
**Solución**: 
```bash
npm install cheerio
```

#### Error: TypeScript errors
**Solución**: Ejecuta localmente:
```bash
npm run build
```
Esto te mostrará los errores de TypeScript antes de desplegar.

#### Error: "AbortSignal.timeout is not a function"
**Solución**: `AbortSignal.timeout` puede no estar disponible en Node.js 18. Cambiar a:

```typescript
// En lib/scraper.ts, reemplazar:
signal: AbortSignal.timeout(10000)

// Por:
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 10000)
signal: controller.signal
// Y limpiar: clearTimeout(timeoutId) después del fetch
```

## 🧪 Probar Localmente Antes de Desplegar

```bash
# Instalar dependencias actualizadas
npm install

# Probar el build localmente
npm run build

# Si el build funciona localmente, debería funcionar en Vercel
```

## 📝 Checklist Pre-Deploy

Antes de hacer push a GitHub:

- [ ] `npm install` se ejecuta sin errores
- [ ] `npm run build` se ejecuta sin errores
- [ ] `npm run lint` pasa sin errores críticos
- [ ] Variables de entorno están configuradas en Vercel
- [ ] `.env.local` está en `.gitignore`

## 🚀 Desplegar Nuevamente

1. **Commit y push los cambios**:
```bash
git add .
git commit -m "Fix: Remove node-fetch, configure cheerio"
git push origin main
```

2. **Vercel se desplegará automáticamente**

3. **Revisa los logs** en Vercel Dashboard si hay errores

## 📞 Si Necesitas Ayuda

Comparte el error completo del build log de Vercel y podré ayudarte mejor. Los errores típicos incluyen:
- Mensajes de TypeScript
- Errores de módulos no encontrados
- Errores de tipos
- Problemas con paths/imports

