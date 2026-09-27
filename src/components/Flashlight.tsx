import { useEffect, useRef } from 'react'
import { cursor } from '../lib/cursor'

// A smooth flashlight: a full-screen black overlay with a soft radial hole that
// follows the cursor. Driven by requestAnimationFrame off a shared cursor
// position (no React re-render per mousemove), with a lerp so the beam glides
// instead of snapping.
export function Flashlight({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let raf = 0

    const tick = () => {
      x += (cursor.x - x) * 0.14
      y += (cursor.y - y) * 0.14
      const mask = `radial-gradient(circle 440px at ${x}px ${y}px, transparent 0%, transparent 26%, rgba(0,0,0,0.78) 52%, black 100%)`
      el.style.maskImage = mask
      el.style.webkitMaskImage = mask
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  if (!active) return null

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'black',
        pointerEvents: 'none',
        zIndex: 50
      }}
    />
  )
}
