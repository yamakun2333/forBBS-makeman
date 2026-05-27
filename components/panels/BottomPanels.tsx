
import React, { useState } from 'react';
import { 
    CalendarIcon, ClockIcon, MessageSquareIcon, GiftIcon, PlayIcon, PauseIcon, UploadIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon
} from '../Icons';
import { Resource } from '../../types';
import { RANCH_UI_CONFIG } from '../../constants';

interface PanelProps {
    isDarkMode: boolean;
    themeClasses: any;
    onSimulateSchedule: () => void;
    onSimulateAlarm: () => void;
    onSimulateMessage: () => void;
    onGiftClick: (type: 'A_LOW' | 'A_HIGH' | 'B') => void;
    aiResources: Record<number, Resource>;
    handleAiFileUpload: (e: React.ChangeEvent<HTMLInputElement>, slotId: number) => void;
    uploadedText: string;
    setUploadedText: (s: string) => void;
    textSpeed: string;
    setTextSpeed: (s: any) => void;
    textColor: string; 
    textSize: number; 
    onPreviewText: () => void;
    carouselEnabled: boolean;
    setCarouselEnabled: (b: boolean) => void;
    carouselSpeed: number;
    setCarouselSpeed: (n: number) => void;
    tempSpeed: number;
    setTempSpeed: (n: number) => void;
    history: Resource[];
    activeResourceId: string | null;
    setActiveResourceId: (id: string) => void;
    onDragStart: (e: React.DragEvent, res: Resource) => void;
    onDragEnd: () => void;
    onDropDelete: (e: React.DragEvent) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDragging: boolean;
}

