import React, { useRef, useEffect } from 'react';
import { Resource, BadgeMode } from '../types';
import { XIcon, ChargingIcon } from './Icons';

export const ViewIcon = ({ view }: { view: string }) => {
  switch(view) {
    case 'FRONT': return <div className="w-4 h-4 rounded-full border-[1.5px] border-current"></div>;
    case 'BACK': return <div className="w-4 h-4 rounded-full border-[1.5px] border-current border-dashed"></div>;
    case 'LEFT': return <div className="w-1.5 h-4 border-[1.5px] border-current rounded-sm"></div>;
    case 'RIGHT': return <div className="w-1.5 h-4 border-[1.5px] border-current rounded-sm"></div>;
    default: return null;
  }
};

export const BatteryLevelControl = ({ level, charging }: { level: number, charging?: boolean }) => (
  <div className="relative w-5 h-2.5 flex items-center justify-center">
    <div className="absolute inset-0 border-[1.5px] border-current rounded-[2px] p-[0.5px]">
        <div 
        className="h-full bg-current rounded-[0.5px]" 
        style={{ width: `${level}%` }}
        />
    </div>
    <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[1.5px] h-1.5 bg-current rounded-r-[1px]"></div>
    {charging && (
        <div className="absolute inset-0 flex items-center justify-center text-black z-10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        </div>
    )}
  </div>
);

export const BatteryDisplay = ({ level, isCharging, showText = true }: { level: number, isCharging: boolean, showText?: boolean }) => {
  let color = 'text-green-500';
  if (level <= 20) color = 'text-red-500';
  else if (level <= 60) color = 'text-yellow-500';

  return (
    <div className={`flex items-center gap-1 ${color} drop-shadow-md`}>
      <div className="relative w-5 h-2.5 border border-current rounded-[1px] p-[0.5px] flex items-center justify-center">
        <div 
          className="h-full bg-current rounded-[0.5px] transition-all duration-300 absolute left-[0.5px] top-[0.5px] bottom-[0.5px]" 
          style={{ width: `calc(${level}% - 1px)` }}
        />
        {isCharging && <ChargingIcon className="w-2 h-2 text-white z-10 relative animate-pulse" />}
        <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[1.5px] h-1.5 bg-current rounded-r-[1px]"></div>
      </div>
      {showText && <span className="text-[9px] font-display font-bold tracking-tighter">{level}%</span>}
    </div>
  );
};

export const Wallpaper = ({ activeResource, mode, volume }: { activeResource: Resource | undefined, mode: BadgeMode, volume: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Volume control
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Robust Playback Control
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isScreenOn = mode === BadgeMode.IDLE || mode === BadgeMode.MENU;

    const attemptPlay = async () => {
         try {
             if (video.paused && isScreenOn) {
                 await video.play();
             } else if (!isScreenOn && !video.paused) {
                 video.pause();
             }
         } catch (e) {
             console.warn("Playback failed", e);
             // Fallback: try mute play if audio policy blocked it
             if (video.paused && isScreenOn) {
                 video.muted = true;
                 try { await video.play(); } catch(err) { console.error("Muted playback also failed", err); }
             }
         }
    };

    attemptPlay();
  }, [mode, activeResource]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {activeResource ? (
       activeResource.type === 'video' ? (
           <video 
             ref={videoRef}
             src={activeResource.url} 
             loop 
             playsInline
             // Add onLoadedData to trigger play once ready
             onLoadedData={() => {
                 if (mode === BadgeMode.IDLE || mode === BadgeMode.MENU) {
                     videoRef.current?.play().catch(() => {});
                 }
             }}
             className="w-full h-full object-cover" 
             style={{ filter: mode === BadgeMode.MENU ? 'blur(10px) brightness(0.8)' : 'none', transition: 'filter 0.5s ease' }}
           />
         ) : (
           <img 
             src={activeResource.url} 
             alt="Wallpaper" 
             className="w-full h-full object-cover" 
             style={{ filter: mode === BadgeMode.MENU ? 'blur(10px) brightness(0.8)' : 'none', transition: 'filter 0.5s ease' }}
           />
         )
      ) : (
       <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black relative overflow-hidden" style={{ filter: mode === BadgeMode.MENU ? 'blur(15px)' : 'none', transition: 'filter 0.5s ease' }}>
            <div className="absolute top-10 right-10 w-20 h-20 bg-blue-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-16 h-16 bg-purple-500 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
       </div>
      )}
    </div>
  );
};

