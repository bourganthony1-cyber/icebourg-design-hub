import { motion } from "motion/react";

export function Flashlight({ mouse, active }: { mouse: { x: number; y: number }, active: boolean }) {
  // If lights are on, we don't show the dark overlay
  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "black",
        pointerEvents: "none",
        zIndex: 50,
        maskImage: `radial-gradient(circle 250px at ${mouse.x}px ${mouse.y}px, transparent 0%, black 100%)`,
        WebkitMaskImage: `radial-gradient(circle 250px at ${mouse.x}px ${mouse.y}px, transparent 0%, black 100%)`,
      }}
    />
  );
}
