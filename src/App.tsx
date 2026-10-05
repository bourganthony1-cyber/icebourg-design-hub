import { useEffect, useRef, useState } from "react";
import { StableAFAssistant } from "./components/ui/v0-ai-chat";
import { SplineScene } from "./components/ui/spline-scene";
import { Card } from "./components/ui/card";
import { trackCursor, lights } from "./lib/cursor";
import { wireRobotGaze } from "./lib/robot";
import { Sun, Moon } from "lucide-react";

type Project = {
  name: string;
  trade: string;
  blurb: string;
  url?: string;
  img?: string;
  note?: string;
};

const PROJECTS: Project[] = [
  {
    name: "SoLit Electric",
    trade: "Electrical · Baton Rouge metro",
    blurb:
      "A licensed electrician's full local-search overhaul — service pages, structured data, a blog that actually gets found.",
    url: "https://www.solitelectric.com",
    img: "/work-solitelectric.webp",
  },
  {
    name: "Plumbing — concept",
    trade: "Plumbing · Baton Rouge",
    blurb:
      "A dark, glassy site for a family-owned shop running since 1986 — services, service area and an emergency line on one page that loads in under a second. Built as a demonstration, and the number on it is fake on purpose.",
    url: "https://baton-rouge-plumbing.vercel.app",
    img: "/work-baton-rouge-plumbing.webp",
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
    img: "/work-globe.webp",
  },
  {
    name: "The template",
    trade: "Every build starts here",
    blurb:
      "One page structure, one design language, swapped per client — business, town, trade, licence. It is why a new site takes a day instead of a month.",
    img: "/work-template.webp",
    note: "Shown on request",
  },
  {
    name: "The Cost of Invisibility",
    trade: "Pitch deck",
    blurb:
      "What a missing web presence costs a trade business, worked in that business's own market. Every number sourced, or left blank on purpose.",
    img: "/work-deck.webp",
    note: "Shown in the pitch",
  },
];

