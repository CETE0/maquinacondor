# Solución de Problemas de Despliegue en Vercel

## Error 404 después del despliegue

Si obtienes un error 404 después de que el build sea exitoso, verifica lo siguiente:

### 1. Verificar configuración del proyecto en Vercel Dashboard

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** > **General**
3. Verifica que:
   - **Framework Preset** esté configurado como "Next.js"
   - **Root Directory** esté vacío o sea `.`
   - **Build Command** sea `npm run build` (o deja en blanco para auto-detección)
   - **Output Directory** esté vacío

### 2. Re-desplegar el proyecto

1. En Vercel Dashboard, ve a **Deployments**
2. Click en los **3 puntos** del último deployment
3. Selecciona **Redeploy**
4. Marca "Use existing Build Cache" como **desmarcado**
5. Click en **Redeploy**

### 3. Verificar que el archivo `app/page.tsx` existe

El archivo debe estar en:
```
app/page.tsx  (para Next.js App Router)
```

### 4. Verificar logs del deployment

1. En Vercel Dashboard, ve al deployment que falla
2. Revisa los **Build Logs** para ver si hay errores
3. Revisa los **Function Logs** si el error ocurre en runtime

### 5. Si el problema persiste

Intenta crear un nuevo proyecto:

1. En Vercel Dashboard, crea un nuevo proyecto
2. Conecta el mismo repositorio
3. Asegúrate de seleccionar **Next.js** como framework
4. Configura las variables de entorno si es necesario

### 6. Verificar que la URL sea correcta

La URL de Vercel debería ser algo como:
```
https://tu-proyecto.vercel.app/
```

No debería tener rutas adicionales como `/app` o similares.

## Configuración recomendada en Vercel

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (o auto-detect)
- **Output Directory**: (dejar vacío)
- **Install Command**: `npm install` (o auto-detect)
- **Development Command**: `npm run dev`

## Archivos importantes

Asegúrate de que estos archivos existan:
- ✅ `package.json`
- ✅ `next.config.js`
- ✅ `app/page.tsx` (o `pages/index.tsx` para Pages Router)
- ✅ `app/layout.tsx` (o `pages/_app.tsx` para Pages Router)
- ✅ `tsconfig.json`
- ✅ `vercel.json` (opcional, pero recomendado para cron jobs)

