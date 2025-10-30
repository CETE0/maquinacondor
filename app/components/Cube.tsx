'use client'

import { useState, useEffect, useRef } from 'react'

interface CubeProps {
  cubeData: {
    id: string
    content: string
    verses?: string[]
  }
  cubeIndex: number
  mousePosition: { x: number; y: number }
  renderTextContent: (content?: string) => React.ReactNode
}

export default function Cube({ cubeData, cubeIndex, mousePosition, renderTextContent }: CubeProps) {
  const cubeRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 })

  const calculateRotation = () => {
    if (!cubeRef.current) return { rotateX: 0, rotateY: 0 }

    const cubeRect = cubeRef.current.getBoundingClientRect()
    const cubeCenterX = cubeRect.left + cubeRect.width / 2
    const cubeCenterY = cubeRect.top + cubeRect.height / 2

    const deltaX = mousePosition.x - cubeCenterX
    const deltaY = mousePosition.y - cubeCenterY

    const maxDistance = 500
    const rotateY = (deltaX / maxDistance) * 30
    const rotateX = -(deltaY / maxDistance) * 30

    return { rotateX, rotateY }
  }

  useEffect(() => {
    const updateRotation = () => {
      const newRotation = calculateRotation()
      setRotation(newRotation)
    }
    updateRotation()
  }, [mousePosition])

  return (
    <div
      ref={cubeRef}
      data-cube-index={cubeIndex}
      className="rack-cube"
    >
      <div 
        className="spinning-cube"
        style={{
          transform: `rotateY(${rotation.rotateY}deg) rotateX(${rotation.rotateX}deg)`
        }}
      >
        <div className="cube-3d">
        <div className="cube-face cube-face-front">
          <pre>{cubeData.verses ? cubeData.verses.join('\n') : cubeData.content || renderTextContent()}</pre>
        </div>
        <div className="cube-face cube-face-back">
          <pre>{cubeData.verses ? cubeData.verses.join('\n') : cubeData.content || renderTextContent()}</pre>
        </div>
        <div className="cube-face cube-face-right">
          <pre>{cubeData.verses ? cubeData.verses.join('\n') : cubeData.content || renderTextContent()}</pre>
        </div>
        <div className="cube-face cube-face-left">
          <pre>{cubeData.verses ? cubeData.verses.join('\n') : cubeData.content || renderTextContent()}</pre>
        </div>
        <div className="cube-face cube-face-top">
          <pre>{cubeData.verses ? cubeData.verses.join('\n') : cubeData.content || renderTextContent()}</pre>
        </div>
        <div className="cube-face cube-face-bottom">
          <pre>{cubeData.verses ? cubeData.verses.join('\n') : cubeData.content || renderTextContent()}</pre>
        </div>
      </div>
      </div>
    </div>
  )
}