export default function App() {
  const [isLightsOn, setIsLightsOn] = useState(true);
  const [showWork, setShowWork] = useState(false);
  const light = isLightsOn;
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

  // Keep the browser chrome in step with the theme — scrollbars, form controls and the
  // overscroll gutter — so a light page never flashes a black edge.
  useEffect(() => {
    const root = document.documentElement;
    root.style.colorScheme = light ? "light" : "dark";
    root.style.backgroundColor = light ? "#f4f4f5" : "#000000";
  }, [light]);

  // Tear the gaze loop down on unmount.
  useEffect(() => () => gazeCleanup.current?.(), []);

  const onRobotLoad = (app: any) => {
    gazeCleanup.current?.();
    gazeCleanup.current = wireRobotGaze(app);
  };

  return (
    <div className={`h-screen w-full transition-colors duration-700 flex flex-col items-center justify-center relative overflow-hidden ${light ? "bg-zinc-100" : "bg-black"}`}>
      {/* Header — always on top, so the light switch is findable */}
      <header className={`absolute top-0 left-0 w-full p-6 flex justify-between items-center z-[60] border-b backdrop-blur-md ${light ? "border-black/5 bg-white/70" : "border-white/5 bg-black/20"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${light ? "bg-zinc-900 shadow-[0_0_20px_rgba(0,0,0,0.18)]" : "bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"}`}>
            <span className={`font-bold text-lg ${light ? "text-white" : "text-black"}`}>S</span>
          </div>
          <h1 className={`text-lg font-semibold tracking-tight ${light ? "text-zinc-900" : "text-white"}`}>StableAFdesigns</h1>
        </div>
        <div className={`flex items-center gap-4 text-xs font-medium ${light ? "text-zinc-600" : "text-zinc-400"}`}>
          <button
            onClick={() => setShowWork(true)}
            className={`hidden md:inline transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs font-medium ${light ? "text-zinc-600 hover:text-zinc-900" : "text-zinc-400 hover:text-white"}`}
          >
            Work
          </button>
          {/* Work and Contact were md-and-up only, so on a phone the portfolio was unreachable
              and the header had no touch target at all. Keep one Work button on small screens. */}
          <button
            onClick={() => setShowWork(true)}
            className={`md:hidden transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs font-medium ${light ? "text-zinc-600 hover:text-zinc-900" : "text-zinc-400 hover:text-white"}`}
          >
            Work
          </button>
          <a
            href="mailto:StableAFDesign@proton.me"
            className={`hidden md:inline transition-colors cursor-pointer ${light ? "text-zinc-600 hover:text-zinc-900" : "text-zinc-400 hover:text-white"}`}
          >
            Contact
          </a>
          <button
            onClick={() => setIsLightsOn(!isLightsOn)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-full transition-all active:scale-95 ${light ? "border-black/10 bg-black/[0.04] text-zinc-700 hover:bg-black/[0.07] hover:text-zinc-900" : `border-white/10 text-zinc-300 hover:text-white ${isLightsOn ? "bg-white/5 hover:bg-white/10" : "bg-white/10 shadow-[0_0_18px_rgba(255,255,255,0.45)]"}`}`}
          >
            {isLightsOn ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-zinc-400" />}
            <span>{isLightsOn ? "Lights on" : "Lights out"}</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <Card className={`w-full max-w-6xl h-[750px] shadow-2xl backdrop-blur-sm flex overflow-hidden relative z-10 ${light ? "bg-white/80 border-black/10" : "bg-black/40 border-white/10"}`}>
        <div className="flex-1 flex flex-col md:flex-row h-full">
          {/* Left: Chatbot */}
          <div className={`flex-[1.2] border-r flex flex-col h-full overflow-hidden ${light ? "border-black/5 bg-white/40" : "border-white/5 bg-black/20"}`}>
            <div className={`p-6 border-b ${light ? "border-black/5" : "border-white/5"}`}>
              <h2 className={`text-xl font-bold ${light ? "text-zinc-900" : "text-white"}`}>StableAF Assistant</h2>
              <p className="text-xs text-zinc-500">Ask about our services or start a project.</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <StableAFAssistant light={light} />
            </div>
          </div>

          {/* Right: Spline Robot — mounted on idle so it can't block first paint */}
          <div className={`flex-1 relative hidden md:block ${light ? "bg-gradient-to-br from-zinc-200/60 to-white" : "bg-gradient-to-br from-zinc-900/50 to-black"}`}>
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
            <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] pointer-events-none ${light ? "text-zinc-400" : "text-zinc-500"}`}>Vanta</div>
          </div>
        </div>
      </Card>

      {/* Footer / Branding */}
      <footer className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] pointer-events-none ${light ? "text-zinc-400" : "text-zinc-700"}`}>
        StableAFdesigns © 2026
      </footer>

      {/* Work overlay */}
      {showWork && (
        <div className={`fixed inset-0 z-[100] backdrop-blur-xl overflow-y-auto ${light ? "bg-white/95" : "bg-black/95"}`}>
          <button
            onClick={() => setShowWork(false)}
            className={`absolute top-6 right-6 text-sm font-medium ${light ? "text-zinc-500 hover:text-zinc-900" : "text-zinc-400 hover:text-white"}`}
          >
            Close ✕
          </button>
          <div className="max-w-4xl mx-auto px-8 pt-24 pb-16">
            <h2 className={`text-3xl font-bold tracking-tight ${light ? "text-zinc-900" : "text-white"}`}>Work</h2>
            <p className="text-zinc-500 mt-2 text-sm">A few things I've shipped.</p>
            <div className="grid md:grid-cols-3 gap-6 mt-10">
              {PROJECTS.map((p) => {
                const inner = (
                  <>
                    {p.img && (
                      <img
                        src={p.img}
                        alt={p.name}
                        className={`w-full h-44 object-cover object-top rounded-xl mb-4 border ${light ? "border-black/10" : "border-white/10"}`}
                      />
                    )}
                    <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">{p.trade}</div>
                    <h3 className={`text-xl font-semibold mt-2 ${light ? "text-zinc-900" : "text-white"}`}>{p.name}</h3>
                    <p className={`text-sm mt-2 leading-relaxed ${light ? "text-zinc-600" : "text-zinc-400"}`}>{p.blurb}</p>
                    <div className={`text-xs mt-4 transition-colors ${light ? "text-zinc-500 group-hover:text-zinc-900" : "text-zinc-500 group-hover:text-white"}`}>
                      {p.url ? "View site →" : p.note ?? "Concept — kept private"}
                    </div>
                  </>
                );
                const cls = `group block border rounded-2xl p-6 transition-all ${light ? "border-black/10 bg-black/[0.02] hover:bg-black/[0.05] hover:border-black/20" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"}`;
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

      {/* The flashlight is gone on purpose: a full-screen black mask on first paint read as
          "the site is not loading" to visitors. Lights on is the default; nothing covers the page. */}
    </div>
  );
}
