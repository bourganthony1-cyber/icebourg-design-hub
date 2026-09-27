import { cursor, lights } from './cursor'

// Make the Spline robot's head follow the cursor "flashlight", and flinch
// (jerk away + tilt back) when the beam gets close. Runs its own rAF loop off
// the shared cursor so nothing re-renders. Returns a cleanup function.
export function wireRobotGaze(app: any): () => void {
  const head = app.findObjectByName('Head')
  if (!head) return () => {}

  // Zoom back a hair: shrink the whole bot ~10% so there's a touch more room.
  const bot = app.findObjectByName('Bot')
  if (bot) {
    bot.scale.x = 0.9
    bot.scale.y = 0.9
    bot.scale.z = 0.9
  }

  let raf = 0
  let flinch = 0
  let lastFlinch = 0

  const tick = () => {
    const w = window.innerWidth
    const h = window.innerHeight

    // Cursor -> head yaw/pitch, clamped. Sign chosen so cursor-right turns the
    // head toward the right; flip these two lines if it reads mirrored.
    const nx = (cursor.x / w) * 2 - 1 // -1 (left) .. 1 (right)
    const ny = (cursor.y / h) * 2 - 1 // -1 (top) .. 1 (bottom)

    // The robot sits in the right pane (~72% across, mid-height). When the
    // flashlight gets close, flinch — but only when the lights are out.
    const dx = (cursor.x - w * 0.72) / w
    const dy = (cursor.y - h * 0.52) / h
    if (!lights.on && Math.hypot(dx, dy) < 0.16 && performance.now() - lastFlinch > 1400) {
      flinch = 1
      lastFlinch = performance.now()
    }
    flinch *= 0.9

    let yaw = nx * 0.5
    let pitch = ny * 0.32
    yaw -= flinch * 0.55 * (cursor.x >= w * 0.72 ? 1 : -1) // recoil: turn away
    pitch += flinch * 0.3 // recoil: chin up/back

    head.rotation.y = yaw
    head.rotation.x = pitch

    raf = requestAnimationFrame(tick)
  }

  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}
