#!/usr/bin/env node

/**
 * Script para generar o actualizar el archivo JSON con datos de condores
 * Ejecutar con: node scripts/generate-data.js
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'condor-data.json');

// Datos de ejemplo - puedes modificar estos datos o cargarlos desde otra fuente
const sampleData = [
  {
    id: "data-001",
    timestamp: new Date().toISOString(),
    source: "SAG",
    data_type: "census",
    content: {
      message: "Censo oficial de cóndores andinos",
      count: 150,
      region: "Región Metropolitana"
    },
    status: "success",
    metadata: {
      url: "https://www.sag.gob.cl",
      response_time: 1200,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: "data-002",
    timestamp: new Date().toISOString(),
    source: "CONAF",
    data_type: "census",
    content: {
      message: "Monitoreo de cóndores en áreas protegidas",
      count: 85,
      location: "Parque Nacional Lauca"
    },
    status: "success",
    metadata: {
      url: "https://www.conaf.cl",
      response_time: 980,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: "data-003",
    timestamp: new Date().toISOString(),
    source: "La Tercera",
    data_type: "news",
    content: {
      articles: [
        {
          title: "Cóndor envenenado encontrado en cordillera",
          date: new Date().toISOString().split('T')[0]
        }
      ]
    },
    status: "success",
    metadata: {
      url: "https://www.latercera.com",
      response_time: 1500,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: "data-004",
    timestamp: new Date().toISOString(),
    source: "Emol",
    data_type: "news",
    content: {
      articles: [
        {
          title: "Protección de cóndores: nueva ley en trámite",
          date: new Date().toISOString().split('T')[0]
        }
      ]
    },
    status: "success",
    metadata: {
      url: "https://www.emol.com",
      response_time: 1100,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: "data-005",
    timestamp: new Date().toISOString(),
    source: "El Mercurio",
    data_type: "news",
    content: null,
    status: "partial",
    error_type: "no_data",
    metadata: {
      url: "https://www.emol.com",
      response_time: 2000,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: "data-006",
    timestamp: new Date().toISOString(),
    source: "Cooperativa",
    data_type: "error",
    content: null,
    status: "failed",
    error_type: "404",
    metadata: {
      url: "https://www.cooperativa.cl",
      response_time: 500,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: "data-007",
    timestamp: new Date().toISOString(),
    source: "BioBio",
    data_type: "news",
    content: {
      articles: [
        {
          title: "Muerte de cóndor reportada en zona agrícola",
          date: new Date().toISOString().split('T')[0]
        }
      ]
    },
    status: "success",
    metadata: {
      url: "https://www.biobiochile.cl",
      response_time: 1300,
      timestamp: new Date().toISOString()
    }
  }
];

// Crear directorio si no existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Escribir el JSON
fs.writeFileSync(dataFile, JSON.stringify(sampleData, null, 2), 'utf8');

console.log(`✅ Datos generados exitosamente en: ${dataFile}`);
console.log(`📊 Total de registros: ${sampleData.length}`);

