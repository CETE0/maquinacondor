# Máquina Condoro

Instalación web de net art que combina web scraping, procesamiento de datos y generación automática de poemas inspirados en Nicanor Parra.

## 📚 Documentación

- **[Guía Completa de Configuración del Backend](./BACKEND_SETUP.md)** - Todo lo que necesitas saber para configurar el backend

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Crear archivo .env.local
echo "CRON_SECRET=$(openssl rand -hex 32)" > .env.local

# Desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📖 Para más detalles

Consulta [BACKEND_SETUP.md](./BACKEND_SETUP.md) para:
- Configuración completa del backend
- Variables de entorno
- Migración a Supabase
- Configuración de cron jobs
- Testing de APIs
