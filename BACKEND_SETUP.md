# Guía de Configuración del Backend

Esta guía explica cómo configurar el backend de Máquina Condoro.

## 📦 1. Instalación Inicial

Primero, instala las dependencias del proyecto:

```bash
npm install
```

Esto instalará:
- **Next.js 14+**: Framework web
- **Cheerio**: Para web scraping (parseo de HTML)
- **node-fetch**: Para hacer requests HTTP
- **@supabase/supabase-js**: Cliente de Supabase (opcional, para base de datos)

## 🔐 2. Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Secret para autenticar cron jobs de Vercel
CRON_SECRET=tu-secret-key-super-seguro-aqui

# Opcional: Si usas Supabase
# SUPABASE_URL=https://tu-proyecto.supabase.co
# SUPABASE_ANON_KEY=tu-anon-key
```

### Generar CRON_SECRET

Puedes generar un secret seguro con:

```bash
# En macOS/Linux
openssl rand -hex 32

# O usar Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🗄️ 3. Sistema de Base de Datos

### Estado Actual: Almacenamiento en Memoria

Por defecto, el sistema usa almacenamiento en memoria (arreglos en JavaScript). Esto significa que:

- ✅ **Funciona de inmediato** sin configuración adicional
- ✅ **Perfecto para desarrollo y pruebas**
- ❌ **Los datos se pierden al reiniciar el servidor**
- ❌ **No funciona entre diferentes instancias de Vercel**

**Ubicación**: `lib/database.ts`

### Migrar a Supabase (Recomendado para Producción)

Para producción, deberías usar Supabase (PostgreSQL). Aquí te explico cómo:

#### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un nuevo proyecto
3. Copia la URL y la Anon Key de Settings > API

#### Paso 2: Crear las Tablas

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Tabla para datos de scraping
CREATE TABLE condor_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  source TEXT NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('census', 'news', 'price', 'weather', 'error')),
  content JSONB,
  error_type TEXT CHECK (error_type IN ('404', '500', 'timeout', 'no_data')),
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  metadata JSONB DEFAULT '{}'
);

-- Tabla para poemas generados
CREATE TABLE generated_poems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verses TEXT[] NOT NULL,
  data_sources TEXT[] DEFAULT '{}',
  trigger_reason TEXT,
  display_until TIMESTAMPTZ
);

-- Índices para mejorar performance
CREATE INDEX idx_condor_data_timestamp ON condor_data(timestamp DESC);
CREATE INDEX idx_condor_data_source ON condor_data(source);
CREATE INDEX idx_poems_created_at ON generated_poems(created_at DESC);
```

#### Paso 3: Actualizar `lib/database.ts`

Reemplaza el contenido con la versión que usa Supabase:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface CondorData {
  id: string
  timestamp: Date
  source: string
  data_type: 'census' | 'news' | 'price' | 'weather' | 'error'
  content: object | null
  error_type?: '404' | '500' | 'timeout' | 'no_data'
  status: 'success' | 'partial' | 'failed'
  metadata: object
}

export interface GeneratedPoem {
  id: string
  created_at: Date
  verses: string[]
  data_sources: string[]
  trigger_reason: string
  display_until: Date
}

export async function getLatestData(): Promise<CondorData[]> {
  const { data, error } = await supabase
    .from('condor_data')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching data:', error)
    return []
  }

  return data.map(item => ({
    ...item,
    timestamp: new Date(item.timestamp),
    metadata: item.metadata || {}
  }))
}

export async function saveCondorData(data: Omit<CondorData, 'id' | 'timestamp'>): Promise<string> {
  const { data: inserted, error } = await supabase
    .from('condor_data')
    .insert({
      source: data.source,
      data_type: data.data_type,
      content: data.content,
      error_type: data.error_type,
      status: data.status,
      metadata: data.metadata
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving data:', error)
    throw error
  }

  return inserted.id
}

export async function saveGeneratedPoem(poem: Omit<GeneratedPoem, 'id' | 'created_at'>): Promise<string> {
  const { data: inserted, error } = await supabase
    .from('generated_poems')
    .insert({
      verses: poem.verses,
      data_sources: poem.data_sources,
      trigger_reason: poem.trigger_reason,
      display_until: poem.display_until.toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving poem:', error)
    throw error
  }

  return inserted.id
}

export async function getLatestPoems(count: number = 16): Promise<GeneratedPoem[]> {
  const { data, error } = await supabase
    .from('generated_poems')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(count)

  if (error) {
    console.error('Error fetching poems:', error)
    return []
  }

  return data.map(item => ({
    ...item,
    created_at: new Date(item.created_at),
    display_until: new Date(item.display_until)
  }))
}
```

## ⏰ 4. Configuración del Cron Job en Vercel

### Localmente (Desarrollo)

Para probar el cron job localmente, puedes crear un script:

```bash
# En package.json, agrega:
"scripts": {
  "cron:test": "curl -X GET http://localhost:3000/api/cron/scrape-daily -H 'Authorization: Bearer tu-secret-aqui'"
}
```

