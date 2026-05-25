import React, { useState } from "react";
import { IceBourgAssistant } from "./components/ui/v0-ai-chat";
import { Spotlight } from "./components/ui/spotlight";
import { SplineScene } from "./components/ui/spline-scene";
import { Card } from "./components/ui/card";
import { Sun, Moon } from "lucide-react";

export default function App() {
  const [isLightsOn, setIsLightsOn] = useState(false);

  return (
    <div className={`h-screen w-full transition-colors duration-700 flex flex-col items-center justify-center relative overflow-hidden ${isLightsOn ? "bg-zinc-900" : "bg-black"}`}>
      {/* Background visual flair */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill={isLightsOn ? "#ffffff" : "#ffffff10"}
      />
      
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <span className="text-black font-bold text-lg">I</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white">IceBourgDesigns</h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
          <span className="hidden md:inline hover:text-white transition-colors cursor-pointer">Agency</span>
          <span className="hidden md:inline hover:text-white transition-colors cursor-pointer">Projects</span>
          <button 
            onClick={() => setIsLightsOn(!isLightsOn)}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-95"
          >
            {isLightsOn ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-zinc-400" />}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <Card className="w-full max-w-6xl h-[750px] bg-black/40 border-white/10 shadow-2xl backdrop-blur-sm flex overflow-hidden relative z-10">
        <div className="flex-1 flex flex-col md:flex-row h-full">
          {/* Left: Chatbot */}
          <div className="flex-[1.2] border-r border-white/5 flex flex-col h-full overflow-hidden bg-black/20">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">IceBourg Assistant</h2>
              <p className="text-xs text-zinc-500">Ask about our services or start a project.</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <IceBourgAssistant />
            </div>
          </div>

          {/* Right: Spline Robot */}
          <div className="flex-1 relative hidden md:block bg-gradient-to-br from-zinc-900/50 to-black">
             <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>
      </Card>

      {/* Footer / Branding */}
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-zinc-700 uppercase tracking-[0.2em] pointer-events-none">
        IceBourg Designs © 2024
      </footer>
    </div>
  );
}
