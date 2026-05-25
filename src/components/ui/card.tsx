import { cn } from "@/src/lib/utils"

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm", className)}>
      {children}
    </div>
  )
}
