import React from 'react';
import { ChevronDownIcon, ChevronUpIcon, PlayIcon, UploadIcon, XIcon } from '../Icons';
import { Resource } from '../../types';
import { AI_SLOTS } from '../../constants';

interface AiResourcePanelProps {
    isOpen: boolean;
    setIsOpen: (b: boolean) => void;
    isDarkMode: boolean;
    aiResources: Record<number, Resource>;
    activeAiResourceId: string | null;
    setActiveAiResourceId: (id: string) => void;
    onDelete: (slotId: number, e: React.MouseEvent) => void;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>, slotId: number) => void;
}

export const AiResourcePanel: React.FC<AiResourcePanelProps> = ({
    isOpen,
    setIsOpen,
    isDarkMode,
    aiResources,
    activeAiResourceId,
    setActiveAiResourceId,
    onDelete,
    onUpload
}) => {
    return (
        <div 
            className={`fixed left-0 right-0 z-[60] transition-all duration-300 ease-in-out ${isOpen ? 'bottom-0' : '-bottom-[180px]'} flex flex-col items-center`}
        >
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`px-6 py-2 rounded-t-xl backdrop-blur-md border-t border-x shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'bg-gray-900/90 border-gray-700 text-blue-400 hover:bg-gray-800' : 'bg-white/90 border-gray-300 text-blue-600 hover:bg-gray-50'}`}
            >
                {isOpen ? <ChevronDownIcon className="w-4 h-4"/> : <ChevronUpIcon className="w-4 h-4"/>}
                AI 专属资源 ({Object.keys(aiResources).length})
            </button>

            {/* Panel Content */}
            <div className={`w-full h-[180px] backdrop-blur-xl border-t shadow-[0_-10px_40px_rgba(0,0,0,0.5)] py-4 flex flex-col ${isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'}`}>
                
                <div className="flex gap-4 px-8 overflow-x-auto no-scrollbar items-start h-full">
                    {AI_SLOTS.map((slot) => {
                        const res = aiResources[slot.id];
                        const isActive = activeAiResourceId === res?.id;
                        
                        return (
                            <div key={slot.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                                <div 
                                    className={`relative group w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all shadow-md ${isActive ? 'border-blue-500 ring-2 ring-blue-500/20 scale-105' : (isDarkMode ? 'border-gray-700 hover:border-gray-500 bg-gray-800/50' : 'border-gray-200 hover:border-gray-400 bg-gray-100')}`}
                                    onClick={() => {
                                        if (res) setActiveAiResourceId(res.id);
                                    }}
                                >
                                    {res ? (
                                        <>
                                            {res.type === 'video' ? (
                                                <video src={res.url} className="w-full h-full object-cover" muted />
                                            ) : (
                                                <img src={res.url} alt={res.name} className="w-full h-full object-cover" />
                                            )}
                                            
                                            {/* Remove Button */}
                                            <button 
                                                onClick={(e) => onDelete(slot.id, e)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm shadow-sm"
                                            >
                                                <XIcon className="w-3 h-3" />
                                            </button>

                                            {res.type === 'video' && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                                                        <PlayIcon className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center relative">
                                            <div className={`transition-colors ${isDarkMode ? 'text-gray-600 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-500'}`}>
                                                <UploadIcon className="w-6 h-6" />
                                            </div>
                                            <input 
                                                type="file" 
                                                accept="image/*,video/*" 
                                                onChange={(e) => onUpload(e, slot.id)}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                title={`上传 ${slot.label}`}
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Label */}
                                <div className="text-center">
                                    <div className={`text-[10px] font-bold leading-none mb-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{slot.id}</div>
                                    <div className={`text-[10px] leading-tight ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{slot.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
