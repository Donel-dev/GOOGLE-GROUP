import React from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';
import { Terminal, Cpu } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-black text-cyan-400 scanlines relative overflow-hidden font-mono selection:bg-magenta-500 selection:text-black">
      {/* Glitch Background Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-magenta-500/10 blur-3xl rounded-full mix-blend-screen animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full mix-blend-screen animate-pulse delay-1000" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <header className="mb-8 border-b-4 border-magenta-500 pb-4 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Terminal className="w-8 h-8 text-cyan-400" />
              <h1 className="text-4xl font-bold tracking-tighter glitch-text text-white" data-text="SYS.OVERRIDE_">
                SYS.OVERRIDE_
              </h1>
            </div>
            <p className="text-magenta-400 text-lg tracking-widest">PROTOCOL: SNAKE_EXEC // AUDIO_STREAM_ACTIVE</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-cyan-500 border border-cyan-500 p-2 bg-cyan-500/10">
            <Cpu className="w-5 h-5 animate-pulse" />
            <span>CPU: ERR%</span>
          </div>
        </header>

        <main className="flex-1 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex justify-center">
            <SnakeGame />
          </div>
          
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-black border-2 border-cyan-500 p-4 shadow-[4px_4px_0px_#f0f]">
              <h2 className="text-2xl font-bold text-magenta-500 mb-2 border-b border-magenta-500/50 pb-2">{">>"} AUDIO_STREAM</h2>
              <MusicPlayer />
            </div>
            
            <div className="bg-black border-2 border-magenta-500 p-4 shadow-[4px_4px_0px_#0ff]">
              <h2 className="text-xl font-bold text-cyan-500 mb-2">{">>"} SYS_LOG</h2>
              <div className="text-sm space-y-1 text-cyan-400/70">
                <p>[OK] KERNEL_LOADED</p>
                <p>[OK] AUDIO_MODULE_SYNC</p>
                <p className="text-magenta-500 animate-pulse">[WARN] GLITCH_DETECTED</p>
                <p>[OK] WAITING_FOR_INPUT...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
