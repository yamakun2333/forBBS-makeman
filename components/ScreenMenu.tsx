
import React, { useEffect, useRef, useState } from 'react';
import { MenuState } from '../types';
import { 
    BatteryIcon, SpeakerIcon, TextIcon, MicIcon, TrashMenuIcon, LinkIcon, CheerIcon, SunIcon, 
    TrashIcon, SignalIcon, BluetoothIcon, CameraIcon
} from './Icons';
import { BatteryDisplay } from './BadgeUi';
import { WEEKDAYS, CHEER_COLORS } from '../constants';

const ScreenMenu = (props: {
  menuState: MenuState;
  setMenuState: (s: MenuState) => void;
  isPowerSaving: boolean;
  togglePowerSave: () => void;
  volume: number;
  setVolume: (v: number) => void;
  handleVolumeClick: () => void;
  handleCameraClick: () => void;
  onPhotoCapture: (dataUrl: string) => void;
  pickupData: number[];
  handlePickupClick: () => void;
  handleDeleteRequest: () => void;
  confirmDelete: () => void;
  handleLinkClick: () => void;
  handleQRCodeClick?: () => void;
  handleCheerClick: () => void;
  cheerColorIndex: number;
  isCheerStrobe: boolean;
  setIsCheerStrobe: (b: boolean) => void;
  handleTouchStart: (e: any) => void;
  handleTouchEnd: (e: any) => void;
  brightness: number;
  setBrightness: (b: number) => void;
  handleBrightnessClick: () => void;
  currentTime: Date;
  batteryLevel: number;
  isCharging: boolean;
  uploadedText: string;
  textSpeed: string;
  textColor: string;
  textSize: number;
}) => {
  const {
      menuState, setMenuState,
      isPowerSaving, togglePowerSave,
      volume, setVolume, handleVolumeClick,
      handleCameraClick, onPhotoCapture,
      pickupData, handlePickupClick,
      handleDeleteRequest, confirmDelete,
      handleLinkClick, handleQRCodeClick,
      handleCheerClick, cheerColorIndex, isCheerStrobe, setIsCheerStrobe, handleTouchStart, handleTouchEnd,
      brightness, setBrightness, handleBrightnessClick,
      currentTime,
      batteryLevel, isCharging,
      uploadedText, textSpeed, textColor, textSize
  } = props;

  const btnClass = "absolute w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:bg-white/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center text-white/90 z-20 group";
  const activeBtnClass = "absolute w-12 h-12 rounded-full bg-blue-500/80 backdrop-blur-md border border-white/30 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110 transition-all cursor-pointer flex items-center justify-center text-white z-20 group";
  const labelClass = "absolute -bottom-4 text-[9px] font-medium text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none";

  const menuItems = [
    { id: 'power', label: '省电', icon: <BatteryIcon />, action: togglePowerSave, active: isPowerSaving },
    { id: 'volume', label: '声音', icon: <SpeakerIcon />, action: handleVolumeClick },
    { id: 'camera', label: '相机', icon: <CameraIcon />, action: handleCameraClick },
    { id: 'pickup', label: '拾音', icon: <MicIcon />, action: handlePickupClick },
    { id: 'delete', label: '删除', icon: <TrashMenuIcon />, action: handleDeleteRequest, danger: true },
    { id: 'link', label: '链接', icon: <LinkIcon />, action: handleLinkClick },
    { id: 'cheer', label: '应援', icon: <CheerIcon />, action: handleCheerClick },
    { id: 'bright', label: '亮度', icon: <SunIcon />, action: handleBrightnessClick },
  ];

  const radius = 37;
  const totalItems = menuItems.length;

  // Camera Refs and State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    
    if (menuState === 'CAMERA') {
      // Small delay to allow fade in
      const timer = setTimeout(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(stream => {
             localStream = stream;
             if (videoRef.current) {
                 videoRef.current.srcObject = stream;
             }
          })
          .catch(err => console.error("Camera access failed", err));
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
    };
  }, [menuState]);

  const handleCapture = () => {
      if (!videoRef.current) return;
      
      // Flash effect
      setIsFlashActive(true);
      setTimeout(() => setIsFlashActive(false), 200);

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const url = canvas.toDataURL('image/png');
          onPhotoCapture(url);
      }
  };

  if (menuState !== 'MAIN') {
    return (
      <div className="w-full h-full absolute inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fadeIn">
          
          {menuState === 'DELETE_CONFIRM' && (
              <div className="flex flex-col items-center gap-6">
                  <div className="text-red-500 mb-2"><TrashIcon /></div>
                  <div className="text-white font-display text-lg">确认删除壁纸?</div>
                  <div className="flex gap-4 mt-4">
                      <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-red-900/40">删除</button>
                      <button onClick={() => setMenuState('MAIN')} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-full">取消</button>
                  </div>
              </div>
          )}

          {(menuState === 'BRIGHTNESS' || menuState === 'VOLUME') && (
              <div className="w-full px-8 flex flex-col items-center gap-8">
                  <div className="text-gray-400 uppercase tracking-widest font-bold text-sm">
                      {menuState === 'BRIGHTNESS' ? '屏幕亮度' : '系统音量'}
                  </div>
                  <div className="text-5xl font-display font-bold text-white tabular-nums">
                      {menuState === 'BRIGHTNESS' ? brightness : volume}%
                  </div>
                  
                  {/* Custom Slider */}
                  <div className="w-full h-12 bg-gray-800 rounded-full relative flex items-center px-2 cursor-pointer touch-none">
                       <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="20"
                          value={menuState === 'BRIGHTNESS' ? brightness : volume}
                          onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (menuState === 'BRIGHTNESS') setBrightness(val);
                              else setVolume(val);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                       />
                       {/* Visual Track */}
                       <div className="w-full h-2 bg-gray-700 rounded-full relative overflow-hidden">
                          <div 
                              className={`h-full ${menuState === 'BRIGHTNESS' ? 'bg-white' : 'bg-blue-500'} transition-all duration-200`} 
                              style={{ width: `${menuState === 'BRIGHTNESS' ? brightness : volume}%` }}
                          ></div>
                       </div>
                       {/* Thumb visual */}
                       <div 
                          className={`absolute h-8 w-8 rounded-full shadow-lg z-10 pointer-events-none transition-all duration-200 flex items-center justify-center ${menuState === 'BRIGHTNESS' ? 'bg-white text-black' : 'bg-blue-500 text-white'}`}
                          style={{ left: `calc(${menuState === 'BRIGHTNESS' ? brightness : volume}% - 16px)` }}
                       >
                          {menuState === 'BRIGHTNESS' ? <SunIcon /> : <SpeakerIcon />}
                       </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">左右滑动调节</div>
              </div>
          )}

          {menuState === 'CHEER' && (
               <div 
                 className={`w-full h-full cursor-pointer transition-colors duration-75 ${CHEER_COLORS[cheerColorIndex].tailwind} ${isCheerStrobe ? 'animate-strobe' : ''}`}
                 style={{ backgroundColor: CHEER_COLORS[cheerColorIndex].hex, opacity: isCheerStrobe ? undefined : 1 }}
                 onClick={() => setIsCheerStrobe(!isCheerStrobe)}
                 onTouchStart={handleTouchStart}
                 onTouchEnd={handleTouchEnd}
                 onMouseDown={handleTouchStart}
                 onMouseUp={handleTouchEnd}
               >
                 {/* Text and indicators removed for cleaner strobe look */}
               </div>
          )}

          {menuState === 'QRCODE' && (
               <div 
                 className="w-full h-full bg-black flex flex-col items-center justify-center p-6 cursor-pointer"
                 onClick={handleQRCodeClick}
                 onTouchStart={handleTouchStart}
                 onTouchEnd={handleTouchEnd}
                 onMouseDown={handleTouchStart}
                 onMouseUp={handleTouchEnd}
               >
                   <div className="bg-white p-3 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      <div className="w-32 h-32 bg-black pattern-grid-lg">
                          <div className="w-full h-full" style={{
                              backgroundImage: `conic-gradient(at 20px 20px, #000 90deg, #fff 90deg)`,
                              backgroundSize: '20px 20px'
                          }}></div>
                      </div>
                   </div>
                   <div className="text-sm text-gray-400 mt-6 font-display tracking-widest">SCAN ME</div>
               </div>
          )}
          
          {menuState === 'CAMERA' && (
              <div 
                  className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden cursor-pointer active:opacity-90 transition-opacity"
                  onClick={handleCapture}
              >
                  <video 
                     ref={videoRef}
                     autoPlay 
                     playsInline 
                     className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                  />

                  {/* Flash Overlay */}
                  <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200 ${isFlashActive ? 'opacity-100' : 'opacity-0'}`}></div>
              </div>
          )}

          {menuState === 'TEXT' && (
               <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden p-4">
                  <div 
                    className="whitespace-nowrap font-display font-bold animate-[marquee_5s_linear_infinite]"
                    style={{ 
                        color: textColor, 
                        fontSize: `${textSize}rem`,
                        animationDuration: textSpeed === 'slow' ? '10s' : (textSpeed === 'fast' ? '3s' : '6s')
                    }}
                  >
                     {uploadedText}
                  </div>
               </div>
          )}

          {menuState === 'PICKUP' && (
               <div className="w-full h-full bg-black flex items-center justify-center relative">
                  <div className="relative w-64 h-64 flex items-center justify-center">
                     {pickupData.map((val, i) => {
                        const angle = (i * (360 / 16));
                        const height = 20 + (val * 80); 
                        return (
                          <div 
                            key={i}
                            className="absolute w-3 bg-[#01fce9] rounded-full origin-bottom transition-all duration-75 shadow-[0_0_15px_#01fce9]"
                            style={{
                               height: `${height}px`,
                               transform: `rotate(${angle}deg) translateY(-50px)`,
                               opacity: 0.8
                            }}
                          ></div>
                        );
                     })}
                     <div className="w-24 h-24 rounded-full bg-gray-900 border border-white/10 z-10 flex items-center justify-center shadow-[0_0_30px_rgba(1,252,233,0.2)]">
                        <MicIcon className="w-8 h-8 text-white/80" />
                     </div>
                  </div>
               </div>
          )}
      </div>
    );
  }

  // --- MAIN MENU RENDERING ---
  return (
    <div className="w-full h-full relative z-20 animate-fadeIn bg-black/40">
      {menuItems.map((item, index) => {
        const angle = (index * (360 / totalItems)) - 90;
        const radian = (angle * Math.PI) / 180;
        const left = 50 + radius * Math.cos(radian);
        const top = 50 + radius * Math.sin(radian);

        const styleClass = item.active ? activeBtnClass : btnClass;
        const dangerStyle = item.danger ? 'border-red-400/30 hover:bg-red-500/20' : '';

        return (
          <div 
            key={item.id}
            className={`${styleClass} ${dangerStyle}`}
            style={{ 
              left: `${left}%`, 
              top: `${top}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={item.action}
          >
            {item.icon}
            <span className={`${labelClass} ${item.danger ? 'text-red-300' : ''}`}>{item.label}</span>
          </div>
        );
      })}
      
      {/* Central Dashboard (Clock & Status) - Only visible in MAIN menu now */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52%] h-[52%] flex items-center justify-center z-30 overflow-hidden bg-gray-200/5 backdrop-blur-xl rounded-full border border-white/10`}>
           <div className="text-center flex flex-col items-center animate-fadeIn w-full">
              <div className="text-4xl font-display font-bold text-white tracking-tighter drop-shadow-md">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className="text-[10px] text-blue-100/70 mt-1 uppercase tracking-widest font-medium font-sans">
                 {/* Date Format: MM月DD日 Weekday */}
                 {(currentTime.getMonth() + 1).toString().padStart(2, '0')}月{currentTime.getDate().toString().padStart(2, '0')}日 {WEEKDAYS[currentTime.getDay()]}
              </div>
              
              {/* Status Icons Row */}
              <div className="flex items-center justify-center gap-5 mt-5 opacity-90">
                 <SignalIcon className="w-4 h-4 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" />
                 <BluetoothIcon className="w-4 h-4 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" />
                 {/* Battery without text, scaled slightly to match visual weight */}
                 <div className="scale-110">
                    <BatteryDisplay level={batteryLevel} isCharging={isCharging} showText={false} />
                 </div>
              </div>
           </div>
      </div>
    </div>
  );
};

export default ScreenMenu;