export const HelpModal = ({ isOpen, onClose, isDarkMode }: { isOpen: boolean, onClose: () => void, isDarkMode: boolean }) => {
  if (!isOpen) return null;
  
  const bgClass = isDarkMode ? "bg-gray-900/95 text-white border-gray-700" : "bg-white/95 text-gray-800 border-gray-200";
  const itemClass = isDarkMode ? "bg-gray-800/50" : "bg-gray-100";
  const titleClass = isDarkMode ? "text-blue-400" : "text-blue-600";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className={`${bgClass} backdrop-blur-md rounded-2xl border p-6 w-full max-w-md shadow-2xl relative flex flex-col max-h-[80vh]`}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-500/20 rounded-full transition">
          <XIcon className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold font-display mb-6 text-center border-b border-gray-500/20 pb-4">产品使用指南</h2>
        
        <div className="overflow-y-auto space-y-6 pr-2 no-scrollbar">
           <div>
              <h3 className={`${titleClass} text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2`}>
                <span className="w-1.5 h-4 bg-current rounded-sm"></span> 按键操作
              </h3>
              <div className={`${itemClass} rounded-lg p-3 space-y-2 text-xs leading-relaxed`}>
                 <div className="flex justify-between border-b border-gray-500/10 pb-1">
                   <span>左侧按键 (长按 2s)</span>
                   <span className="font-bold opacity-80">开机 / 关机</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-500/10 pb-1">
                   <span>左侧按键 (短按)</span>
                   <span className="font-bold opacity-80">亮屏 / 熄屏</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-500/10 pb-1">
                   <span>右上按键 (长按 3s)</span>
                   <span className="font-bold opacity-80">进入 / 退出 AI 对话</span>
                 </div>
                 <div className="flex justify-between">
                   <span>右下按键 (点击)</span>
                   <span className="font-bold opacity-80">菜单 / 返回</span>
                 </div>
              </div>
           </div>

           <div>
              <h3 className={`${titleClass} text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2`}>
                <span className="w-1.5 h-4 bg-current rounded-sm"></span> 触控与交互
              </h3>
              <div className={`${itemClass} rounded-lg p-3 space-y-2 text-xs leading-relaxed`}>
                 <p>• <span className="font-bold">切换壁纸：</span> 在主页左右滑动屏幕。</p>
                 <p>• <span className="font-bold">应援变色：</span> 在应援模式下左右滑动切换颜色，点击切换闪烁。</p>
                 <p>• <span className="font-bold">导入资源：</span> 拖拽图片或视频文件到下方的上传区域，或直接点击上传按钮。</p>
                 <p>• <span className="font-bold">删除资源：</span> 将下方的资源缩略图拖拽到右侧红色区域。</p>
                 <p>• <span className="font-bold">AI 互动：</span> 在 AI 页面按下并左右滑动触发"摸头"，点击屏幕触发"戳脸"。</p>
              </div>
           </div>

           <div>
              <h3 className={`${titleClass} text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2`}>
                <span className="w-1.5 h-4 bg-current rounded-sm"></span> 特色功能
              </h3>
              <div className={`${itemClass} rounded-lg p-3 space-y-2 text-xs leading-relaxed`}>
                 <p>• <span className="font-bold">AI 助手：</span> 支持语音对话。</p>
                 <p>• <span className="font-bold">电子徽章：</span> 支持自定义滚动文字、拾音律动模式、二维码展示。</p>
                 <p>• <span className="font-bold">送礼互动：</span> 点击底部礼物面板，再次进入AI页面触发专属反馈。</p>
                 <p>• <span className="font-bold">智能模拟：</span> 下方控制台可模拟日程、闹钟及查找设备功能。</p>
              </div>
           </div>
        </div>

        <button onClick={onClose} className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          我明白了
        </button>
      </div>
    </div>
  );
};