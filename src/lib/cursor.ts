// Shared cursor position + lights state, read directly by the flashlight beam
// and the robot's gaze loop. A mutable module singleton on purpose: both loops
// poll it every frame, so nothing re-renders React on mousemove.
export const cursor = { x: 0, y: 0 }

// true = lights on (room lit, no flashlight); false = lights out (beam on).
export const lights = { on: false }

// One mousemove listener for the whole app. Returns the cleanup function.
export function trackCursor() {
  const onMove = (e: MouseEvent) => {
    cursor.x = e.clientX
    cursor.y = e.clientY
  }
  window.addEventListener('mousemove', onMove, { passive: true })
  return () => window.removeEventListener('mousemove', onMove)
}
