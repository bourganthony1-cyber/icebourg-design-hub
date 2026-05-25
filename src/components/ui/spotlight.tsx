import { motion } from "motion/react"

export function Spotlight({ className, fill = "white" }: { className?: string, fill?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
      style={{
        position: "absolute",
        pointerEvents: "none",
        userSelect: "none",
        width: "100%",
        height: "100%",
        background: `radial-gradient(circle at center, ${fill} 0%, transparent 70%)`,
        opacity: 0.15,
        filter: "blur(120px)",
      }}
    />
  )
}
