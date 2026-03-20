import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, ListMusic, GripVertical, FileText, Disc, Terminal } from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Track } from '../types';

const DUMMY_TRACKS: Track[] = [
  {
    id: '1',
    title: 'SYS_FILE_01.WAV',
    artist: 'UNKNOWN_ENTITY',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://picsum.photos/seed/glitch1/400/400',
    lyrics: "> DECRYPTING...\n> NEON LIGHTS IN THE SKY...\n> CHASING DREAMS AS WE FLY...\n> CYBER PULSE IN OUR VEINS...\n> BREAKING FREE FROM THE CHAINS...\n> EOF"
  },
  {
    id: '2',
    title: 'CYBER_PULSE.DAT',
    artist: 'DIGITAL_DREAMER',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://picsum.photos/seed/glitch2/400/400',
    lyrics: "> DECRYPTING...\n> DIGITAL DREAMS IN THE NIGHT...\n> GLOWING BRIGHT, OUT OF SIGHT...\n> BINARY CODE IN THE AIR...\n> FINDING HOPE EVERYWHERE...\n> EOF"
  },
  {
    id: '3',
    title: 'MIDNIGHT_DRV.EXE',
    artist: 'RETRO_FUTURE',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://picsum.photos/seed/glitch3/400/400',
    lyrics: "> DECRYPTING...\n> DRIVING THROUGH THE NEON RAIN...\n> LEAVING ALL THE STRESS AND PAIN...\n> RETRO VIBES AND SYNTHWAVE BEATS...\n> EMPTY ROADS AND QUIET STREETS...\n> EOF"
  },
];

interface SortableTrackItemProps {
  track: Track;
  isActive: boolean;
  onSelect: () => void;
}

const SortableTrackItem: React.FC<SortableTrackItemProps> = ({ track, isActive, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2 border-2 transition-colors cursor-default ${
        isActive ? 'bg-cyan-500/20 border-cyan-500' : 'bg-black border-magenta-500/30 hover:border-magenta-500'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-cyan-500 hover:text-magenta-500">
        <GripVertical className="w-4 h-4" />
      </div>
      
      <button 
        onClick={onSelect}
        className="flex-1 flex items-center gap-3 text-left min-w-0"
      >
        <div className="w-8 h-8 bg-magenta-500/20 border border-magenta-500 flex items-center justify-center overflow-hidden relative">
          <img src={track.cover} alt="" className="w-full h-full object-cover opacity-50 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-cyan-500 mix-blend-color opacity-30"></div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate ${isActive ? 'text-cyan-400' : 'text-white'}`}>{track.title}</p>
          <p className="text-xs text-magenta-400 truncate uppercase">{track.artist}</p>
        </div>
      </button>
    </div>
  );
};

export const MusicPlayer: React.FC = () => {
  const [queue, setQueue] = useState<Track[]>(DUMMY_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentTrack = queue[currentTrackIndex];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % queue.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + queue.length) % queue.length);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQueue((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newQueue = arrayMove(items, oldIndex, newIndex);
        
        if (oldIndex === currentTrackIndex) {
          setCurrentTrackIndex(newIndex);
        } else if (oldIndex < currentTrackIndex && newIndex >= currentTrackIndex) {
          setCurrentTrackIndex(currentTrackIndex - 1);
        } else if (oldIndex > currentTrackIndex && newIndex <= currentTrackIndex) {
          setCurrentTrackIndex(currentTrackIndex + 1);
        }
        
        return newQueue;
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  return (
    <div className="w-full relative">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />

      <div className="flex items-center gap-4">
        <div className="relative group w-20 h-20 border-2 border-cyan-500 p-1 bg-black overflow-hidden flex-shrink-0">
          <motion.div
            animate={{ opacity: isPlaying ? [1, 0.8, 1, 0.5, 1] : 1 }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
            className="w-full h-full relative"
          >
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-full h-full object-cover grayscale contrast-150"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-magenta-500 mix-blend-color opacity-40"></div>
            {isPlaying && <div className="absolute inset-0 bg-cyan-500 mix-blend-overlay opacity-50 animate-pulse"></div>}
          </motion.div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-white truncate tracking-tight glitch-text" data-text={currentTrack.title}>{currentTrack.title}</h3>
              <p className="text-magenta-400 text-sm uppercase tracking-widest">{currentTrack.artist}</p>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => {
                  setShowLyrics(!showLyrics);
                  if (showQueue) setShowQueue(false);
                }}
                className={`p-2 border-2 transition-colors ${showLyrics ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-black text-cyan-500 border-cyan-500 hover:bg-cyan-500/20'}`}
                title="DECRYPT_LYRICS"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  setShowQueue(!showQueue);
                  if (showLyrics) setShowLyrics(false);
                }}
                className={`p-2 border-2 transition-colors ${showQueue ? 'bg-magenta-500 text-black border-magenta-500' : 'bg-black text-magenta-500 border-magenta-500 hover:bg-magenta-500/20'}`}
                title="SHOW_QUEUE"
              >
                <ListMusic className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <button onClick={prevTrack} className="p-1 text-cyan-500 hover:text-white hover:bg-cyan-500 border border-transparent hover:border-cyan-500 transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center bg-magenta-500 text-black border-2 border-cyan-500 hover:bg-cyan-500 hover:border-magenta-500 transition-all shadow-[2px_2px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <button onClick={nextTrack} className="p-1 text-cyan-500 hover:text-white hover:bg-cyan-500 border border-transparent hover:border-cyan-500 transition-colors">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLyrics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 overflow-hidden border-2 border-cyan-500 bg-black"
          >
            <div className="p-3 max-h-48 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-2 border-b border-cyan-500/30 pb-1">
                <Terminal className="w-4 h-4 text-cyan-500" />
                <span className="text-cyan-500 text-xs">LYRICS_DECRYPTED</span>
              </div>
              <p className="text-sm text-white whitespace-pre-line leading-relaxed">
                {currentTrack.lyrics || "> NO_DATA_FOUND"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 overflow-hidden border-2 border-magenta-500 bg-black"
          >
            <div className="p-2 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={queue.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {queue.map((track, index) => (
                    <SortableTrackItem 
                      key={track.id} 
                      track={track} 
                      isActive={index === currentTrackIndex}
                      onSelect={() => {
                        setCurrentTrackIndex(index);
                        setIsPlaying(true);
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 space-y-2">
        <div className="h-2 w-full bg-black border border-cyan-500 overflow-hidden">
          <motion.div
            className="h-full bg-magenta-500"
            animate={{ width: `${progress}%` }}
            transition={{ type: "tween", duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-2 text-xs text-cyan-500 uppercase">
            <Disc className={`w-3 h-3 ${isPlaying ? 'animate-spin' : ''}`} />
            <span>{isPlaying ? 'STREAMING' : 'PAUSED'}</span>
           </div>
           <div className="flex items-center gap-2 group/volume">
            <div className="flex items-center gap-1 text-xs text-magenta-500 uppercase">
              {volume === 0 ? (
                <VolumeX className="w-3 h-3 text-red-500" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">VOL</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-2 bg-black border border-magenta-500 appearance-none cursor-pointer accent-cyan-500 hover:accent-white transition-all"
              aria-label="Volume"
            />
           </div>
        </div>
      </div>
    </div>
  );
};
