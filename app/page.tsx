'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Cube from './components/Cube'
import { generatePoemsForCubes, type CondorData } from '@/lib/poem-generator-client'

interface CubeData {
  id: string
  content: string
  verses?: string[]
}

export default function Home() {
  const [isGrid, setIsGrid] = useState(false)
  const [cubesData, setCubesData] = useState<CubeData[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [animatedTextLines, setAnimatedTextLines] = useState<Array<{text: string, delay: number, startX: number, startY: number, duration: number, opacity: number}>>([])
  const [isInput, setIsInput] = useState(true)
  const [rawData, setRawData] = useState<CondorData[]>([])
  const [gyroEnabled, setGyroEnabled] = useState(false)
  const [deviceOrientation, setDeviceOrientation] = useState<{ beta: number; gamma: number } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const textIndexRef = useRef(0)

  const textLines = [
    '╔════════════════════╗',
    '║                    ║',
    '║ CONDORO            ║',
    '║                    ║',
    '║ RECLAMADO          ║',
    '║ POR                ║',
    '║ CETEO 2025         ║',
    '║                    ║',
    '╚════════════════════╝'
  ]

  // Detectar dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                             (window.innerWidth <= 768 && 'ontouchstart' in window)
      setIsMobile(isMobileDevice)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Manejar device orientation (giroscopio)
  useEffect(() => {
    if (!gyroEnabled || !isGrid) return

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        setDeviceOrientation({
          beta: e.beta,
          gamma: e.gamma
        })
      }
    }

    window.addEventListener('deviceorientation', handleOrientation as EventListener)
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation as EventListener)
    }
  }, [gyroEnabled, isGrid])

  // Fetch datos de APIs cuando no está en grid (para animación)
  useEffect(() => {
    if (!isGrid) {
      startTextAnimation()
    } else {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current)
        animationIntervalRef.current = null
      }
      if (cubesData.length === 0) {
        fetchCubesData()
      }
    }
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGrid])

  // Fetch datos crudos del JSON estático
  const fetchRawData = async () => {
    try {
      const response = await fetch('/api/cubes-data')
      if (response.ok) {
        const data = await response.json()
        setRawData(data)
      }
    } catch (error) {
      console.error('Error fetching raw data:', error)
    }
  }

  // Iniciar animación de texto - generar cientos de líneas repetidas
  const startTextAnimation = async () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current)
    }

    // Obtener datos crudos y generados para mostrar
    await fetchRawData()
    await fetchCubesData()
    
    // Generar conjunto inicial de líneas
    generateTextLines()
    
    // Actualizar líneas periódicamente
    animationIntervalRef.current = setInterval(() => {
      generateTextLines()
    }, 2000) // Actualizar cada 2 segundos
  }

  // Generar un texto absurdo basado en Nicanor Parra y condores
  const generateAbsurdCondorText = (): string => {
    // Fragmentos específicos sobre condores y cóndoros
    const condorNouns = ['cóndor', 'cóndoro', 'cóndor muerto', 'cóndor vivo', 'cóndor ausente', 'cóndor envenenado', 'cóndor protegido', 'cóndor contado', 'cóndor reclamado']
    const condorVerbs = ['vuela', 'cae', 'muere', 'desaparece', 'reclama', 'cuenta', 'miente', 'existe', 'no existe', 'se agota', 'grita sin eco']
    const condorAdjectives = ['muerto', 'vivo', 'envenenado', 'protegido', 'contado', 'reclamado', 'ausente', 'silencioso', 'oficial', 'no oficial']
    const parraPhrases = [
      'Como el cóndor',
      'El cóndor dice',
      'El cóndor calla',
      'Cuentan el cóndor',
      'El cóndor no existe',
      'El cóndor existe',
      'Todos mienten sobre el cóndor',
      'Nadie sabe del cóndor',
      'El cóndor se agota',
      'El cóndor reclama',
      'El cóndoro cuenta',
      'El cóndoro miente',
      'Reclaman el cóndor',
      'Protegen el cóndor',
      'Matan el cóndor',
      'El cóndor vale',
      'El cóndor no vale',
      'Miden el cóndor',
      'No miden el cóndor',
      'El cóndor es número',
      'El cóndor no es número'
    ]
    
    // Patrones de generación absurda
    const patterns = [
      () => `${randomElement(parraPhrases)} ${randomElement(condorVerbs)}`,
      () => `${randomElement(condorNouns)} ${randomElement(condorVerbs)}`,
      () => `${randomElement(condorAdjectives)} ${randomElement(condorNouns)}`,
      () => `${randomElement(parraPhrases)} Y ${randomElement(condorNouns)}`,
      () => `${randomElement(condorNouns)} ${randomElement(parraPhrases)}`,
      () => `NO ${randomElement(condorNouns)} ${randomElement(condorVerbs)}`,
      () => `${randomElement(parraPhrases)} PERO ${randomElement(condorNouns)} ${randomElement(condorVerbs)}`,
      () => `${randomElement(condorVerbs)} ${randomElement(condorNouns)} ${randomElement(condorAdjectives)}`,
      () => `${randomElement(condorNouns)} ${randomElement(condorVerbs)} ${randomElement(condorNouns)}`,
      () => `${randomElement(parraPhrases)} | ${randomElement(parraPhrases)}`,
      () => `CÓNDORO ${randomElement(condorVerbs)} ${randomElement(condorNouns)}`,
      () => `${randomElement(condorNouns)} RECLAMADO ${randomElement(condorVerbs)}`,
      () => `${randomElement(condorNouns)} | ${randomElement(condorNouns)} | ${randomElement(condorNouns)}`,
      () => `${randomElement(parraPhrases).toUpperCase()} ${randomElement(condorNouns).toLowerCase()}`,
      () => `${randomElement(condorNouns)} ${randomElement(condorVerbs)} ${randomElement(condorNouns)} ${randomElement(condorVerbs)}`,
    ]
    
    let text = randomElement(patterns)()
    
    // Aplicar transformaciones absurdas adicionales
    if (Math.random() > 0.6) {
      const chaos = Math.random()
      if (chaos > 0.9) {
        // Invertir palabras
        text = text.split(' ').reverse().join(' ')
      } else if (chaos > 0.8) {
        // Duplicar palabra aleatoria
        const words = text.split(' ')
        if (words.length > 0) {
          const randomWord = randomElement(words)
          words.push(randomWord)
          text = words.join(' ')
        }
      } else if (chaos > 0.7) {
        // Mezclar mayúsculas/minúsculas
        text = text.split('').map(char => Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()).join('')
      } else if (chaos > 0.65) {
        // Agregar espacios aleatorios
        text = text.split('').join(' ' + (Math.random() > 0.7 ? ' ' : ''))
      }
    }
    
    // Agregar puntuación absurda
    const punctuation = ['', '', '', '.', '...', '!', '?', ' | ', ' ||| ', ' || ']
    text += randomElement(punctuation)
    
    return text.trim().toUpperCase()
  }
  
  const randomElement = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }

  // Generar cientos de líneas de texto para el fondo
  const generateTextLines = () => {
    const numLines = 300 // Cientos de líneas
    const lines: Array<{text: string, delay: number, startX: number, startY: number, duration: number, opacity: number}> = []
    
    // Generar todas las líneas con textos absurdos sobre condores
    for (let i = 0; i < numLines; i++) {
      // Generar texto absurdo único para cada línea
      const absurdText = generateAbsurdCondorText()
      
      // Generar propiedades de animación únicas para cada línea
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 1000 // hasta 1000px desde el centro
      lines.push({
        text: absurdText,
        delay: (i * 0.1) % 10,
        startX: Math.cos(angle) * distance, // Posición inicial X
        startY: Math.sin(angle) * distance, // Posición inicial Y
        duration: 5 + Math.random() * 10, // 5 a 15 segundos
        opacity: 0.1 + Math.random() * 0.3 // 0.1 a 0.4
      })
    }
    
    setAnimatedTextLines(lines)
  }

  // Parsear datos crudos para mostrar en animación
  const parseRawData = (data: CondorData): string => {
    if (!data) return 'Sin datos'
    
    try {
      if (data.content && typeof data.content === 'object') {
        const contentStr = JSON.stringify(data.content)
        return `${data.source || 'N/A'} | ${data.data_type || 'N/A'} | ${contentStr.substring(0, 50)}...`
      }
      return `${data.source || 'N/A'} | ${data.data_type || 'N/A'} | ${data.status || 'N/A'}`
    } catch {
      return `${data.source || 'Fuente'} | ${data.status || 'N/A'}`
    }
  }


  // Track mouse position para orientación de cubos
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mainRef.current) {
        const rect = mainRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }

    if (isGrid) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isGrid])

  const fetchCubesData = async () => {
    try {
      // Obtener datos crudos del JSON
      const response = await fetch('/api/cubes-data?raw=true')
      if (response.ok) {
        const rawData: CondorData[] = await response.json()
        
        // Generar poemas en el cliente usando los algoritmos
        const generatedPoems = generatePoemsForCubes(rawData)
        setCubesData(generatedPoems)
      } else {
        // Si no hay datos, generar cubos con placeholder
        generatePlaceholderCubes()
      }
    } catch (error) {
      console.error('Error fetching cubes data:', error)
      generatePlaceholderCubes()
    }
  }

  const generatePlaceholderCubes = () => {
    const cubesPerShelf = 4
    const numberOfShelves = 4
    const totalCubes = cubesPerShelf * numberOfShelves
    const placeholderData: CubeData[] = Array.from({ length: totalCubes }).map((_, index) => ({
      id: `cube-${index}`,
      content: `Cubo ${index + 1}\nCargando datos...`
    }))
    setCubesData(placeholderData)
  }

  const renderTextContent = (content?: string) => {
    const lines = content ? content.split('\n') : textLines
    return lines.map((line, index) => {
      if (line.includes('CETEO 2025')) {
        const parts = line.split('CETEO 2025')
        return (
          <span key={index}>
            {parts[0]}
            <Link 
              href="https://ceteo.cl" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: '#D92534', textDecoration: 'none' }}
            >
              CETEO 2025
            </Link>
            {parts[1]}
            {'\n'}
          </span>
        )
      }
      if (line.includes('CONDORO')) {
        const parts = line.split('CONDORO')
        return (
          <span key={index}>
            {parts[0]}
            <span style={{ color: '#D92534' }}>CONDORO</span>
            {parts[1]}
            {'\n'}
          </span>
        )
      }
      if (line.includes('RECLAMADO')) {
        // RECLAMADO debe ser blanco, no rojo
        return <span key={index}>{line}{'\n'}</span>
      }
      return <span key={index}>{line}{'\n'}</span>
    })
  }

  // Manejar click/tap para solicitar permisos de giroscopio en móviles
  const handleMainClick = async () => {
    if (!isGrid && isMobile && !gyroEnabled) {
      // Solicitar permisos de dispositivo orientación
      try {
        // @ts-ignore - Permisos API puede no estar disponible en todos los navegadores
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          const permission = await (DeviceOrientationEvent as any).requestPermission()
          if (permission === 'granted') {
            setGyroEnabled(true)
            setIsGrid(true)
          } else {
            // Si se niega, aún permitir entrar a la grilla sin giroscopio
            setIsGrid(true)
          }
        } else {
          // Para navegadores que no requieren permisos explícitos
          setGyroEnabled(true)
          setIsGrid(true)
        }
      } catch (error) {
        console.error('Error solicitando permisos de giroscopio:', error)
        // Si hay error, aún permitir entrar a la grilla
        setIsGrid(true)
      }
    } else {
      setIsGrid(!isGrid)
    }
  }

  const cubesPerShelf = 4
  const numberOfShelves = 4

  return (
    <main 
      ref={mainRef}
      onClick={handleMainClick} 
      style={{ 
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: isGrid ? 'flex-start' : 'center',
        justifyContent: 'center',
        paddingTop: isGrid ? '2rem' : '0'
      }}
    >
      {!isGrid ? (
        <div className="text-box-container">
          {/* Capas de texto de fondo */}
          <div className="background-text-layers">
            {animatedTextLines.map((line, index) => (
              <div
                key={index}
                className="background-text-line"
                style={{
                  '--delay': `${line.delay}s`,
                  '--start-x': `${line.startX}px`,
                  '--start-y': `${line.startY}px`,
                  '--duration': `${line.duration}s`,
                  '--opacity': `${line.opacity}`
                } as React.CSSProperties}
              >
                {line.text}
              </div>
            ))}
          </div>
          
          {/* Cuadro principal centrado */}
          <div className="text-box-container-rotating">
            <div className="text-box-border"></div>
            <div className="text-box-content">
              <pre>{renderTextContent()}</pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="rack-container">
          {Array.from({ length: numberOfShelves }).map((_, shelfIndex) => (
            <div key={shelfIndex} className="shelf">
              {Array.from({ length: cubesPerShelf }).map((_, cubeIndex) => {
                const globalIndex = shelfIndex * cubesPerShelf + cubeIndex
                const cubeData = cubesData[globalIndex] || { id: `cube-${globalIndex}`, content: '' }
                return (
                  <Cube
                    key={cubeIndex}
                    cubeData={cubeData}
                    cubeIndex={globalIndex}
                    mousePosition={mousePosition}
                    renderTextContent={renderTextContent}
                    gyroEnabled={gyroEnabled}
                    deviceOrientation={deviceOrientation}
                  />
                )
              })}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

