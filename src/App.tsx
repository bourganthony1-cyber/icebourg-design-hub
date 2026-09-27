import { useEffect, useRef, useState } from "react";
import { StableAFAssistant } from "./components/ui/v0-ai-chat";
import { SplineScene } from "./components/ui/spline-scene";
import { Card } from "./components/ui/card";
import { Flashlight } from "./components/Flashlight";
import { trackCursor, lights } from "./lib/cursor";
import { wireRobotGaze } from "./lib/robot";
import { Sun, Moon } from "lucide-react";

const PROJECTS = [
  {
    name: "Baton Rouge Plumbing",
    trade: "Plumbing · Baton Rouge",
    blurb:
      "A dark, glassy site for a family-owned shop running since 1986 — LocalBusiness schema, six services, emergency line.",
    url: "https://baton-rouge-plumbing.vercel.app",
    img: undefined,
  },
  {
    name: "SoLit Electric",
    trade: "Electrical · Baton Rouge metro",
    blurb:
      "A licensed electrician's full local-search overhaul — service pages, structured data, a blog that actually gets found.",
    url: "https://www.solitelectric.com",
    img: undefined,
  },
  {
    name: "Electrician — concept",
    trade: "Electrical · Baton Rouge metro",
    blurb:
      "A dark, premium electrician site where the electric arc follows your cursor.",
    url: undefined,
    img: "/work-illuminate.png",
  },
  {
    name: "Photo Globe",
    trade: "Interactive · three.js",
    blurb:
      "Eighty-eight tiles of studio work on a sphere you can drag, or steer with your hand. Built to be played with.",
    url: "/photo-globe/",
    img: undefined,
  },
];

export default function App() {
  const [isLightsOn, setIsLightsOn] = useState(false);
  const [showWork, setShowWork] = useState(false);
  // Defer the Spline robot until the main thread is idle so it can't block first
  // paint / interactivity (it was ~10.6s of TBT mounting on load). The robot
  // still shows up a beat later — it just stops charging the whole page for it.
  const [robotMounted, setRobotMounted] = useState(false);
  const gazeCleanup = useRef<(() => void) | null>(null);

  // One mousemove listener for the whole app; the beam and the robot both poll it.
  useEffect(() => trackCursor(), []);

  // Mount the robot on idle (or after a short fallback timeout), not on load.
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => setRobotMounted(true), { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(() => setRobotMounted(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Mirror the light switch into the shared module so the robot's rAF can read it.
  useEffect(() => {
    lights.on = isLightsOn;
  }, [isLightsOn]);

  // Tear the gaze loop down on unmount.
  useEffect(() => () => gazeCleanup.current?.(), []);

  const onRobotLoad = (app: any) => {
    gazeCleanup.current?.();
    gazeCleanup.current = wireRobotGaze(app);
  };

  return (
    <div className={`h-screen w-full transition-colors duration-700 flex flex-col items-center justify-center relative overflow-hidden ${isLightsOn ? "bg-zinc-900" : "bg-black"}`}>
      {/* Header — above the flashlight so the light switch is always findable */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-[60] border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <span className="text-black font-bold text-lg">S</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white">StableAFdesigns</h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
          <button
            onClick={() => setShowWork(true)}
            className="hidden md:inline hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs font-medium text-zinc-400"
          >
            Work
          </button>
          <a
            href="mailto:StableAFDesign@proton.me"
            className="hidden md:inline hover:text-white transition-colors cursor-pointer"
          >
            Contact
          </a>
          <button
            onClick={() => setIsLightsOn(!isLightsOn)}
            className={`flex items-center gap-2 px-3 py-2 border border-white/10 rounded-full transition-all active:scale-95 text-zinc-300 hover:text-white ${isLightsOn ? "bg-white/5 hover:bg-white/10" : "bg-white/10 shadow-[0_0_18px_rgba(255,255,255,0.45)]"}`}
          >
            {isLightsOn ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-zinc-400" />}
            <span>{isLightsOn ? "Lights on" : "Lights out"}</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <Card className="w-full max-w-6xl h-[750px] bg-black/40 border-white/10 shadow-2xl backdrop-blur-sm flex overflow-hidden relative z-10">
        <div className="flex-1 flex flex-col md:flex-row h-full">
          {/* Left: Chatbot */}
          <div className="flex-[1.2] border-r border-white/5 flex flex-col h-full overflow-hidden bg-black/20">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">StableAF Assistant</h2>
              <p className="text-xs text-zinc-500">Ask about our services or start a project.</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <StableAFAssistant />
            </div>
          </div>

          {/* Right: Spline Robot — mounted on idle so it can't block first paint */}
          <div className="flex-1 relative hidden md:block bg-gradient-to-br from-zinc-900/50 to-black">
            {robotMounted ? (
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
                onLoad={onRobotLoad}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="loader"></span>
              </div>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 pointer-events-none">Vanta</div>
          </div>
        </div>
      </Card>

      {/* Footer / Branding */}
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-zinc-700 uppercase tracking-[0.2em] pointer-events-none">
        StableAFdesigns © 2026
      </footer>

      {/* Work overlay */}
      {showWork && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl overflow-y-auto">
          <button
            onClick={() => setShowWork(false)}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white text-sm font-medium"
          >
            Close ✕
          </button>
          <div className="max-w-4xl mx-auto px-8 pt-24 pb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">Work</h2>
            <p className="text-zinc-500 mt-2 text-sm">A few things I've shipped.</p>
            <div className="grid md:grid-cols-3 gap-6 mt-10">
              {PROJECTS.map((p) => {
                const inner = (
                  <>
                    {p.img && (
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-full h-44 object-cover object-top rounded-xl mb-4 border border-white/10"
                      />
                    )}
                    <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">{p.trade}</div>
                    <h3 className="text-xl font-semibold text-white mt-2">{p.name}</h3>
                    <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{p.blurb}</p>
                    <div className="text-xs text-zinc-500 mt-4 group-hover:text-white transition-colors">
                      {p.url ? "View site →" : "Concept — kept private"}
                    </div>
                  </>
                );
                const cls = "group block border border-white/10 rounded-2xl p-6 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all";
                return p.url ? (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <div key={p.name} className={cls}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* The flashlight — lights out only. Covers everything, beam reveals it. */}
      <Flashlight active={!isLightsOn} />
    </div>
  );
}
