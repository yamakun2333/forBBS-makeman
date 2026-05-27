import React from 'react';
import { XIcon, PlayIcon, PauseIcon, SpeakerIcon, ChevronUpIcon } from '../Icons';

type WhiteNoiseStatus = 'IDLE' | 'ACTIVE' | 'VOLUME_ADJUST';

interface WhiteNoiseCompProps {
    status: WhiteNoiseStatus;
    types: { id: string, name: string, icon: string }[];
    activeIndex: number;
    isPlaying: boolean;
    volume: number;
    onPrev: () => void;
    onNext: () => void;
    onTogglePlay: () => void;
    onVolumeChange: (val: number) => void;
    onExit: () => void;
    onOpenVolume: () => void;
    onCloseVolume: () => void;
}

const WhiteNoiseComp: React.FC<WhiteNoiseCompProps> = ({
    status,
    types,
    activeIndex,
    isPlaying,
    volume,
    onPrev,
    onNext,
    onTogglePlay,
    onVolumeChange,
    onExit,
    onOpenVolume,
    onCloseVolume
}) => {
    if (status === 'IDLE') return null;

    return (
        <>
            {/* Main UI */}
            {status === 'ACTIVE' && (
                <div className="absolute inset-0 z-50 flex flex-col items-center animate-fadeIn">
                    {/* Exit Button */}
                        <button 
                            onClick={onExit}
                            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-[60]"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>

                    {/* Top: Type Switcher */}
                    <div className="absolute top-[20px] flex items-center gap-6">
                        <button onClick={onPrev} className="text-white/60 hover:text-white p-2 transition-transform active:scale-95">
                            <ChevronUpIcon className="w-6 h-6 -rotate-90" />
                        </button>
                        
                        <div className="flex flex-col items-center gap-1 w-16">
                            <div className="text-4xl drop-shadow-md transition-all duration-300 transform scale-110">
                                {types[activeIndex].icon}
                            </div>
                            <div className="text-xs font-bold text-white drop-shadow-md">
                                {types[activeIndex].name}
                            </div>
                        </div>

                        <button onClick={onNext} className="text-white/60 hover:text-white p-2 transition-transform active:scale-95">
                                <ChevronUpIcon className="w-6 h-6 rotate-90" />
                        </button>
                    </div>

                    {/* Bottom: Controls */}
                    <div className="absolute bottom-6 flex gap-8 items-center">
                        <button 
                            onClick={onTogglePlay}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all hover:bg-white/30"
                        >
                            {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                        </button>
                        
                        <button 
                            onClick={onOpenVolume}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all hover:bg-white/30"
                        >
                            <SpeakerIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Volume Adjustment Page */}
            {status === 'VOLUME_ADJUST' && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center gap-6 animate-fadeIn">
                    <button 
                            onClick={onCloseVolume}
                            className="absolute top-4 left-4 text-white/70 hover:text-white flex items-center gap-1 text-xs"
                    >
                        <ChevronUpIcon className="w-4 h-4 -rotate-90" /> 返回
                    </button>

                    <div className="text-white/80 font-bold text-sm tracking-wider">音量调节</div>
                    
                    <div className="text-5xl font-display font-bold text-white tabular-nums">
                        {volume}%
                    </div>

                    {/* Circular Slider Simulation */}
                    <div className="w-48 h-12 bg-gray-800/50 rounded-full relative flex items-center px-2 cursor-pointer touch-none border border-white/10">
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="5"
                            value={volume}
                            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                        />
                        <div className="w-full h-2 bg-gray-600 rounded-full relative overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-100" 
                                style={{ width: `${volume}%` }}
                            ></div>
                        </div>
                        <div 
                            className="absolute h-8 w-8 rounded-full shadow-lg z-10 pointer-events-none transition-all duration-100 flex items-center justify-center bg-white text-blue-600"
                            style={{ left: `calc(${volume}% - 16px)` }}
                        >
                            <SpeakerIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WhiteNoiseComp;