### En Vercel (Producción)

1. **Conecta tu repositorio a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub

2. **Configura la variable de entorno**
   - Ve a Settings > Environment Variables
   - Agrega `CRON_SECRET` con el mismo valor que usaste en `.env.local`
   - Marca "Encrypt" para seguridad

3. **El cron job se activa automáticamente**
   - Vercel detecta `vercel.json` y configura el cron
   - Se ejecuta diariamente a medianoche UTC (configurado en `vercel.json`)
   - Schedule: `0 0 * * *` = todos los días a las 00:00 UTC

4. **Verificar que funciona**
   - Ve a tu dashboard de Vercel
   - Click en "Crons" para ver el historial de ejecuciones
   - Puedes ver logs y estado de cada ejecución

### Cambiar el Horario del Cron

Edita `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape-daily",
      "schedule": "0 0 * * *"  // Formato: minuto hora día mes día-semana
    }
  ]
}
```

Ejemplos:
- `"0 0 * * *"` = Medianoche UTC todos los días
- `"0 6 * * *"` = 6 AM UTC todos los días
- `"0 0 * * 1"` = Medianoche todos los lunes

## 🧪 5. Probar las APIs

### Probar el Endpoint de Scraping Manual

```bash
# Desde terminal
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"source": "SAG"}'
```

O desde el navegador/postman:
- URL: `http://localhost:3000/api/scrape`
- Method: POST
- Body (JSON): `{"source": "SAG"}`

### Probar el Endpoint de Cubos

```bash
curl http://localhost:3000/api/cubes-data
```

O simplemente visita: `http://localhost:3000/api/cubes-data` en tu navegador

### Probar el Cron Job (requiere autenticación)

```bash
curl -X GET http://localhost:3000/api/cron/scrape-daily \
  -H "Authorization: Bearer tu-cron-secret"
```

## 🔍 6. Endpoints Disponibles

### GET `/api/cubes-data`
- **Descripción**: Obtiene los datos de los 16 cubos (poemas generados)
- **Respuesta**: Array de objetos con `id`, `content`, `verses`
- **Uso**: Llamado automáticamente por el frontend cuando se activa la grilla

### POST `/api/scrape`
- **Descripción**: Hace scraping manual de una fuente
- **Body**: `{"source": "SAG" | "CONAF" | "REWILDING" | "MERI"}`
- **Respuesta**: `{success, data, status, error_type}`
- **Uso**: Para probar scraping manual o trigger manual

### GET `/api/cron/scrape-daily`
- **Descripción**: Cron job diario que hace scraping de todas las fuentes y genera poemas
- **Autenticación**: Requiere header `Authorization: Bearer {CRON_SECRET}`
- **Uso**: Llamado automáticamente por Vercel Cron
- **Respuesta**: `{success, data_records, poems_generated, timestamp}`

## 📊 7. Monitoreo y Debugging

### Ver Logs en Desarrollo

```bash
npm run dev
```

Los logs aparecerán en la consola donde corriste `npm run dev`.

### Ver Logs en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en "Functions" o "Crons"
3. Ve al historial de ejecuciones
4. Click en cualquier ejecución para ver logs detallados

### Debugging Local

Puedes agregar logs en cualquier archivo:

```typescript
console.log('Debug info:', data)
console.error('Error:', error)
```

## 🚨 8. Troubleshooting

### El cron job no se ejecuta

1. Verifica que `vercel.json` está en la raíz del proyecto
2. Verifica que `CRON_SECRET` está configurado en Vercel
3. Revisa los logs en Vercel Dashboard
4. Asegúrate de que el proyecto está desplegado

### Los datos no persisten

- Si usas almacenamiento en memoria, los datos se pierden al reiniciar
- **Solución**: Migra a Supabase siguiendo los pasos del punto 3

### Error "Unauthorized" en cron job

- Verifica que `CRON_SECRET` en Vercel coincide con el del código
- Verifica el header de Authorization en el request

### El scraping falla

- Algunos sitios pueden bloquear requests automatizados
- Revisa los logs para ver el error específico
- Los errores se guardan como datos valiosos (filosofía del proyecto)

## 🎯 9. Próximos Pasos

1. **Instalar dependencias**: `npm install`
2. **Configurar `.env.local`**: Agregar `CRON_SECRET`
3. **Probar localmente**: `npm run dev` y probar los endpoints
4. **Desplegar en Vercel**: Push a GitHub y conectar a Vercel
5. **Configurar Supabase** (opcional pero recomendado para producción)
6. **Monitorear**: Revisar logs y resultados del scraping

## 📝 Notas Importantes

- El sistema actual funciona **sin base de datos** para desarrollo rápido
- Los **errores de scraping se guardan como datos valiosos** (filosofía del proyecto)
- El cron job requiere el **CRON_SECRET** para seguridad
- El scraping respeta **rate limiting** y tiene timeout de 10 segundos
- En producción, considera usar **Supabase** para persistencia de datos