export const BottomPanels: React.FC<PanelProps> = ({
    isDarkMode,
    themeClasses,
    onSimulateSchedule,
    onSimulateAlarm,
    onSimulateMessage,
    onGiftClick,
    aiResources,
    handleAiFileUpload,
    uploadedText,
    setUploadedText,
    textSpeed,
    setTextSpeed,
    onPreviewText,
    carouselEnabled,
    setCarouselEnabled,
    setCarouselSpeed,
    tempSpeed,
    setTempSpeed,
    history,
    activeResourceId,
    setActiveResourceId,
    onDragStart,
    onDragEnd,
    onDropDelete,
    onFileUpload,
    isDragging
}) => {
    const [isToolboxOpen, setIsToolboxOpen] = useState(true);

    return (
        <div className="fixed bottom-24 left-0 w-full px-4 z-50 flex justify-start items-end pointer-events-none">
            
            <div className="flex items-end max-w-full">
                
                {/* Toggle Handle */}
                <button 
                    onClick={() => setIsToolboxOpen(!isToolboxOpen)}
                    className={`pointer-events-auto mr-3 w-9 h-[140px] rounded-xl backdrop-blur-md border shadow-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group ${themeClasses.panelBgStrong} ${isToolboxOpen ? '' : 'hover:brightness-110'}`}
                    title={isToolboxOpen ? "收起工具箱" : "展开工具箱"}
                >
                    <div className={`transition-transform duration-500 ${isToolboxOpen ? 'rotate-0' : 'rotate-180'}`}>
                        <ChevronUpIcon className="w-4 h-4 -rotate-90 text-gray-500 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <span className={`text-[10px] [writing-mode:vertical-rl] font-bold tracking-widest select-none transition-colors ${isDarkMode ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        {isToolboxOpen ? '收起' : '工具箱'}
                    </span>
                </button>

                {/* Sliding Container */}
                <div 
                    className={`flex items-center gap-3 overflow-x-auto no-scrollbar transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-left ${
                        isToolboxOpen 
                        ? 'opacity-100 translate-x-0 max-w-[calc(100vw-80px)] pointer-events-auto' 
                        : 'opacity-0 -translate-x-8 max-w-0 pointer-events-none overflow-hidden'
                    }`}
                >
                    
                    {/* Simulation Panel */}
                    <div 
                        className={`flex-shrink-0 backdrop-blur-md border rounded-2xl shadow-2xl flex flex-col w-40 p-3 h-[140px] ${themeClasses.panelBgStrong}`}
                    >
                        <div className={`text-[9px] font-bold uppercase tracking-wider ${themeClasses.subText} flex-shrink-0 flex items-center justify-between mb-2`}>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-current rounded-sm"></span> 智能模拟
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto no-scrollbar">
                            <button 
                                onClick={onSimulateSchedule}
                                className={`flex-shrink-0 flex items-center gap-2 p-1.5 rounded-lg text-[10px] transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                                <CalendarIcon className="w-3.5 h-3.5"/> 日程提醒 (Slot 15)
                            </button>
                            <button 
                                onClick={onSimulateAlarm}
                                className={`flex-shrink-0 flex items-center gap-2 p-1.5 rounded-lg text-[10px] transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                                <ClockIcon className="w-3.5 h-3.5"/> 闹钟触发 (Slot 14)
                            </button>
                            <button 
                                onClick={onSimulateMessage}
                                className={`flex-shrink-0 flex items-center gap-2 p-1.5 rounded-lg text-[10px] transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                                <MessageSquareIcon className="w-3.5 h-3.5"/> 收到信息 (Slot 13)
                            </button>
                        </div>
                    </div>

                    {/* Gift Panel */}
                    <div className={`flex-shrink-0 backdrop-blur-md border p-3 rounded-2xl shadow-2xl flex flex-col gap-2 w-36 h-[140px] transition-colors duration-300 ${themeClasses.panelBgStrong}`}>
                        <div className={`text-[9px] font-bold uppercase tracking-wider ${themeClasses.subText} flex items-center gap-2`}>
                            <GiftIcon className="w-3 h-3"/> 送礼物
                        </div>
                        
                        <div className="flex flex-col gap-1.5 flex-1 justify-center">
                            <button 
                                onClick={() => onGiftClick('A_LOW')}
                                className={`flex items-center gap-2 p-1.5 rounded-lg text-[10px] transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> 低价礼物A
                            </button>
                            <button 
                                onClick={() => onGiftClick('A_HIGH')}
                                className={`flex items-center gap-2 p-1.5 rounded-lg text-[10px] transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> 高价礼物A
                            </button>
                            <button 
                                onClick={() => onGiftClick('B')}
                                className={`flex items-center gap-2 p-1.5 rounded-lg text-[10px] transition-all border border-yellow-500/30 ${isDarkMode ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600'}`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> 专属礼物B
                            </button>
                        </div>
                    </div>

                    {/* Ranch Config Panel */}
                    <div className={`flex-shrink-0 backdrop-blur-md border p-3 rounded-2xl shadow-2xl flex flex-col gap-2 w-48 h-[140px] transition-colors duration-300 ${themeClasses.panelBgStrong}`}>
                        <div className={`text-[9px] font-bold uppercase tracking-wider ${themeClasses.subText} flex-shrink-0 flex items-center gap-2`}>
                            <span className="w-1.5 h-4 bg-current rounded-sm"></span> 牧场配置
                        </div>
                        
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 items-center h-full">
                            {RANCH_UI_CONFIG.map(item => (
                                <div key={item.id} className="flex flex-col items-center gap-1 min-w-[48px] group relative">
                                    <div className={`relative w-10 h-10 rounded-lg border flex items-center justify-center overflow-hidden transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 group-hover:border-white/30' : 'bg-gray-100 border-gray-300 group-hover:border-gray-400'}`}>
                                        {aiResources[item.id] ? (
                                            <img src={aiResources[item.id].url} className="w-full h-full object-cover" alt={item.label} />
                                        ) : (
                                            <div className={`text-[8px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.id===40?'BG':'AI'}</div>
                                        )}
                                        <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => handleAiFileUpload(e, item.id)}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                title={`上传 ${item.label}`}
                                        />
                                    </div>
                                    <span className={`text-[8px] ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} whitespace-nowrap`}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Text Upload Control */}
                    <div className={`flex-shrink-0 backdrop-blur-md border p-4 rounded-2xl shadow-2xl flex flex-col gap-2 w-48 h-[140px] transition-colors duration-300 ${themeClasses.panelBgStrong}`}>
                        <div className={`text-[9px] font-bold uppercase tracking-wider ${themeClasses.subText}`}>系统 & 文字</div>
                        <input 
                            type="text" 
                            value={uploadedText} 
                            onChange={(e) => setUploadedText(e.target.value)} 
                            className={`border rounded text-xs px-2 py-1 w-full outline-none focus:border-blue-500 ${isDarkMode ? 'bg-black/50 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                            placeholder="输入滚动文字..."
                        />
                        <div className="flex gap-2 justify-between">
                            <select 
                                className={`text-[9px] border rounded px-1 ${isDarkMode ? 'bg-black/50 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'}`} 
                                value={textSpeed} 
                                onChange={(e) => setTextSpeed(e.target.value as any)}
                            >
                                <option value="slow">慢</option>
                                <option value={1}>小</option>
                                <option value={2}>中</option>
                                <option value={3}>大</option>
                            </select>
                        </div>
                        
                        <button onClick={onPreviewText} className="mt-auto bg-blue-600/80 hover:bg-blue-600 text-white text-[10px] py-1 rounded transition">
                            预览文字
                        </button>
                    </div>

                    {/* Media Player Control */}
                    <div className={`flex-shrink-0 backdrop-blur-md border p-4 rounded-2xl shadow-2xl flex gap-4 h-[140px] ${themeClasses.panelBgStrong}`}>
                        <div className={`flex flex-col gap-2 border-r pr-4 min-w-[100px] justify-center ${isDarkMode ? 'border-gray-700/50' : 'border-gray-300'}`}>
                            <div className={`text-[9px] font-bold mb-1 uppercase tracking-wider ${themeClasses.subText}`}>播放设置</div>
                            <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                min="1" 
                                max="30" 
                                value={tempSpeed} 
                                onChange={(e) => setTempSpeed(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                                className={`w-12 border rounded px-1 text-xs text-center py-1 outline-none focus:border-blue-500 ${isDarkMode ? 'bg-black/50 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                            />
                            <span className={`text-[9px] ${themeClasses.subText}`}>秒</span>
                            </div>
                            <button 
                            onClick={() => {
                                setCarouselSpeed(tempSpeed);
                                setCarouselEnabled(!carouselEnabled);
                            }}
                            className={`text-[9px] py-1.5 px-2 rounded-md flex items-center justify-center gap-1 transition-colors font-medium ${carouselEnabled ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                            >
                            {carouselEnabled ? <PauseIcon/> : <PlayIcon/>}
                            {carouselEnabled ? '暂停' : '开始'}
                            </button>
                        </div>

                        <div className="flex flex-col min-w-[200px]">
                            <div className={`text-[9px] font-bold mb-2 uppercase tracking-wider flex justify-between ${themeClasses.subText}`}>
                            <span>图库 ({history.length}/10)</span>
                            <span className={`font-normal ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>拖拽移出以删除</span>
                            </div>
                            {history.length === 0 ? (
                            <div className={`h-16 flex items-center justify-center text-[10px] italic rounded-lg border border-dashed ${isDarkMode ? 'bg-black/20 text-gray-600 border-gray-700/30' : 'bg-gray-100 text-gray-400 border-gray-300'}`}>
                                暂无媒体文件
                            </div>
                            ) : (
                            <div className="flex gap-2">
                                <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[300px] pb-1">
                                    {history.map((res) => (
                                    <div 
                                        key={res.id}
                                        className={`relative group flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border transition-all shadow-md ${activeResourceId === res.id ? 'border-blue-500 ring-2 ring-blue-500/20' : (isDarkMode ? 'border-gray-700 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400')}`}
                                        onClick={() => {
                                            setActiveResourceId(res.id);
                                            setCarouselEnabled(false); 
                                        }}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, res)}
                                        onDragEnd={onDragEnd}
                                    >
                                        {res.type === 'video' ? (
                                        <video src={res.url} muted className="w-full h-full object-cover" />
                                        ) : (
                                        <img src={res.url} alt="thumbnail" className="w-full h-full object-cover" />
                                        )}
                                        {res.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><div className="w-4 h-4 text-white opacity-80"><PlayIcon /></div></div>}
                                    </div>
                                    ))}
                                </div>
                            </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Button / Delete Drop Zone */}
                    <div 
                        className={`flex-shrink-0 backdrop-blur-md border p-4 rounded-2xl shadow-2xl w-24 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative group h-[140px] 
                        ${isDragging 
                            ? (isDarkMode ? 'bg-red-900/20 border-red-500/50 hover:bg-red-900/40' : 'bg-red-50 border-red-300 hover:bg-red-100') 
                            : `${themeClasses.panelBgStrong} hover:scale-105 active:scale-95 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
                        }`}
                        onDragOver={isDragging ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; } : undefined}
                        onDrop={isDragging ? onDropDelete : undefined}
                    >
                        {isDragging ? (
                            <>
                                <div className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-500'}`}>
                                    <TrashIcon className="w-6 h-6" />
                                </div>
                                <span className={`text-[9px] text-center leading-tight font-bold ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>松手<br/>删除</span>
                            </>
                        ) : (
                            <>
                                <div className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-400 group-hover:bg-blue-600/20 group-hover:text-blue-400' : 'bg-gray-200 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                                    <UploadIcon />
                                </div>
                                <span className={`text-[9px] text-center leading-tight font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>导入<br/>媒体</span>
                                <input 
                                    type="file" 
                                    accept="image/*,video/*" 
                                    onChange={onFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    title="上传文件"
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
