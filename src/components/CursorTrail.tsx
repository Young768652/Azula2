import { useEffect, useRef } from 'react'

const TRAIL_COUNT = 6

export function CursorTrail() {
  const trailRefs = useRef<Array<HTMLDivElement | null>>(Array(TRAIL_COUNT).fill(null))
  const positionsRef = useRef(Array.from({ length: TRAIL_COUNT }, () => ({ x: -1000, y: -1000 })))
  const pointerRef = useRef({ x: -1000, y: -1000 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      pointerRef.current.x = e.clientX
      pointerRef.current.y = e.clientY
    }
    window.addEventListener('mousemove', handleMove)

    const animate = () => {
      const p = pointerRef.current
      const pos = positionsRef.current
      // lead segment follows cursor directly
      pos[0].x += (p.x - pos[0].x) * 0.1
      pos[0].y += (p.y - pos[0].y) * 0.1
      // trail segments follow the segment ahead of them
      for (let i = 1; i < TRAIL_COUNT; i++) {
        pos[i].x += (pos[i - 1].x - pos[i].x) * 0.15
        pos[i].y += (pos[i - 1].y - pos[i].y) * 0.15
      }
      // update DOM - position sparkles directly (no rotation)
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const el = trailRefs.current[i]
        if (!el) continue
        el.style.transform = `translate(${pos[i].x - 1}px, ${pos[i].y - 1}px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="cursor-trail" aria-hidden>
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={el => { if (el) trailRefs.current[i] = el }}
          className="cursor-seg"
          style={{ left: 0, top: 0 }}
        />
      ))}
    </div>
  )
}
