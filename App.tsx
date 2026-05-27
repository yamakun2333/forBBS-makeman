
import React, { useState, useEffect, useRef } from 'react';
import { BadgeMode, LightColor, MenuState, Resource, ViewType } from './types';
import { initChat } from './services/geminiService';
import { 
    BATTERY_COLORS, CHEER_COLORS, AI_SLOTS, VIEW_NAMES, getThemeClasses, WHITE_NOISE_TYPES
} from './constants';
import { 
    SunIcon, MoonIcon, HelpIcon, BellIcon, ChevronDownIcon, ChevronUpIcon, UploadIcon
} from './components/Icons';
import { BatteryLevelControl, HelpModal, Wallpaper, ViewIcon } from './components/BadgeUi';
import ChatComp, { ChatCompHandle } from './components/ChatComp';
import ScreenMenu from './components/ScreenMenu';
import { BottomPanels } from './components/panels/BottomPanels';
import { AiResourcePanel } from './components/panels/AiResourcePanel';

const MockKeyboard = () => (
    <div className="w-full bg-[#d1d5db] pt-1.5 pb-[34px] px-1.5 flex flex-col gap-1.5 shrink-0 pointer-events-none">
        <div className="flex gap-1.5 h-[46px]">
            <div className="flex-1 bg-[#ffffff] rounded-[5px] flex items-center justify-center text-[24px] text-black shadow-[0_1px_0_rgba(0,0,0,0.3)]">1</div>
            <div className="flex-1 bg-[#ffffff] rounded-[5px] flex flex-col items-center justify-center text-black shadow-[0_1px_0_rgba(0,0,0,0.3)]">
                <span className="text-[22px] leading-none mt-1">2</span>
                <span className="text-[9px] font-semibold tracking-widest mt-0.5">ABC</span>
            </div>
            <div className="flex-1 bg-[#ffffff] rounded-[5px] flex flex-col items-center justify-center text-black shadow-[0_1px_0_rgba(0,0,0,0.3)]">
                <span className="text-[22px] leading-none mt-1">3</span>
                <span className="text-[9px] font-semibold tracking-widest mt-0.5">DEF</span>
            </div>
        </div>
        <div className="flex gap-1.5 h-[46px]">
            <div className="flex-1 bg-[#ffffff] rounded-[5px] flex flex-col items-center justify-center text-black shadow-[0_1px_0_rgba(0,0,0,0.3)]">
                <span className="text-[22px] leading-none mt-1">4</span>
                <span className="text-[9px] font-semibold tracking-widest mt-0.5">GHI</span>
            </div>
            <div className="flex-1 bg-[#ffffff] rounded-[5px] flex flex-col items-center justify-center text-black shadow-[0_1px_0_rgba(0,0,0,0.3)]">
                <span className="text-[22px] leading-none mt-1">5</span>
                <span className="text-[9px] font-semibold tracking-widest mt-0.5">JKL</span>
            </div>
            <div className="flex-1 bg-[#ffffff] rounded-[5px] flex flex-col items-center justify-center text-black shadow-[0_1px_0_rgba(0,0,0,0.3)]">
                <span className="text-[22px] leading-none mt-1">6</span>
                <span className="text-[9px] font-semibold tracking-widest mt-0.5">MNO</span>
            </div>
        </div>
        <div className="flex gap-1.5 h-[46px]">
            <div className="flex-1 bg-[#ffffff] rounded-[5px] flex flex-col items-center justify-center text-black shadow-[0_1px_0_rgba(0,0,0,0.3)]">
                <span className="text-[22px] leading-none mt-1">7</span>
                <span className="text-[9px] font-semibold tracking-widest mt-0.5">PQRS</span>
            </div>
            <div className="flex-1 bg-[#ffffff] rounded-[5px] flex flex-col items-center justify-center text-black shadow-[0_1px_0_rgba(0,0,0,0.3)]">
                <span className="text-[22px] leading-none mt-1">8</span>
                <span className="text-[9px] font-semibold tracking-widest mt-0.5">TUV</span>
            </div>
            <div className="flex-1 bg-[#ffffff] rounded-[5px] flex flex-col items-center justify-center text-black shadow-[0_1px_0_rgba(0,0,0,0.3)]">
                <span className="text-[22px] leading-none mt-1">9</span>
                <span className="text-[9px] font-semibold tracking-widest mt-0.5">WXYZ</span>
            </div>
        </div>
        <div className="flex gap-1.5 h-[46px]">
            <div className="flex-1 flex justify-center items-center"></div>
            <div className="flex-1 bg-[#ffffff] rounded-[5px] flex flex-col items-center justify-center text-[24px] text-black shadow-[0_1px_0_rgba(0,0,0,0.3)]">0</div>
            <div className="flex-1 flex flex-col items-center justify-center text-black">
                <svg className="w-[26px] h-[26px] pr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 4H8l-7 8 7 8h13c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-2.4 11.2L15 11.6l-3.6 3.6-1.4-1.4 3.6-3.6-3.6-3.6 1.4-1.4 3.6 3.6 3.6-3.6 1.4 1.4-3.6 3.6 3.6 3.6-1.4 1.4z"/>
                </svg>
            </div>
        </div>
    </div>
);

export default function App() {
  const [mode, setMode] = useState<BadgeMode>(BadgeMode.OFF);
  const [previousMode, setPreviousMode] = useState<BadgeMode | null>(null);
  const [lightColor, setLightColor] = useState<LightColor>(LightColor.CYAN);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('FRONT');
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [isCharging, setIsCharging] = useState(false);
  
  // System State
  const [isFirstBoot, setIsFirstBoot] = useState(true);
  const [brightness, setBrightness] = useState(80); 
  const [volume, setVolume] = useState(60); 
  const [isPowerSaving, setIsPowerSaving] = useState(false);
  const [isScreenOff, setIsScreenOff] = useState(false); // New state for screen off (sleep) with persistence
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // New States for Features
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const [phoneActivePage, setPhoneActivePage] = useState<'HOME' | 'CUSTOM_CHAR_FORM' | 'EXPRESSION_FORM' | 'IMPORT_PROGRESS'>('CUSTOM_CHAR_FORM');
  const [isCharNoticeOpen, setIsCharNoticeOpen] = useState(true);

  // Import State
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCharacterImported, setIsCharacterImported] = useState(false);

  const handleImportMemory = () => {
      // Set resources
      const newAiResources: Record<number, Resource> = {};
      expressions.forEach(exp => {
          if (exp.generatedImages.length > 0 && exp.slotId) {
             const imgUrl = exp.generatedImages[exp.generatedImages.length - 1];
             newAiResources[exp.slotId] = {
                 id: `custom_exp_${exp.id}`,
                 type: imgUrl.endsWith('.mp4') ? 'video' : 'image',
                 url: imgUrl,
                 name: exp.label
             };
          }
      });
      setAiResources(newAiResources);
      
      setImportProgress(0);
      setIsImportModalOpen(true);

      let currentProgress = 0;
      const interval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 6) + 2;
          if (currentProgress >= 100) {
              currentProgress = 100;
              clearInterval(interval);
              setIsCharacterImported(true);
          }
          setImportProgress(currentProgress);
      }, 300);
  };

  // App Feature States
  const [cheerColorIndex, setCheerColorIndex] = useState(0);
  const [isCheerStrobe, setIsCheerStrobe] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [isCameraFlashing, setIsCameraFlashing] = useState(false);
  
  const [uploadedText, setUploadedText] = useState("BBS 电子徽章");
  const [textSpeed, setTextSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState(2); 
  
  const [pickupData, setPickupData] = useState<number[]>(new Array(16).fill(0));

  // Resource & Wallpaper State
  const [history, setHistory] = useState<Resource[]>([]);
  const [activeResourceId, setActiveResourceId] = useState<string | null>(null);
  const [draggedResource, setDraggedResource] = useState<Resource | null>(null);

  // AI Resources State 
  const [aiResources, setAiResources] = useState<Record<number, Resource>>({});
  const [activeAiResourceId, setActiveAiResourceId] = useState<string | null>(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [pendingGiftSlotId, setPendingGiftSlotId] = useState<number | null>(null);
  
  // White Noise Audio Resources
  const [whiteNoiseAudios, setWhiteNoiseAudios] = useState<Record<string, string>>({});
  const [isNoisePanelOpen, setIsNoisePanelOpen] = useState(false);

  // NFC Return State Ref
  const nfcReturnState = useRef<{ mode: BadgeMode, aiId: string | null } | null>(null);

  // Carousel State
  const [carouselEnabled, setCarouselEnabled] = useState(false);
  const [carouselSpeed, setCarouselSpeed] = useState(3);
  const [tempSpeed, setTempSpeed] = useState(3);

  // Menu Interaction State
  const [menuState, setMenuState] = useState<MenuState>('MAIN');

  // Chat State
  const [chatStatus, setChatStatus] = useState<'IDLE' | 'LISTENING' | 'SPEAKING'>('IDLE');
  
  // Animation State
  const [aiPreloading, setAiPreloading] = useState(false);
  // Custom Character Forms
  const [characterName, setCharacterName] = useState('');
  const [characterIntro, setCharacterIntro] = useState('');
  const [characterSetting, setCharacterSetting] = useState('');
  const [isNamePopupOpen, setIsNamePopupOpen] = useState(false);
  const [isIntroPopupOpen, setIsIntroPopupOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorType, setEditorType] = useState<'intro' | 'setting'>('intro');
  const [tempEditorText, setTempEditorText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempIntro, setTempIntro] = useState('');
  
  const [isGenerateWarningOpen, setIsGenerateWarningOpen] = useState(false);
  const [generateTarget, setGenerateTarget] = useState<'intro' | 'setting' | null>(null);

  const [characterGender, setCharacterGender] = useState<string | null>(null);
  const [isGenderPopupOpen, setIsGenderPopupOpen] = useState(false);
  
  const [characterRelationship, setCharacterRelationship] = useState<string | null>(null);
  const [tempRelationship, setTempRelationship] = useState(''); // for custom input
  const [isRelationshipPopupOpen, setIsRelationshipPopupOpen] = useState(false);

  const [characterTags, setCharacterTags] = useState<string[]>([]);
  const [isTagsPopupOpen, setIsTagsPopupOpen] = useState(false);

  const [characterSkills, setCharacterSkills] = useState<string[]>([]);
  const [isSkillsPopupOpen, setIsSkillsPopupOpen] = useState(false);

  const [characterVoice, setCharacterVoice] = useState<string | null>(null);
  const [isVoicePopupOpen, setIsVoicePopupOpen] = useState(false);
  const [voiceTab, setVoiceTab] = useState<'female' | 'male'>('female');

  // Expression Page State
  const [expressionSelectedId, setExpressionSelectedId] = useState<string | null>(null);
  const [expressions, setExpressions] = useState<any[]>([
    { id: 'wait', label: '等待', isLocked: false, status: 'none', generatedImages: [], generateCount: 0, slotId: 1 },
    { id: 'speak', label: '说话', isLocked: false, status: 'none', generatedImages: [], generateCount: 0, slotId: 8 },
    { id: 'bored1', label: '无聊', isLocked: false, status: 'none', generatedImages: [], generateCount: 0, slotId: 16 },
    { id: 'pat', label: '摸摸头', isLocked: false, status: 'none', generatedImages: [], generateCount: 0, slotId: 2 },
    { id: 'happy', label: '开心', isLocked: true, status: 'none', generatedImages: [], generateCount: 0, slotId: 4 },
    { id: 'angry', label: '生气', isLocked: true, status: 'none', generatedImages: [], generateCount: 0, slotId: 5 },
    { id: 'sad', label: '悲伤', isLocked: true, status: 'none', generatedImages: [], generateCount: 0, slotId: 7 },
    { id: 'surprise', label: '惊讶', isLocked: true, status: 'none', generatedImages: [], generateCount: 0, slotId: 6 },
    { id: 'shy', label: '休息', isLocked: true, status: 'none', generatedImages: [], generateCount: 0, slotId: 18 },
    { id: 'pinch', label: '捏脸', isLocked: true, status: 'none', generatedImages: [], generateCount: 0, slotId: 3 },
  ]);
  const [isGeneratingAction, setIsGeneratingAction] = useState(false);

  const handleGenerateAction = async () => {
    setIsGeneratingAction(true);
    
    const selectedExp = expressions.find(e => e.id === expressionSelectedId);
    if (!selectedExp) {
        setIsGeneratingAction(false);
        return;
    }

    try {
        const response = await fetch('/api/generate-expression-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                expressionId: expressionSelectedId,
                label: selectedExp.label,
                imageBase64: customAvatarUrl || ''
            })
        });

        if (!response.ok) throw new Error('API Request failed');
        const data = await response.json();

        setExpressions(prev => prev.map(exp => {
            if (exp.id === expressionSelectedId) {
                return {
                    ...exp,
                    generateCount: exp.generateCount + 1,
                    generatedImages: [...exp.generatedImages, data.resultUrl || 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?w=500&h=500&fit=crop']
                };
            }
            return exp;
        }));
    } catch (error) {
        console.error("Error generating action:", error);
        alert("动作生成失败，请重试");
    } finally {
        setIsGeneratingAction(false);
    }
  };

  const [aiExitPreloading, setAiExitPreloading] = useState(false);
  const [isFindingDevice, setIsFindingDevice] = useState(false);

  // Custom Character Avatar
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomAvatarUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Swipe State
  const touchStartX = useRef<number | null>(null);

  const handleGenerateContent = async (type: 'intro' | 'setting') => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          name: characterName,
          gender: characterGender,
          imageBase64: customAvatarUrl
        })
      });
      if (!response.ok) {
        throw new Error((await response.json()).error || 'Failed to generate');
      }
      const data = await response.json();
      if (type === 'intro') {
        setTempIntro(data.text);
      } else {
        setTempEditorText(data.text);
      }
    } catch (e: any) {
      alert("智能生成失败：" + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Long press logic
  const timerRef = useRef<number | null>(null);
  const aiAnimTimerRef = useRef<number | null>(null);
  const powerTimerRef = useRef<number | null>(null);
  const isPowerLongPress = useRef(false);
  const isPowerBtnPressed = useRef(false);

  // Chat Comp Ref
  const chatRef = useRef<ChatCompHandle>(null);

  // Audio Context for Pickup
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Initialize Gemini
  useEffect(() => {
    initChat();
  }, []);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast Timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Power Saving Reset on Shutdown
  useEffect(() => {
    if (mode === BadgeMode.OFF) {
      setIsPowerSaving(false);
      setIsScreenOff(false);
    }
  }, [mode]);

  // Carousel Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (carouselEnabled && history.length > 0 && mode === BadgeMode.IDLE && !isScreenOff) {
      interval = setInterval(() => {
        setActiveResourceId(prevId => {
          const currentIndex = history.findIndex(r => r.id === prevId);
          const nextIndex = (currentIndex + 1) % history.length;
          return history[nextIndex].id;
        });
      }, carouselSpeed * 1000);
    }
    return () => clearInterval(interval);
  }, [carouselEnabled, history, carouselSpeed, mode, isScreenOff]);

  // Reset to first AI Resource (Default / Slot 1) or Pending Gift when entering chat
  useEffect(() => {
    if (mode === BadgeMode.CHAT_ENTERING) {
      if (pendingGiftSlotId && aiResources[pendingGiftSlotId]) {
         setActiveAiResourceId(aiResources[pendingGiftSlotId].id);
      } else if (aiResources[1]) {
        setActiveAiResourceId(aiResources[1].id);
      } else {
        setActiveAiResourceId(null);
      }
    }
    
    // Clear pending gift when entering CHAT mode
    if (mode === BadgeMode.CHAT && pendingGiftSlotId) {
        setPendingGiftSlotId(null);
    }
    
    // Reset Chat Menu when entering/exiting chat
    if (mode !== BadgeMode.CHAT) {
        setIsChatMenuOpen(false);
    }
  }, [mode, aiResources, pendingGiftSlotId]);

  // Update lights based on mode and Power Saving
  useEffect(() => {
    // Priority 1: Screen Off (unless charging logic overrides, lights usually off)
    if (isScreenOff && !isCharging) {
        setLightColor(LightColor.OFF);
        return;
    }

    // Priority 2: Power Saving
    if (isPowerSaving && mode !== BadgeMode.BOOTING && mode !== BadgeMode.SHUTTING_DOWN) {
      setLightColor(LightColor.OFF);
      return;
    }

    switch (mode) {
      case BadgeMode.OFF:
      case BadgeMode.SLEEP:
        setLightColor(LightColor.OFF);
        break;
      case BadgeMode.BOOTING:
      case BadgeMode.IDLE:
        setLightColor(LightColor.CYAN);
        break;
      case BadgeMode.SHUTTING_DOWN:
        setLightColor(LightColor.RED);
        break;
      case BadgeMode.MENU:
        setLightColor(LightColor.WHITE);
        break;
      case BadgeMode.CHAT:
        setLightColor(LightColor.WHITE); 
        break;
      case BadgeMode.CHAT_ENTERING:
      case BadgeMode.CHAT_EXITING:
         setLightColor(LightColor.WHITE);
         break;
    }
  }, [mode, isPowerSaving, isScreenOff, isCharging]);

  // Handle Boot and Shutdown Animation Timers
  useEffect(() => {
    if (mode === BadgeMode.BOOTING) {
      setIsScreenOff(false); // Ensure screen is on when booting
      const timer = setTimeout(() => {
        if (isFirstBoot) {
          setMode(BadgeMode.MENU);
          setMenuState('QRCODE');
        } else {
          setMode(BadgeMode.IDLE);
          setToastMessage("系统就绪");
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
    if (mode === BadgeMode.SHUTTING_DOWN) {
      setIsScreenOff(false); // Ensure screen is on to show shutdown anim
      const timer = setTimeout(() => {
        setMode(BadgeMode.OFF);
      }, 2500);
      return () => clearTimeout(timer);
    }
    
    if (mode === BadgeMode.CHAT_ENTERING) {
      if (aiResources[11]?.type === 'video') return;
      const timer = setTimeout(() => setMode(BadgeMode.CHAT), 2000);
      return () => clearTimeout(timer);
    }
    if (mode === BadgeMode.CHAT_EXITING) {
      if (aiResources[12]?.type === 'video') return;
      const timer = setTimeout(() => setMode(BadgeMode.IDLE), 2000);
      return () => clearTimeout(timer);
    }
  }, [mode, aiResources]); 

  // Pickup Audio Logic
  useEffect(() => {
    if (menuState === 'PICKUP' && mode === BadgeMode.MENU && !isScreenOff) {
      const startAudio = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Media Devices not supported");
          }

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const analyser = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          
          analyser.fftSize = 64;
          source.connect(analyser);
          
          analyserRef.current = analyser;
          audioContextRef.current = audioCtx;
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

          const update = () => {
             if (!analyserRef.current || !dataArrayRef.current) return;
             analyserRef.current.getByteFrequencyData(dataArrayRef.current);
             const bars = [];
             const step = Math.floor(dataArrayRef.current.length / 16);
             for(let i=0; i<16; i++) {
               bars.push(dataArrayRef.current[i * step] / 255);
             }
             setPickupData(bars);
             rafIdRef.current = requestAnimationFrame(update);
          };
          update();

        } catch (e) {
          console.error("Audio pickup failed", e);
          setToastMessage("模拟拾音模式");
          
          // Simulated Pickup Visualizer Fallback
          const updateSimulation = () => {
             const bars = [];
             const time = Date.now() / 150;
             for(let i=0; i<16; i++) {
               // Generate dynamic wave-like patterns with randomness
               const value = (Math.sin(time + i * 0.5) + 1) * 0.3 + Math.random() * 0.4;
               bars.push(Math.min(1, Math.max(0.1, value)));
             }
             setPickupData(bars);
             rafIdRef.current = requestAnimationFrame(updateSimulation);
          };
          updateSimulation();
        }
      };
      startAudio();
    } else {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
      }
    }

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (audioContextRef.current) {
         audioContextRef.current.close().catch(() => {});
         audioContextRef.current = null;
      }
    };
  }, [menuState, mode, isScreenOff]);

  // Reset menu state when exiting menu
  useEffect(() => {
    if (mode !== BadgeMode.MENU) {
      setMenuState('MAIN');
    }
  }, [mode]);

  // --- Handlers ---

  const handlePowerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isPowerBtnPressed.current = true;
    isPowerLongPress.current = false;
    
    powerTimerRef.current = window.setTimeout(() => {
      if (!isPowerBtnPressed.current) return;
      isPowerLongPress.current = true;
      setIsScreenOff(false); // Force screen on for animation
      setMode(prev => {
        if (prev === BadgeMode.OFF) return BadgeMode.BOOTING;
        else if (prev !== BadgeMode.BOOTING && prev !== BadgeMode.SHUTTING_DOWN) return BadgeMode.SHUTTING_DOWN;
        return prev;
      });
      if (navigator.vibrate) navigator.vibrate(200);
    }, 2000); 
  };

  const handlePowerUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isPowerBtnPressed.current) return;
    isPowerBtnPressed.current = false;

    if (powerTimerRef.current) {
      clearTimeout(powerTimerRef.current);
      powerTimerRef.current = null;
    }

    if (!isPowerLongPress.current) {
       // Short Press Logic: Toggle Screen Off/On if system is active
       if (mode !== BadgeMode.OFF && mode !== BadgeMode.BOOTING && mode !== BadgeMode.SHUTTING_DOWN && mode !== BadgeMode.CHAT_ENTERING && mode !== BadgeMode.CHAT_EXITING) {
           setIsScreenOff(prev => !prev);
       }
    }
  };

  const handleFuncClick = () => {
    if (isScreenOff) return; // Ignore input if screen is off
    if ([BadgeMode.OFF, BadgeMode.SLEEP, BadgeMode.BOOTING, BadgeMode.SHUTTING_DOWN, BadgeMode.CHAT_ENTERING, BadgeMode.CHAT_EXITING].includes(mode)) return;
    
    if (mode === BadgeMode.CHAT) {
        if (chatRef.current && chatRef.current.handleMenuPress()) {
            return; 
        }
        setIsChatMenuOpen(prev => !prev);
        return;
    }

    if (mode === BadgeMode.MENU) {
      if (menuState !== 'MAIN') {
        setMenuState('MAIN'); 
      } else {
        if (previousMode === BadgeMode.CHAT) {
          setMode(BadgeMode.CHAT);
          setPreviousMode(null);
        } else {
          setMode(BadgeMode.IDLE);
          setPreviousMode(null);
        }
      }
    } else {
      setPreviousMode(mode);
      setMode(BadgeMode.MENU);
    }
  };

  const startAiLongPress = () => {
    if (isScreenOff) return;
    if (mode === BadgeMode.OFF || mode === BadgeMode.SLEEP || mode === BadgeMode.BOOTING || mode === BadgeMode.SHUTTING_DOWN || mode === BadgeMode.CHAT_ENTERING || mode === BadgeMode.CHAT_EXITING) return;
    
    if (mode === BadgeMode.CHAT) {
        aiAnimTimerRef.current = window.setTimeout(() => {
            setAiExitPreloading(true);
        }, 1000);

        timerRef.current = window.setTimeout(() => {
            setMode(BadgeMode.CHAT_EXITING);
            if (navigator.vibrate) navigator.vibrate(100);
            setAiExitPreloading(false); 
        }, 3000);
        return;
    }

    aiAnimTimerRef.current = window.setTimeout(() => {
        setAiPreloading(true);
    }, 1000);

    timerRef.current = window.setTimeout(() => {
      setMode(prev => prev === BadgeMode.CHAT ? BadgeMode.CHAT_EXITING : BadgeMode.CHAT_ENTERING);
      if (navigator.vibrate) navigator.vibrate(100);
      setAiPreloading(false); 
    }, 3000);
  };

  const endAiLongPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (aiAnimTimerRef.current) {
      clearTimeout(aiAnimTimerRef.current);
      aiAnimTimerRef.current = null;
    }
    setAiPreloading(false);
    setAiExitPreloading(false);
  };

  // Menu Logic Handlers
  const togglePowerSave = () => {
    if (!isPowerSaving) {
      setIsPowerSaving(true);
      setToastMessage("进入节能模式");
      setMode(previousMode || BadgeMode.IDLE); 
    } else {
      setIsPowerSaving(false);
      setToastMessage("退出节能模式");
    }
  };

  const handleCheerClick = () => setMenuState('CHEER');
  const handleLinkClick = () => setMenuState('QRCODE');
  const handleQRCodeClick = () => {
    if (isFirstBoot) {
      setIsFirstBoot(false);
      setToastMessage("配对完成");
      setMode(BadgeMode.IDLE);
    }
  };
  const handleCameraClick = () => setMenuState('CAMERA');
  const handlePickupClick = () => setMenuState('PICKUP');
  const handleDeleteRequest = () => setMenuState('DELETE_CONFIRM');
  const handleBrightnessClick = () => setMenuState('BRIGHTNESS');
  const handleVolumeClick = () => setMenuState('VOLUME');
  
  const handleGiftClick = (type: 'A_LOW' | 'A_HIGH' | 'B') => {
      const slot = type === 'B' ? 10 : 9;
      setPendingGiftSlotId(slot);
      setToastMessage(`已赠送${type === 'B' ? '专属礼物' : '礼物'}，请进入AI互动`);
  };

  const confirmDelete = () => {
    setActiveResourceId(null);
    setMenuState('MAIN');
    setToastMessage("壁纸已清除");
    setMode(BadgeMode.IDLE);
  };

  // Simulation Handlers
  const handleFindDevice = () => {
    setIsFindingDevice(true);
    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    setTimeout(() => setIsFindingDevice(false), 5000);
  };

  const handleSimulateAlarm = () => {
      if (aiResources[14]) {
          setMode(BadgeMode.CHAT);
          setActiveAiResourceId(aiResources[14].id);
      } else {
          setToastMessage("模拟闹钟触发 (请先上传资源至 Slot 14)");
      }
  };

  const handleSimulateSchedule = () => {
      if (aiResources[15]) {
          setMode(BadgeMode.CHAT);
          setActiveAiResourceId(aiResources[15].id);
      } else {
          setToastMessage("模拟日程提醒 (请先上传资源至 Slot 15)");
      }
  };
  
  const handleSimulateMessage = () => {
      if (aiResources[13]) {
          setMode(BadgeMode.CHAT);
          setActiveAiResourceId(aiResources[13].id);
      } else {
          setToastMessage("模拟收到信息 (请先上传资源至 Slot 13)");
      }
  };

  // NFC Logic
  const handleNfcTrigger = (slotId: number, name: string, color: LightColor) => {
      setToastMessage(`🔮 已识别智能外壳: [${name}]`);
      setLightColor(color);
      if (navigator.vibrate) navigator.vibrate(100);
      
      if (aiResources[slotId]) {
          if (isScreenOff) setIsScreenOff(false); // Wake up if using NFC while screen is off
          
          // Save current state before switching to NFC logic
          nfcReturnState.current = {
              mode: mode,
              aiId: activeAiResourceId
          };

          setMode(BadgeMode.CHAT);
          setActiveAiResourceId(aiResources[slotId].id);
      } else {
          setToastMessage(`请先为 [${name}] (Slot ${slotId}) 上传资源`);
      }
  };

  const handleNfcComplete = () => {
      if (nfcReturnState.current) {
          setMode(nfcReturnState.current.mode);
          setActiveAiResourceId(nfcReturnState.current.aiId);
          // Don't clear immediately if you want smoother transitions, but here strict return is requested.
          nfcReturnState.current = null;
      } else {
          // Fallback if no state saved
          setMode(BadgeMode.IDLE);
          setActiveAiResourceId(null);
      }
  };

  const handleNoiseUpload = (e: React.ChangeEvent<HTMLInputElement>, typeId: string) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      setWhiteNoiseAudios(prev => ({
          ...prev,
          [typeId]: url
      }));
      setToastMessage(`${WHITE_NOISE_TYPES.find(t => t.id === typeId)?.name} 音频已更新`);
  };

  // Helper to add resource
  const addResourceToHistory = (url: string, type: 'image' | 'video', name: string) => {
    const newResource: Resource = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      type,
      url,
      name
    };
    setHistory(prev => [newResource, ...prev].slice(0, 10));
    setActiveResourceId(newResource.id);
    if(mode === BadgeMode.SLEEP) setMode(BadgeMode.IDLE);
  };

  const handlePhotoCapture = (dataUrl: string) => {
      if (navigator.vibrate) navigator.vibrate(50);
      setIsCameraFlashing(true);
      setTimeout(() => setIsCameraFlashing(false), 150);
  };

  const handleImageGeneration = (url: string, name: string) => {
    addResourceToHistory(url, 'image', name);
    setMode(BadgeMode.IDLE);
    setToastMessage("图片生成成功");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 100 * 1024 * 1024; // Increased to 100MB
    if (file.size > MAX_SIZE) {
      setToastMessage("资源过大，请压缩至100MB内");
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);

    if (isVideo) {
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      
      let resolved = false;
      const resolve = () => {
          if (resolved) return;
          resolved = true;
          setToastMessage("导入成功");
          addResourceToHistory(url, 'video', file.name);
      };

      // Try to load metadata to ensure validity, but don't block forever
      tempVideo.onloadedmetadata = resolve;
      tempVideo.onerror = () => {
          console.warn("Video metadata check failed, adding anyway");
          resolve();
      };
      
      tempVideo.src = url;
      
      // Fallback timeout in case browser doesn't trigger events for disconnected element
      setTimeout(resolve, 500);
    } else {
      setToastMessage("导入成功");
      addResourceToHistory(url, 'image', file.name);
    }
  };

  const handleAiFileUpload = (e: React.ChangeEvent<HTMLInputElement> | null, slotId: number, explicitFile?: File) => {
      const file = explicitFile || e?.target.files?.[0];
      if (!file) return;
      
      const isVideo = file.type.startsWith('video/');
      const url = URL.createObjectURL(file);
      
      const newResource: Resource = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        type: isVideo ? 'video' : 'image',
        url,
        name: file.name
      };
      
      setAiResources(prev => ({
        ...prev,
        [slotId]: newResource
      }));
      
      if (slotId === 1 && !activeAiResourceId) {
         setActiveAiResourceId(newResource.id);
      }
      setToastMessage(`AI 资源 ${slotId} 已添加`);
  };

  const handleAiResourceDelete = (slotId: number, e: React.MouseEvent) => {
     e.stopPropagation();
     const resource = aiResources[slotId];
     if (!resource) return;

     setAiResources(prev => {
        const next = { ...prev };
        delete next[slotId];
        return next;
     });
     
     if (activeAiResourceId === resource.id) {
         setActiveAiResourceId(null);
     }
  };

  const handleDragStart = (e: React.DragEvent, resource: Resource) => {
    setDraggedResource(resource);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => setDraggedResource(null);

  const handleDropDelete = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedResource) {
      setHistory(prev => prev.filter(r => r.id !== draggedResource.id));
      if (activeResourceId === draggedResource.id) setActiveResourceId(null);
      setToastMessage("资源已删除");
      setDraggedResource(null);
    }
  };

  // Swipe Handlers for Cheer/Wallpaper
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ((mode !== BadgeMode.IDLE && menuState !== 'CHEER') || carouselEnabled || isScreenOff) return;
    const x = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    touchStartX.current = x;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX.current === null) return;
    const x = 'changedTouches' in e ? (e as React.TouchEvent).changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = touchStartX.current - x;
    touchStartX.current = null;

    if (Math.abs(diff) > 50) { 
      if (menuState === 'CHEER') {
         if (diff > 0) setCheerColorIndex(prev => (prev + 1) % CHEER_COLORS.length);
         else setCheerColorIndex(prev => (prev - 1 + CHEER_COLORS.length) % CHEER_COLORS.length);
      } else if (mode === BadgeMode.IDLE && history.length > 1) {
         if (diff > 0) setActiveResourceId(prevId => {
            const idx = history.findIndex(r => r.id === prevId);
            return history[(idx + 1) % history.length].id;
         });
         else setActiveResourceId(prevId => {
            const idx = history.findIndex(r => r.id === prevId);
            return history[(idx - 1 + history.length) % history.length].id;
         });
      }
    }
  };

  const activeResource = history.find(r => r.id === activeResourceId);
  const activeAiResource = (Object.values(aiResources) as Resource[]).find(r => r.id === activeAiResourceId);

  // --- Main Render ---
  
  const getLightStripStyle = () => {
    // Priority: Camera Flash
    if (isCameraFlashing) {
        return { borderColor: '#FFFFFF', boxShadow: '0 0 20px 5px white' };
    }

    if ((mode === BadgeMode.IDLE && !isPowerSaving && !isScreenOff) || ((mode === BadgeMode.OFF || mode === BadgeMode.SLEEP || isScreenOff) && isCharging)) {
       let color = BATTERY_COLORS.HIGH;
       if (batteryLevel <= 20) color = BATTERY_COLORS.LOW;
       else if (batteryLevel <= 60) color = BATTERY_COLORS.MID;
       return { borderColor: color };
    }
    return {};
  };

  const getLightStripClass = () => {
    // Priority: Camera Flash (Immediate, High Intensity)
    if (isCameraFlashing) {
        return `absolute inset-0 rounded-full blur-md border-[10px] border-white opacity-100 transition-none`;
    }

    // Priority: Camera Mode (Lights Off when previewing)
    if (mode === BadgeMode.MENU && menuState === 'CAMERA') {
        return 'opacity-0 transition-opacity duration-300';
    }

    // If screen is off and not charging, lights are usually off
    if (isScreenOff && !isCharging) return 'opacity-0';

    if (mode === BadgeMode.MENU && menuState === 'CHEER') return 'opacity-0';
    if (isPowerSaving && mode !== BadgeMode.BOOTING && mode !== BadgeMode.SHUTTING_DOWN) return 'opacity-0';

    const chargingAnim = (isCharging && batteryLevel < 100) ? "animate-breathe-slow" : "";

    if (mode === BadgeMode.OFF || mode === BadgeMode.SLEEP) {
        if (isCharging) {
            return `absolute inset-0 rounded-full blur-md transition-all duration-700 ease-out border-[10px] opacity-80 ${chargingAnim}`;
        }
        return 'opacity-0';
    }

    let baseClass = `absolute inset-0 rounded-full blur-md transition-all duration-700 ease-out `;
    
    if (mode === BadgeMode.CHAT_ENTERING) return `absolute inset-0 rounded-full blur-md opacity-100 animate-spin-once bg-[conic-gradient(from_0deg,transparent_0%,white_50%,transparent_100%)]`;
    if (mode === BadgeMode.CHAT_EXITING) return `absolute inset-0 rounded-full blur-md opacity-100 animate-spin-once bg-[conic-gradient(from_0deg,transparent_0%,#01fce9_50%,transparent_100%)]`;

    if (mode === BadgeMode.CHAT) {
       if (aiExitPreloading) return 'opacity-0'; 
       
       if (chatStatus === 'LISTENING') return baseClass + `border-[10px] border-white opacity-100`;
       else if (chatStatus === 'SPEAKING') return baseClass + `border-[10px] border-white opacity-100 animate-breathe-fast`;
       return baseClass + `border-[10px] border-white opacity-60`;
    }
    
    if (mode === BadgeMode.IDLE) {
        return baseClass + `border-[10px] opacity-80 ${chargingAnim}`;
    }
    
    const color = lightColor.replace('border-', 'border-'); 
    return baseClass + `border-[10px] ${color} opacity-80`;
  };

  const chargingAnim = (isCharging && batteryLevel < 100) ? "animate-breathe-slow" : "";
  const batteryInfoColor = batteryLevel <= 20 ? BATTERY_COLORS.LOW : (batteryLevel <= 60 ? BATTERY_COLORS.MID : BATTERY_COLORS.HIGH);
  const themeClasses = getThemeClasses(isDarkMode);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans selection:bg-blue-500/30 overflow-hidden relative transition-colors duration-500 ${themeClasses.bg}`}>
      
      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} isDarkMode={isDarkMode} />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-900/10 to-purple-900/10 rounded-full blur-3xl transition-opacity duration-1000 ${mode === BadgeMode.OFF ? 'opacity-0' : 'opacity-100'}`}></div>
      </div>

      {/* Top Right Controls (Theme & Help) */}
      <div className="fixed top-8 right-8 z-[55] flex items-center gap-3">
         <button 
           onClick={() => setIsDarkMode(!isDarkMode)} 
           className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 border ${themeClasses.panelBgStrong} ${themeClasses.iconBase}`}
           title="切换主题"
         >
           {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
         </button>
         <button 
           onClick={() => setIsHelpOpen(true)}
           className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 border ${themeClasses.panelBgStrong} ${themeClasses.iconBase}`}
           title="使用帮助"
         >
            <HelpIcon className="w-5 h-5" />
         </button>
      </div>

      {/* View Switcher */}
      <div className={`fixed top-1/2 left-0 -translate-y-1/2 z-50 flex items-center transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isLeftPanelOpen ? 'translate-x-0' : '-translate-x-[calc(100%-24px)]'}`}>
         <div className={`flex flex-col gap-3 backdrop-blur-md p-2 rounded-r-2xl border-y border-r transition-colors duration-300 ${themeClasses.panelBg}`}>
           {(['LEFT', 'FRONT', 'RIGHT', 'BACK'] as ViewType[]).map((view) => (
             <button
               key={view}
               onClick={() => setCurrentView(view)}
               className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${currentView === view ? themeClasses.iconActive : themeClasses.iconInactive}`}
               title={VIEW_NAMES[view]}
             >
                <ViewIcon view={view} />
             </button>
           ))}
         </div>
         <button 
             onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
             className={`w-6 h-20 backdrop-blur-md border-y border-r rounded-r-xl flex items-center justify-center transition-colors group shadow-lg pointer-events-auto ${themeClasses.panelBgStrong}`}
             title={isLeftPanelOpen ? "收起视图切换" : "展开视图切换"}
         >
             <div className={`transition-transform duration-300 transform ${isLeftPanelOpen ? 'rotate-90' : '-rotate-90'}`}>
                 <ChevronDownIcon className="w-4 h-4 text-gray-500 group-hover:text-current" />
             </div>
         </button>
      </div>

      {/* Right Side Controls (Battery & NFC) */}
      <div className={`fixed top-1/2 right-0 -translate-y-1/2 z-50 flex items-center transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-[calc(100%-24px)]'}`}>
         <button 
             onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
             className={`w-6 h-20 backdrop-blur-md border-y border-l rounded-l-xl flex items-center justify-center transition-colors group shadow-lg pointer-events-auto ${themeClasses.panelBgStrong}`}
             title={isRightPanelOpen ? "收起状态模拟" : "展开状态模拟"}
         >
             <div className={`transition-transform duration-300 transform ${isRightPanelOpen ? '-rotate-90' : 'rotate-90'}`}>
                 <ChevronDownIcon className="w-4 h-4 text-gray-500 group-hover:text-current" />
             </div>
         </button>
         <div className={`flex flex-col gap-4 backdrop-blur-md p-3 rounded-l-2xl border-y border-l transition-colors duration-300 ${themeClasses.panelBg}`}>
             
             {/* Discharging States */}
             <div className="flex flex-col gap-2">
                <span className={`text-[9px] font-bold text-center ${themeClasses.subText}`}>状态预览</span>
                {[100, 50, 20].map((level) => (
                <button
                    key={level}
                    onClick={() => { setBatteryLevel(level); setIsCharging(false); }}
                    className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${batteryLevel === level && !isCharging ? themeClasses.iconActive : themeClasses.iconInactive}`}
                    title={`${level === 100 ? '高' : level === 50 ? '中' : '低'}电量`}
                >
                    <BatteryLevelControl level={level} />
                </button>
                ))}
             </div>

             <div className={`h-[1px] w-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-300'}`}></div>

             {/* Charging States */}
             <div className="flex flex-col gap-2">
                <span className={`text-[9px] font-bold text-center ${themeClasses.subText}`}>充电模拟</span>
                {[
                    { l: 100, label: '满电' },
                    { l: 80, label: '高充' },
                    { l: 50, label: '中充' },
                    { l: 20, label: '低充' }
                ].map((item) => (
                <button
                    key={`chg-${item.l}`}
                    onClick={() => { setBatteryLevel(item.l); setIsCharging(true); }}
                    className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${batteryLevel === item.l && isCharging ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : themeClasses.iconInactive}`}
                    title={item.label}
                >
                    <BatteryLevelControl level={item.l} charging={true} />
                </button>
                ))}
             </div>

             <div className={`h-[1px] w-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-300'}`}></div>

             {/* NFC Simulation */}
             <div className="flex flex-col gap-2">
                <span className={`text-[9px] font-bold text-center ${themeClasses.subText}`}>NFC 模拟</span>
                <button 
                    onClick={() => {
                        setToastMessage("✨ 已识别: 用户 [Yama] 请求添加好友");
                        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
                    }}
                    className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center text-lg ${themeClasses.iconInactive} hover:scale-110 active:scale-95`}
                    title="碰一碰加好友"
                >
                    🤝
                </button>
                <button 
                    onClick={() => handleNfcTrigger(26, '幻夜紫', LightColor.PURPLE)}
                    className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center text-lg ${themeClasses.iconInactive} hover:scale-110 active:scale-95`}
                    title="切换外壳: 幻夜紫 (Slot 26)"
                >
                    🟣
                </button>
                <button 
                    onClick={() => handleNfcTrigger(27, '森之息', LightColor.GREEN)}
                    className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center text-lg ${themeClasses.iconInactive} hover:scale-110 active:scale-95`}
                    title="切换外壳: 森之息 (Slot 27)"
                >
                    🟢
                </button>
             </div>
         </div>
      </div>

      {/* --- NEW MODULAR BOTTOM PANELS --- */}
      <BottomPanels 
          isDarkMode={isDarkMode}
          themeClasses={themeClasses}
          onSimulateSchedule={handleSimulateSchedule}
          onSimulateAlarm={handleSimulateAlarm}
          onSimulateMessage={handleSimulateMessage}
          onGiftClick={handleGiftClick}
          aiResources={aiResources}
          handleAiFileUpload={handleAiFileUpload}
          uploadedText={uploadedText}
          setUploadedText={setUploadedText}
          textSpeed={textSpeed}
          setTextSpeed={setTextSpeed}
          textColor={textColor}
          textSize={textSize}
          onPreviewText={() => { setMenuState('CAMERA'); if(mode !== BadgeMode.MENU) handleFuncClick(); }}
          carouselEnabled={carouselEnabled}
          setCarouselEnabled={setCarouselEnabled}
          carouselSpeed={carouselSpeed}
          setCarouselSpeed={setCarouselSpeed}
          tempSpeed={tempSpeed}
          setTempSpeed={setTempSpeed}
          history={history}
          activeResourceId={activeResourceId}
          setActiveResourceId={setActiveResourceId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropDelete={handleDropDelete}
          onFileUpload={handleFileUpload}
          isDragging={!!draggedResource}
      />
      
      {/* --- NEW MODULAR AI RESOURCE PANEL --- */}
      <AiResourcePanel 
          isOpen={isAiPanelOpen}
          setIsOpen={setIsAiPanelOpen}
          isDarkMode={isDarkMode}
          aiResources={aiResources}
          activeAiResourceId={activeAiResourceId}
          setActiveAiResourceId={setActiveAiResourceId}
          onDelete={handleAiResourceDelete}
          onUpload={(e, slotId) => handleAiFileUpload(e, slotId)}
      />

      {/* --- REALISTIC DEVICE WITH PHONE MOCKUP --- */}
      <div className="relative z-10 scale-[0.8] md:scale-100 transition-all duration-500 flex items-center gap-16">
        
        {/* Phone Mockup on the left */}
        <div className={`hidden md:flex w-[340px] h-[736px] rounded-[55px] border-[6px] relative flex-col shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_30px_60px_-15px_rgba(0,0,0,0.8)] ${isDarkMode ? 'bg-black border-[#3a3a3c]' : 'bg-black border-[#d1d1d6]'}`}>
            
            {/* Hardware Buttons */}
            <div className={`absolute top-[100px] -left-[8px] w-[2px] h-[26px] rounded-l-md ${isDarkMode ? 'bg-[#3a3a3c]' : 'bg-[#d1d1d6]'}`}></div>
            <div className={`absolute top-[150px] -left-[8px] w-[2px] h-[50px] rounded-l-md ${isDarkMode ? 'bg-[#3a3a3c]' : 'bg-[#d1d1d6]'}`}></div>
            <div className={`absolute top-[210px] -left-[8px] w-[2px] h-[50px] rounded-l-md ${isDarkMode ? 'bg-[#3a3a3c]' : 'bg-[#d1d1d6]'}`}></div>
            <div className={`absolute top-[170px] -right-[8px] w-[2px] h-[80px] rounded-r-md ${isDarkMode ? 'bg-[#3a3a3c]' : 'bg-[#d1d1d6]'}`}></div>

            {/* Screen Padding (Bezel) */}
            <div className="flex-1 w-full h-full p-[6px] relative flex flex-col">
                {/* Screen Container */}
                <div className={`flex-1 rounded-[42px] overflow-hidden relative flex flex-col w-full h-full ${isDarkMode ? 'bg-[#000]' : 'bg-[#f2f2f7]'}`}>
                    

                    {/* Phone Content (App simulation) */}
                    {phoneActivePage === 'HOME' ? (
                        <div className="flex-1 overflow-auto no-scrollbar px-4 pb-8 pt-[72px] flex flex-col gap-4 relative z-10 w-full">
                            <div className={`w-full h-32 rounded-2xl p-4 flex flex-col justify-end ${isDarkMode ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/5' : 'bg-gradient-to-br from-blue-100 to-purple-100 border border-gray-200'}`}>
                                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>BBS 控制台</h3>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>设备已连接</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setIsNoisePanelOpen(!isNoisePanelOpen)}
                                    className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-transform active:scale-95 ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-700 shadow-sm'}`}
                                >
                                    <span className="text-xl">🎵</span>
                                    <span className="text-xs font-medium">白噪音</span>
                                </button>
                                <button 
                                    onClick={() => {
                                        setPhoneActivePage('CUSTOM_CHAR_FORM');
                                        setIsCharNoticeOpen(true);
                                    }}
                                    className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-transform active:scale-95 ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-700 shadow-sm'}`}
                                >
                                    <span className="text-xl">👤</span>
                                    <span className="text-xs font-medium">自定义角色</span>
                                </button>
                                <button 
                                    onClick={() => setCarouselEnabled(!carouselEnabled)}
                                    className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-transform active:scale-95 ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-700 shadow-sm'}`}
                                >
                                    <span className="text-xl">🖼️</span>
                                    <span className="text-xs font-medium">图库轮播</span>
                                </button>
                                <button 
                                    onClick={() => setIsAiPanelOpen(true)}
                                    className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-transform active:scale-95 ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-700 shadow-sm'}`}
                                >
                                    <span className="text-xl">🤖</span>
                                    <span className="text-xs font-medium">AI 资源</span>
                                </button>
                            </div>
                            
                            {/* White Noise Audio Upload Section inside phone */}
                            {isNoisePanelOpen && (
                                 <div className={`mt-2 space-y-2 max-h-[300px] overflow-y-auto no-scrollbar rounded-xl p-3 ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                                     <h4 className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>白噪音音频配置</h4>
                                     {WHITE_NOISE_TYPES.map(type => (
                                        <div key={type.id} className={`flex justify-between items-center text-[10px] p-2 rounded ${isDarkMode ? 'bg-black/30' : 'bg-gray-50'}`}>
                                            <span className="flex items-center gap-2">{type.icon} {type.name}</span>
                                            <label className={`cursor-pointer flex items-center gap-1 hover:text-blue-500 transition-colors ${whiteNoiseAudios[type.id] ? 'text-green-500' : 'text-gray-500'}`}>
                                                {whiteNoiseAudios[type.id] ? (
                                                    <span className="font-bold">已上传</span>
                                                ) : (
                                                    <>
                                                        <UploadIcon className="w-3 h-3"/>
                                                        <span>上传</span>
                                                    </>
                                                )}
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="audio/*" 
                                                    onChange={(e) => handleNoiseUpload(e, type.id)} 
                                                />
                                            </label>
                                        </div>
                                     ))}
                                 </div>
                            )}
                        </div>
                    ) : phoneActivePage === 'CUSTOM_CHAR_FORM' ? (
                        <div className="flex-1 flex flex-col relative z-20 w-full h-full overflow-hidden bg-gradient-to-b from-black from-30% via-[#121c1a] to-[#25423d]">
                            {/* Header */}
                            <div className="flex items-center px-4 pt-[54px] pb-3 z-30 text-white">
                                <button onClick={() => setPhoneActivePage('HOME')} className="p-2 -ml-2 active:opacity-50">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h2 className="flex-1 text-center font-bold text-[15px] pr-8 tracking-wide">自定义角色</h2>
                            </div>

                            {/* Scrollable Form */}
                            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative z-10 pt-[50px]">
                                {/* Card 1 */}
                                <div className="bg-white rounded-[24px] mx-4 mb-4 pt-16 px-5 pb-6 relative shadow-lg shadow-black/10">
                                    {/* Upload Avatar */}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleAvatarSelect} 
                                    />
                                    <div 
                                        className="absolute -top-[48px] left-1/2 -translate-x-1/2 w-[90px] h-[100px] rounded-[18px] flex flex-col items-center justify-center gap-1 cursor-pointer bg-[#f7f7f9] shadow-sm border-[3px] border-white overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {customAvatarUrl ? (
                                            <img src={customAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <div className="text-[#cccccc] text-3xl font-light leading-none">+</div>
                                                <div className="text-[#a3a3a3] text-[11px] font-medium mt-1">上传形象</div>
                                            </>
                                        )}
                                    </div>

                                    {/* Form Fields Card 1 */}
                                    <div className="space-y-4 font-medium">
                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <label className="text-[13px] font-bold text-black border-b border-transparent pb-0.5">角色姓名</label>
                                                <span className="text-[11px] text-[#cccccc]">{characterName.length}/20</span>
                                            </div>
                                            <div 
                                                onClick={() => {
                                                    setTempName(characterName);
                                                    setIsNamePopupOpen(true);
                                                }}
                                                className="w-full bg-white border border-[#e5e5ea] rounded-full py-2.5 px-4 text-[13px] text-black cursor-pointer text-left h-[42px] flex items-center"
                                            >
                                                {characterName || <span className="text-[#cccccc]">角色的名字</span>}
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center py-2">
                                            <label className="text-[13px] font-bold text-black">角色性别</label>
                                            <button onClick={() => setIsGenderPopupOpen(true)} className={`flex items-center text-[13px] ${characterGender ? 'text-black font-medium' : 'text-[#cccccc]'}`}>
                                                {characterGender || '角色的性别'}
                                                <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-white rounded-[24px] mx-4 px-5 py-6 space-y-6 shadow-lg shadow-black/10">
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex gap-2 items-end">
                                                <label className="text-[13px] font-bold text-black">角色简介</label>
                                                <span className="text-[11px] text-[#cccccc] mb-0.5">{characterIntro.length}/30</span>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (customAvatarUrl && characterName && characterGender) {
                                                        setGenerateTarget('intro');
                                                        setIsGenerateWarningOpen(true);
                                                    }
                                                }}
                                                className={`text-[11px] flex items-center font-medium shrink-0 transition-colors ${
                                                    (customAvatarUrl && characterName && characterGender) ? 'text-[#cbee35] drop-shadow-sm opacity-100' : 'text-gray-400 opacity-80'
                                                }`}
                                            >
                                                <span className="mr-0.5">✨</span> 智能生成
                                            </button>
                                        </div>
                                        <div 
                                            onClick={() => {
                                                setTempIntro(characterIntro);
                                                setIsIntroPopupOpen(true);
                                            }}
                                            className="w-full bg-white border border-[#e5e5ea] rounded-[20px] py-3 px-4 text-[13px] text-black cursor-pointer text-left min-h-[46px] flex items-center"
                                        >
                                            {characterIntro || <span className="text-[#cccccc]">一句话简单介绍这个角色</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex gap-2 items-end">
                                                <label className="text-[13px] font-bold text-black">角色设定</label>
                                                <span className="text-[11px] text-[#cccccc] mb-0.5">{characterSetting.length}/1000</span>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (customAvatarUrl && characterName && characterGender) {
                                                        setGenerateTarget('setting');
                                                        setIsGenerateWarningOpen(true);
                                                    }
                                                }}
                                                className={`text-[11px] flex items-center font-medium shrink-0 transition-colors ${
                                                    (customAvatarUrl && characterName && characterGender) ? 'text-[#cbee35] drop-shadow-sm opacity-100' : 'text-gray-400 opacity-80'
                                                }`}
                                            >
                                                <span className="mr-0.5">✨</span> 智能生成
                                            </button>
                                        </div>
                                        <div 
                                            onClick={() => {
                                                setEditorType('setting');
                                                setTempEditorText(characterSetting);
                                                setIsEditorOpen(true);
                                            }}
                                            className="w-full bg-white border border-[#e5e5ea] rounded-[20px] py-3 px-4 text-[13px] text-black cursor-pointer text-left min-h-[70px] flex items-start"
                                        >
                                            {characterSetting ? (
                                                <span className="line-clamp-2">{characterSetting}</span>
                                            ) : (
                                                <span className="text-[#cccccc]">角色的具体设定，非公开信息</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-0 text-[13px]">
                                        <div className="flex justify-between items-center py-4 border-b border-[#f2f2f7]">
                                            <div className="flex items-center gap-1.5 break-keep whitespace-nowrap">
                                                <label className="font-bold text-black">角色关系</label>
                                                <span className="text-[11px] text-[#a3a3a3]">(选填)</span>
                                            </div>
                                            <button onClick={() => setIsRelationshipPopupOpen(true)} className={`flex items-center shrink-0 max-w-[50%] justify-end text-right ${characterRelationship ? 'text-black font-medium' : 'text-[#cccccc]'}`}>
                                                <span className="truncate">{characterRelationship || '该角色与我的关系'}</span>
                                                <svg className="w-4 h-4 ml-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center py-4 border-b border-[#f2f2f7]">
                                            <div className="flex items-center gap-1.5 break-keep whitespace-nowrap">
                                                <label className="font-bold text-black">角色声音</label>
                                                <span className="text-[11px] text-[#a3a3a3]">(选填)</span>
                                            </div>
                                            <button onClick={() => setIsVoicePopupOpen(true)} className={`flex items-center shrink-0 max-w-[50%] justify-end text-right ${characterVoice ? 'text-black font-medium' : 'text-[#cccccc]'}`}>
                                                <span className="truncate">{characterVoice || '选择角色声音'}</span>
                                                <svg className="w-4 h-4 ml-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center py-4 border-b border-[#f2f2f7]">
                                            <div className="flex items-center gap-1.5 break-keep whitespace-nowrap">
                                                <label className="font-bold text-black">角色标签</label>
                                                <span className="text-[11px] text-[#a3a3a3]">(选填)</span>
                                            </div>
                                            <button onClick={() => setIsTagsPopupOpen(true)} className={`flex items-center shrink-0 max-w-[50%] justify-end text-right ${characterTags.length > 0 ? 'text-black font-medium' : 'text-[#cccccc]'}`}>
                                                <span className="truncate">{characterTags.length > 0 ? characterTags.join(', ') : '选择角色标签'}</span>
                                                <svg className="w-4 h-4 ml-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center pt-4">
                                            <div className="flex items-center gap-1.5 break-keep whitespace-nowrap">
                                                <label className="font-bold text-black">角色技能模组</label>
                                                <span className="text-[11px] text-[#cccccc]">{characterSkills.length}/3</span>
                                            </div>
                                            <button onClick={() => setIsSkillsPopupOpen(true)} className={`flex items-center shrink-0 max-w-[50%] justify-end text-right ${characterSkills.length > 0 ? 'text-black font-medium' : 'text-[#cccccc]'}`}>
                                                <span className="truncate">{characterSkills.length > 0 ? characterSkills.join(', ') : '该角色具备能力'}</span>
                                                <svg className="w-4 h-4 ml-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Fixed Area */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 pb-9 flex justify-center z-20 pointer-events-none bg-gradient-to-t from-[#25423d] via-[#25423d]/80 to-transparent">
                                <button 
                                    onClick={() => setPhoneActivePage('EXPRESSION_FORM')}
                                    disabled={!(customAvatarUrl && characterName && characterGender && characterIntro && characterSetting)}
                                    className={`w-full py-3.5 rounded-full text-sm font-bold pointer-events-auto border border-white/5 shadow-sm transition-transform ${
                                        (customAvatarUrl && characterName && characterGender && characterIntro && characterSetting)
                                            ? "bg-[#cbee35] text-black active:scale-95"
                                            : "bg-[#f2f2f7]/20 backdrop-blur-md text-[#ffffff]/60 cursor-not-allowed"
                                    }`}
                                >
                                    下一步
                                </button>
                            </div>

                            {/* Notice Modal */}
                            {isCharNoticeOpen && (
                                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 animate-[fadeIn_0.2s_ease-out]">
                                    <div className="w-[286px] bg-white rounded-[28px] pt-[28px] px-[24px] pb-[22px] flex flex-col shadow-2xl relative">
                                        <h3 className="text-center font-bold text-black text-[16px] mb-4 tracking-wide">创作须知</h3>
                                        <div className="mb-6">
                                            <ol className="text-[#646464] text-[12px] leading-[20px] space-y-[9px] list-decimal pl-[16px] pr-1">
                                                <li className="pl-[2px]">请勿利用该服务从事任何违法活动，包括但不限于盗版、诽谤、侵犯隐私、恐吓等行为。</li>
                                                <li className="pl-[2px]">在使用该服务生成内容时，请确保遵守所有适用的法律法规，包括知识产权法、信息安全法等相关法律法规。</li>
                                                <li className="pl-[2px]">生成的内容可能受到版权保护或其他知识产权法律的限制，请确保您拥有相关的版权或使用许可，或者保证生成的内容不会侵犯他人的知识产权。</li>
                                                <li className="pl-[2px]">生成的内容仅供参考和娱乐，不应被视为专业意见或决策依据。在做出任何重要决定前，请考虑咨询相关专业人士。</li>
                                                <li className="pl-[2px]">禁止利用该功能从事违法活动，包括但不限于传播恐怖主义、淫秽色情、诈骗等内容。如发现违反规定的行为，我们将保留追究责任的权利并可能采取相应措施。</li>
                                            </ol>
                                        </div>
                                        <button 
                                            onClick={() => setIsCharNoticeOpen(false)}
                                            className="w-full bg-black text-white text-[15px] font-medium py-[13px] rounded-full active:scale-[0.98] transition-transform tracking-wide"
                                        >
                                            知道了
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Name Popup */}
                            {isNamePopupOpen && (
                                <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/70 animate-[fadeIn_0.2s_ease-out]">
                                    <div className="flex-1" onClick={() => setIsNamePopupOpen(false)}></div>
                                    <div className="w-full flex flex-col animate-slideUpFromBottom">
                                        <div className="bg-white rounded-t-[32px] pt-[30px] px-6 pb-6 flex flex-col items-center">
                                            <h3 className="font-bold text-black text-[17px] mb-6">角色姓名</h3>
                                            <div className="w-full relative mb-8">
                                                <input 
                                                    autoFocus
                                                    type="text" 
                                                    maxLength={15}
                                                    value={tempName}
                                                    onChange={(e) => setTempName(e.target.value)}
                                                    placeholder="请输入15字以内的角色名" 
                                                    className="w-full bg-white border border-[#e5e5ea] rounded-full py-[14px] px-5 text-[14px] text-black outline-none placeholder-[#cccccc] focus:border-black transition-colors"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    if (tempName) {
                                                        setCharacterName(tempName);
                                                        setIsNamePopupOpen(false);
                                                    }
                                                }}
                                                disabled={!tempName}
                                                className={`w-full py-[14px] rounded-full text-[15px] font-bold transition-colors ${
                                                    tempName 
                                                        ? 'bg-[#cbee35] text-black active:scale-[0.98]' 
                                                        : 'bg-[#f2f2f7] text-[#cccccc]'
                                                }`}
                                            >
                                                确认
                                            </button>
                                        </div>
                                        <MockKeyboard />
                                    </div>
                                </div>
                            )}

                            {/* Intro Popup */}
                            {isIntroPopupOpen && (
                                <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/70 animate-[fadeIn_0.2s_ease-out]">
                                    <div className="flex-1" onClick={() => setIsIntroPopupOpen(false)}></div>
                                    <div className="w-full flex flex-col animate-slideUpFromBottom">
                                        <div className="bg-white rounded-t-[32px] pt-[30px] px-6 pb-6 flex flex-col items-center">
                                            <h3 className="font-bold text-black text-[17px] mb-6">角色简介</h3>
                                            <div className="w-full relative mb-3">
                                                <textarea 
                                                    autoFocus
                                                    maxLength={30}
                                                    value={tempIntro}
                                                    onChange={(e) => setTempIntro(e.target.value)}
                                                    placeholder="角色的公开介绍" 
                                                    className="w-full h-28 bg-white border border-[#e5e5ea] rounded-[24px] py-4 px-5 text-[14px] text-black outline-none placeholder-[#cccccc] focus:border-black transition-colors resize-none mb-1 shadow-sm"
                                                />
                                            </div>
                                            <div className="w-full flex justify-between items-center mb-7 px-1 text-left">
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-[#cbee35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-[#a3a3a3] text-[12px] font-medium">如需保存原设定请自行保存</span>
                                                </div>
                                            </div>
                                            <div className="w-full flex gap-4">
                                                <button 
                                                    onClick={() => {
                                                        setGenerateTarget('intro');
                                                        setIsGenerateWarningOpen(true);
                                                    }}
                                                    disabled={!(customAvatarUrl && characterName && characterGender) || isGenerating}
                                                    className={`flex-1 py-[14px] rounded-full text-[15px] font-bold active:scale-[0.98] transition-colors ${
                                                        (customAvatarUrl && characterName && characterGender) ? 'bg-black text-white' : 'bg-[#e5e5ea] text-[#a3a3a3]'
                                                    }`}
                                                >
                                                    {isGenerating && generateTarget === 'intro' ? '生成中...' : '智能生成'}
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setCharacterIntro(tempIntro);
                                                        setIsIntroPopupOpen(false);
                                                    }}
                                                    className={`flex-1 py-[14px] rounded-full text-[15px] font-bold active:scale-[0.98] transition-colors ${
                                                        tempIntro ? 'bg-[#cbee35] text-black' : 'bg-[#e5e5ea] text-[#a3a3a3]'
                                                    }`}
                                                >
                                                    确认
                                                </button>
                                            </div>
                                        </div>
                                        <MockKeyboard />
                                    </div>
                                </div>
                            )}

                            {/* Full Screen Editor Page */}
                            {isEditorOpen && (
                                <div className="absolute inset-0 z-50 bg-[#f7f7f9] flex flex-col animate-[fadeIn_0.2s_ease-out]">
                                    <div className="flex justify-between items-center px-4 pt-10 pb-4 bg-white shadow-sm shrink-0">
                                        <button onClick={() => setIsEditorOpen(false)} className="w-10 h-10 flex items-center justify-center -ml-2 text-black active:scale-95 transition-transform">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <h2 className="font-bold text-[17px] text-black">
                                            角色设定
                                        </h2>
                                        <button 
                                            onClick={() => {
                                                setCharacterSetting(tempEditorText);
                                                setIsEditorOpen(false);
                                            }}
                                            className={`text-[15px] font-medium active:scale-95 transition-transform ${tempEditorText ? 'text-black' : 'text-[#cccccc]'}`}
                                        >
                                            确定
                                        </button>
                                    </div>
                                    <div className="flex-1 w-full bg-[#f7f7f9] p-4 flex flex-col relative overflow-hidden">
                                        <textarea 
                                            autoFocus
                                            maxLength={1000}
                                            value={tempEditorText}
                                            onChange={(e) => setTempEditorText(e.target.value)}
                                            placeholder="角色的具体设定，非公开信息" 
                                            className="flex-1 w-full bg-transparent text-[15px] text-black outline-none placeholder-[#cccccc] resize-none pb-[80px]"
                                        />
                                        <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 pointer-events-none">
                                            <div className="flex items-center gap-1.5 text-left mb-1">
                                                <svg className="w-[14px] h-[14px] text-[#cbee35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-[#a3a3a3] text-[12px] font-medium">如需保存原设定请自行保存</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <button 
                                                    onClick={() => {
                                                        setGenerateTarget('setting');
                                                        setIsGenerateWarningOpen(true);
                                                    }}
                                                    disabled={!(customAvatarUrl && characterName && characterGender) || isGenerating}
                                                    className={`flex items-center text-[14px] font-medium transition-colors pointer-events-auto ${
                                                        (customAvatarUrl && characterName && characterGender) ? 'text-[#cbee35] drop-shadow-sm' : 'text-gray-400 opacity-60'
                                                    }`}
                                                >
                                                    <span className="mr-0.5">{isGenerating && generateTarget === 'setting' ? '⏳' : '✨'}</span>
                                                    {isGenerating && generateTarget === 'setting' ? '生成中...' : '智能生成'}
                                                </button>
                                                <span className="text-[12px] font-medium text-[#cccccc]">
                                                    {tempEditorText.length}/1000
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shrink-0 bg-[#d1d1d6] h-[216px] pointer-events-none">
                                        <MockKeyboard />
                                    </div>
                                </div>
                            )}

                            {/* Generate Warning Popup */}
                            {isGenerateWarningOpen && (
                                <div className="absolute inset-0 z-[60] flex flex-col justify-end bg-black/70 animate-[fadeIn_0.2s_ease-out]">
                                    <div className="flex-1" onClick={() => setIsGenerateWarningOpen(false)}></div>
                                    <div className="w-full flex flex-col animate-slideUpFromBottom">
                                        <div className="bg-white rounded-t-[32px] pt-[30px] px-6 pb-8 flex flex-col items-center">
                                            <h3 className="font-bold text-black text-[17px] mb-6">注意</h3>
                                            <div className="w-full text-left text-[15px] text-[#4d4d4d] leading-normal mb-6 font-medium">
                                                智能生成会依据已输入内容给角色生成{generateTarget === 'setting' ? '1000' : '30'}字上下的新设定并覆盖现有内容；
                                            </div>
                                            <div className="w-full space-y-2 mb-8 text-left">
                                                <div className="flex items-center gap-1.5 text-[#a3a3a3] text-[13px]">
                                                    <svg className="w-[14px] h-[14px] text-[#cbee35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    智能生成后无法还原
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[#a3a3a3] text-[13px]">
                                                    <svg className="w-[14px] h-[14px] text-[#cbee35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    如需保存原设定请自行保存
                                                </div>
                                            </div>
                                            <div className="w-full flex gap-3">
                                                <button 
                                                    onClick={() => {
                                                        setIsGenerateWarningOpen(false);
                                                        if (generateTarget) {
                                                            if (generateTarget === 'intro') {
                                                                setIsIntroPopupOpen(true);
                                                                handleGenerateContent('intro');
                                                            } else {
                                                                setIsEditorOpen(true);
                                                                setEditorType('setting');
                                                                handleGenerateContent('setting');
                                                            }
                                                        }
                                                    }}
                                                    className="flex-1 bg-black text-white py-[14px] rounded-full text-[15px] font-bold active:scale-[0.98] transition-transform"
                                                >
                                                    确认生成
                                                </button>
                                                <button 
                                                    onClick={() => setIsGenerateWarningOpen(false)}
                                                    className="flex-1 bg-[#cbee35] text-black py-[14px] rounded-full text-[15px] font-bold active:scale-[0.98] transition-transform"
                                                >
                                                    再想想
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Gender Popup */}
                            {isGenderPopupOpen && (
                                <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/70 animate-[fadeIn_0.2s_ease-out]">
                                    <div className="flex-1" onClick={() => setIsGenderPopupOpen(false)}></div>
                                    <div className="w-full flex flex-col animate-slideUpFromBottom">
                                        <div className="bg-white rounded-t-[32px] pt-[30px] px-6 pb-8 flex flex-col items-center">
                                            <h3 className="font-bold text-black text-[17px] mb-6">角色性别</h3>
                                            <div className="flex justify-between w-full mb-8 gap-3">
                                                {['男', '女', '不详'].map(g => (
                                                    <button key={g} 
                                                        onClick={() => setCharacterGender(g)}
                                                        className={`flex-1 py-[14px] rounded-full border text-[15px] transition-colors ${characterGender === g ? 'bg-black text-white border-black' : 'bg-white text-black border-[#e5e5ea]'}`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => setIsGenderPopupOpen(false)}
                                                disabled={!characterGender}
                                                className={`w-full py-[14px] rounded-full text-[15px] font-bold active:scale-[0.98] transition-colors tracking-wide ${characterGender ? 'bg-[#cbee35] text-black' : 'bg-[#999999] text-white/90 cursor-not-allowed'}`}
                                            >
                                                确认
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Relationship Popup */}
                            {isRelationshipPopupOpen && (
                                <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/70 animate-[fadeIn_0.2s_ease-out]">
                                    <div className="flex-1" onClick={() => setIsRelationshipPopupOpen(false)}></div>
                                    <div className="w-full flex flex-col animate-slideUpFromBottom">
                                        <div className="bg-white rounded-t-[32px] pt-[30px] px-6 pb-8 flex flex-col items-center">
                                            <h3 className="font-bold text-black text-[17px] mb-6">角色关系</h3>
                                            
                                            <div className="w-full relative mb-4">
                                                <input 
                                                    type="text"
                                                    value={tempRelationship}
                                                    onChange={(e) => {
                                                        setTempRelationship(e.target.value);
                                                        setCharacterRelationship(e.target.value);
                                                    }}
                                                    placeholder="其他关系" 
                                                    className="w-full bg-white border border-[#e5e5ea] rounded-full py-[14px] px-5 text-[14px] outline-none placeholder-[#cccccc] focus:border-black transition-colors text-black"
                                                />
                                            </div>

                                            <div className="grid grid-cols-4 w-full mb-8 gap-2">
                                                {['挚友', '家人', '宿敌', '伴侣'].map(r => (
                                                    <button key={r} 
                                                        onClick={() => {
                                                            setCharacterRelationship(r);
                                                            setTempRelationship('');
                                                        }}
                                                        className={`py-[8px] rounded-full border text-[13px] transition-colors whitespace-nowrap ${characterRelationship === r ? 'bg-black text-white border-black' : 'bg-white text-black border-[#e5e5ea]'}`}
                                                    >
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>

                                            <button 
                                                onClick={() => setIsRelationshipPopupOpen(false)}
                                                disabled={!characterRelationship}
                                                className={`w-full py-[14px] rounded-full text-[15px] font-bold active:scale-[0.98] transition-colors tracking-wide ${characterRelationship ? 'bg-[#cbee35] text-black' : 'bg-[#999999] text-white/90 cursor-not-allowed'}`}
                                            >
                                                确认
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tags Popup */}
                            {isTagsPopupOpen && (
                                <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/70 animate-[fadeIn_0.2s_ease-out]">
                                    <div className="flex-1" onClick={() => setIsTagsPopupOpen(false)}></div>
                                    <div className="w-full flex flex-col animate-slideUpFromBottom">
                                        <div className="bg-white rounded-t-[32px] pt-[30px] px-6 pb-8 flex flex-col items-center">
                                            <h3 className="font-bold text-black text-[17px] mb-6">角色标签 {characterTags.length}/3</h3>
                                            
                                            <div className="grid grid-cols-3 w-full mb-8 gap-3">
                                                {['傲娇', '病娇', '温柔', '冷酷', '阳光', '腹黑', '天然呆', '元气', '毒舌'].map(t => {
                                                    const isSelected = characterTags.includes(t);
                                                    return (
                                                        <button key={t} 
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setCharacterTags(prev => prev.filter(tag => tag !== t));
                                                                } else if (characterTags.length < 3) {
                                                                    setCharacterTags(prev => [...prev, t]);
                                                                }
                                                            }}
                                                            className={`py-[10px] rounded-full border text-[14px] transition-colors ${isSelected ? 'bg-black text-white border-black' : 'bg-white text-black border-[#e5e5ea]'}`}
                                                        >
                                                            {t}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button 
                                                onClick={() => setIsTagsPopupOpen(false)}
                                                disabled={characterTags.length === 0}
                                                className={`w-full py-[14px] rounded-full text-[15px] font-bold active:scale-[0.98] transition-colors tracking-wide ${characterTags.length > 0 ? 'bg-[#cbee35] text-black' : 'bg-[#999999] text-white/90 cursor-not-allowed'}`}
                                            >
                                                确认
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Skills Popup */}
                            {isSkillsPopupOpen && (
                                <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/70 animate-[fadeIn_0.2s_ease-out]">
                                    <div className="flex-1" onClick={() => setIsSkillsPopupOpen(false)}></div>
                                    <div className="w-full flex flex-col animate-slideUpFromBottom">
                                        <div className="bg-white rounded-t-[32px] pt-[30px] px-6 pb-8 flex flex-col items-center">
                                            <h3 className="font-bold text-black text-[17px] mb-6">角色技能 {characterSkills.length}/3</h3>
                                            
                                            <div className="grid grid-cols-3 w-full mb-8 gap-3">
                                                {['近战搏击', '远程狙击', '魔法治愈', '黑客技术', '战术指挥', '潜行暗杀', '机械制造', '超能结界', '读心术'].map(s => {
                                                    const isSelected = characterSkills.includes(s);
                                                    return (
                                                        <button key={s} 
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setCharacterSkills(prev => prev.filter(skill => skill !== s));
                                                                } else if (characterSkills.length < 3) {
                                                                    setCharacterSkills(prev => [...prev, s]);
                                                                }
                                                            }}
                                                            className={`py-[10px] rounded-full border text-[14px] transition-colors ${isSelected ? 'bg-black text-white border-black' : 'bg-white text-black border-[#e5e5ea]'}`}
                                                        >
                                                            {s}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button 
                                                onClick={() => setIsSkillsPopupOpen(false)}
                                                disabled={characterSkills.length === 0}
                                                className={`w-full py-[14px] rounded-full text-[15px] font-bold active:scale-[0.98] transition-colors tracking-wide ${characterSkills.length > 0 ? 'bg-[#cbee35] text-black' : 'bg-[#999999] text-white/90 cursor-not-allowed'}`}
                                            >
                                                确认
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Voice Popup */}
                            {isVoicePopupOpen && (
                                <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/70 animate-[fadeIn_0.2s_ease-out]">
                                    <div className="flex-1" onClick={() => setIsVoicePopupOpen(false)}></div>
                                    <div className="w-full flex flex-col animate-slideUpFromBottom">
                                        <div className="bg-white rounded-t-[32px] pt-[30px] px-6 pb-8 flex flex-col items-center">
                                            <h3 className="font-bold text-black text-[17px] mb-6">角色音色</h3>
                                            
                                            <div className="flex bg-[#f2f2f7] rounded-full p-1 mb-6 border border-[#e5e5ea]">
                                                <button 
                                                    onClick={() => setVoiceTab('female')}
                                                    className={`px-6 py-1.5 rounded-full text-[13px] font-medium transition-colors ${voiceTab === 'female' ? 'bg-black text-white' : 'text-black'}`}
                                                >
                                                    女声
                                                </button>
                                                <button 
                                                    onClick={() => setVoiceTab('male')}
                                                    className={`px-6 py-1.5 rounded-full text-[13px] font-medium transition-colors ${voiceTab === 'male' ? 'bg-black text-white' : 'text-black'}`}
                                                >
                                                    男声
                                                </button>
                                            </div>

                                            <div className="w-full flex-1 overflow-y-auto no-scrollbar max-h-[35vh] mb-6 space-y-0 text-[14px]">
                                                {(voiceTab === 'male' ? ['星夜低语', '沉稳磁性', '清澈少年', '爽朗大哥', '星光爱豆', '邻家暖男', '傲慢霸总'] : ['温柔学姐', '甜美萝莉', '成熟御姐', '清冷仙子', '活力少女', '知性主播', '高冷女王']).map(v => (
                                                    <div key={v} className="flex justify-between items-center py-4 border-b border-[#f2f2f7] border-dashed">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-[15px] text-black">{v}</span>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.speechSynthesis.cancel();
                                                                    const msg = new SpeechSynthesisUtterance(`你好，我是${v}，很高兴认识你。`);
                                                                    msg.lang = 'zh-CN';
                                                                    msg.pitch = voiceTab === 'male' ? 0.8 : 1.2;
                                                                    window.speechSynthesis.speak(msg);
                                                                }}
                                                                className="outline-none active:scale-95 transition-transform"
                                                            >
                                                                <svg className="w-4 h-4 text-[#cbee35]" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M12 3v18M8 8v8M16 8v8M4 11v2M20 11v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <button 
                                                            onClick={() => setCharacterVoice(v)}
                                                            className={`px-[22px] py-[6px] rounded-full text-[12px] font-medium border ${characterVoice === v ? 'bg-black text-white border-black' : 'bg-white text-black border-[#e5e5ea]'}`}
                                                        >
                                                            {characterVoice === v ? '已选择' : '选择'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <button 
                                                onClick={() => setIsVoicePopupOpen(false)}
                                                disabled={!characterVoice}
                                                className={`w-full py-[14px] rounded-full text-[15px] font-bold active:scale-[0.98] transition-colors tracking-wide ${characterVoice ? 'bg-[#cbee35] text-black' : 'bg-[#999999] text-white/90 cursor-not-allowed'}`}
                                            >
                                                确认
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : phoneActivePage === 'EXPRESSION_FORM' ? (
                        <div className="flex-1 flex flex-col relative z-20 w-full h-full overflow-hidden bg-gradient-to-b from-black from-10% to-[#25423d]">
                            {/* Header */}
                            <div className="flex items-center px-4 pt-[54px] pb-3 z-30 text-white relative">
                                <button onClick={() => {
                                    if (expressionSelectedId) {
                                        setExpressionSelectedId(null);
                                    } else {
                                        setPhoneActivePage('CUSTOM_CHAR_FORM');
                                    }
                                }} className="p-2 -ml-2 active:opacity-50 absolute left-4 z-40">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="flex-1 flex flex-col items-center justify-center mt-1">
                                    <h2 className="text-center font-bold text-[15px] tracking-wide">自定义角色表情</h2>
                                    {!expressionSelectedId && (
                                        <span className="text-[10px] text-white/50 mt-1">不进行设置将会自动生成</span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            {!expressionSelectedId ? (
                                <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-28 pt-2">
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-7 mb-10">
                                        {expressions.filter(e => !e.isLocked).map(exp => (
                                            <div key={exp.id} className="flex flex-col items-center gap-3">
                                                <div 
                                                    onClick={() => setExpressionSelectedId(exp.id)}
                                                    className="w-full aspect-[4/5] rounded-[24px] overflow-hidden relative cursor-pointer active:scale-[0.98] transition-transform bg-white/5"
                                                >
                                                    <img src={exp.generatedImages.length > 0 ? exp.generatedImages[exp.generatedImages.length - 1] : (customAvatarUrl || 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?w=500&h=500&fit=crop')} className={`w-full h-full object-cover ${exp.generatedImages.length === 0 ? 'blur-sm opacity-60' : 'opacity-90'}`} />
                                                    {exp.generatedImages.length === 0 && (
                                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px]">
                                                            <div className="text-white text-3xl font-light mb-1 drop-shadow">+</div>
                                                            <span className="text-white/90 text-[12px] font-medium drop-shadow">生成动作</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-white/80 text-[13px] font-medium tracking-wide">{exp.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex items-center justify-center mb-7">
                                        <span className="text-white/90 font-bold text-[13px] tracking-widest drop-shadow-sm">随亲密度解锁</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-6 gap-y-7 pb-6">
                                        {expressions.filter(e => e.isLocked).map(exp => (
                                            <div key={exp.id} className="flex flex-col items-center gap-3">
                                                <div className="w-full aspect-[4/5] rounded-[24px] overflow-hidden relative bg-white/5 border border-white/5">
                                                    <img src={customAvatarUrl || 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?w=500&h=500&fit=crop'} className="w-full h-full object-cover blur-xl opacity-20" />
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <svg className="w-5 h-5 text-white/80 drop-shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17a2 2 0 002-2a2 2 0 00-2-2 2 2 0 00-2 2 2 2 0 002 2m6-9a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1V6a5 5 0 015-5 5 5 0 015 5v2h1m-6-5a3 3 0 00-3 3v2h6V6a3 3 0 00-3-3z"/></svg>
                                                    </div>
                                                </div>
                                                <span className="text-white/80 text-[13px] font-medium tracking-wide">{exp.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col overflow-hidden px-5 pt-3">
                                    {/* Horizontal Action List */}
                                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 pl-1 pr-5 -mx-1 mask-linear-fade-right">
                                        {expressions.filter(e => !e.isLocked).map(exp => (
                                            <div key={exp.id} className="flex flex-col items-center gap-2.5 shrink-0">
                                                <div 
                                                    onClick={() => setExpressionSelectedId(exp.id)}
                                                    className={`w-[85px] h-[105px] rounded-[18px] overflow-hidden relative cursor-pointer transition-all bg-white/5 ${expressionSelectedId === exp.id ? 'ring-[1.5px] ring-[#cbee35] ring-offset-2 ring-offset-[#111]' : ''}`}
                                                >
                                                    <img src={exp.generatedImages.length > 0 ? exp.generatedImages[exp.generatedImages.length - 1] : (customAvatarUrl || 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?w=500&h=500&fit=crop')} className={`w-full h-full object-cover ${exp.generatedImages.length === 0 ? 'blur-sm opacity-60' : 'opacity-90'}`} />
                                                    {exp.generatedImages.length === 0 && (
                                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px]">
                                                            <div className="text-white text-xl font-light mb-0.5 drop-shadow">+</div>
                                                            <span className="text-white/90 text-[10px] font-medium drop-shadow scale-90">生成动作</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`text-[12px] font-medium tracking-wide ${expressionSelectedId === exp.id ? 'text-[#cbee35]' : 'text-white/60'}`}>{exp.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Main Selected Action View */}
                                    {(() => {
                                        const selectedExp = expressions.find(e => e.id === expressionSelectedId);
                                        if (!selectedExp) return null;
                                        const hasImages = selectedExp.generatedImages.length > 0;
                                        const displayImage = hasImages ? selectedExp.generatedImages[selectedExp.generatedImages.length - 1] : (customAvatarUrl || 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?w=500&h=500&fit=crop');

                                        return (
                                            <div className="flex-1 flex flex-col items-center w-full max-w-[310px] mx-auto animate-[fadeIn_0.2s_ease-out]">
                                                <div className="w-full aspect-square rounded-[32px] overflow-hidden relative mt-1 shadow-2xl bg-[#1a2825] border border-white/10">
                                                    <img src={displayImage} className={`w-full h-full object-cover transition-all duration-500 ${hasImages ? '' : 'blur-xl opacity-40 scale-110'}`} />
                                                    
                                                    {isGeneratingAction ? (
                                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-md">
                                                            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mb-4"></div>
                                                            <div className="text-white/90 text-[13px] font-medium tracking-widest animate-pulse">生成中...</div>
                                                        </div>
                                                    ) : !hasImages ? (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <button 
                                                                onClick={handleGenerateAction}
                                                                className="border border-[#ffffff]/30 bg-black/40 backdrop-blur-md text-white text-[13px] px-8 py-2.5 rounded-full font-medium active:scale-95 transition-transform outline-none drop-shadow-md"
                                                            >
                                                                生成动作
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent">
                                                            <div className="flex justify-between items-end w-full">
                                                                <div className="flex gap-3 pointer-events-auto">
                                                                    <button className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10 shadow-lg">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2 9h4v12H2a1 1 0 01-1-1V10a1 1 0 011-1zm20 2-2.5 10a2 2 0 01-2 1h-7a2 2 0 01-2-2v-8.5a1.5 1.5 0 01.44-1.06L14 7l-1-4 1-1 3.5 3a1.5 1.5 0 01.5 1v3h4a2 2 0 012 2v2z"/></svg>
                                                                    </button>
                                                                    <button className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10 shadow-lg">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 15h-4V3h4a1 1 0 011 1v10a1 1 0 01-1 1zM2 13l2.5-10a2 2 0 012-1h7a2 2 0 012 2v8.5a1.5 1.5 0 01-.44 1.06L10 17l1 4-1 1-3.5-3a1.5 1.5 0 01-.5-1v-3H2a2 2 0 01-2-2v-2z"/></svg>
                                                                    </button>
                                                                </div>
                                                                <span className="text-white/60 text-[11px] font-medium tracking-wide drop-shadow-md">内容由AI生成</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-8 flex justify-center w-full">
                                                    {hasImages ? (
                                                        <button 
                                                            onClick={handleGenerateAction}
                                                            disabled={isGeneratingAction || selectedExp.generateCount > 3}
                                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-medium transition-all shadow-lg ${
                                                                selectedExp.generateCount > 3 || isGeneratingAction ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed' : 'bg-white/10 text-white active:bg-white/20 border border-white/20'
                                                            }`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                            重新生成{Math.min(3, Math.max(0, selectedExp.generateCount - 1))}/3
                                                        </button>
                                                    ) : (
                                                        <div className="h-[40px]"></div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Bottom Fixed Area */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 pb-9 flex justify-center z-40 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent">
                                {!expressionSelectedId ? (
                                    <button 
                                        onClick={handleImportMemory}
                                        className="w-full bg-[#cbee35] text-black py-3.5 rounded-full text-[15px] font-bold active:scale-[0.98] transition-transform tracking-wide shadow-lg"
                                    >
                                        接入记忆体
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            const selectedExp = expressions.find(e => e.id === expressionSelectedId);
                                            if (selectedExp && selectedExp.generatedImages.length > 0) {
                                                setExpressionSelectedId(null);
                                            }
                                        }}
                                        className={`w-full py-3.5 rounded-full text-[15px] font-bold transition-all tracking-wide shadow-lg ${
                                            expressions.find(e => e.id === expressionSelectedId)?.generatedImages.length 
                                                ? 'bg-[#cbee35] text-black active:scale-[0.98]' 
                                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                                        }`}
                                    >
                                        确认选择
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : phoneActivePage === 'IMPORT_PROGRESS' ? (
                        <div className="flex-1 flex flex-col relative w-full h-full bg-gradient-to-b from-[#11211e] to-[#1a302c]">
                            {/* Dashboard Character Hero */}
                            <div className="w-full relative px-4 pt-[64px] pb-2">
                                {/* Main Card */}
                                <div className="w-full h-[380px] rounded-[32px] overflow-hidden relative shadow-2xl bg-black border border-white/10">
                                    <img src={customAvatarUrl || ''} className="w-full h-full object-cover" />
                                    
                                    {/* Top Overlay */}
                                    <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent h-28 pointer-events-none">
                                        <div className="flex flex-col gap-1 z-10 pointer-events-auto">
                                            <h2 className="text-white text-[28px] font-bold tracking-tight drop-shadow-md">{characterName || '日向押守'}</h2>
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="text-white/70 text-[11px] font-medium tracking-wider">解析度Lv.1</span>
                                                <div className="w-10 h-[3px] bg-white/40 rounded-full overflow-hidden">
                                                    <div className="w-1/2 h-full bg-white/80"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-sm pointer-events-auto active:scale-95 transition-transform">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        </button>
                                    </div>

                                    {/* Bottom Overlay / Progress */}
                                    {isCharacterImported ? (
                                        <>
                                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                                <div className="w-14 h-14 bg-[#cbee35] rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto">
                                                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 10H6v-2h8v2zm4-4H6V6h12v2z"/></svg>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end px-6 pb-6 pointer-events-none">
                                            <div className="flex items-center justify-center mb-3">
                                                <span className="text-white/90 text-[13px] font-medium tracking-wide drop-shadow-md">接入设备中，当前进度{importProgress || 0}%</span>
                                            </div>
                                            <div className="w-full h-[4px] bg-white/20 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-[#cbee35] transition-all duration-300" style={{ width: `${importProgress || 0}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Below Card Content */}
                            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-28 mb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-white font-bold text-[15px] tracking-wide">提醒事项</h3>
                                    <span className="text-white/50 text-[12px] font-medium">展开</span>
                                </div>
                                <div className="w-full bg-[#1e2e2a] rounded-[24px] p-4 flex items-center gap-3 border border-white/5 shadow-md">
                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-black">
                                        <img src={customAvatarUrl || ''} className="w-full h-full object-cover" />
                                    </div>
                                    {isCharacterImported ? (
                                        <p className="text-[13px] text-white/90 font-medium">
                                            {characterName || '日向押守'} <span className="text-[#cbee35]">接入完成</span>
                                        </p>
                                    ) : (
                                        <p className="text-[13px] text-white/90 font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                                            {characterName || '日向押守'}：“稍等，我在来的路上了”
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div>
                                        <h3 className="text-white font-bold text-[15px] tracking-wide mb-3">闹钟</h3>
                                        <div className="w-full aspect-video bg-[#1e2e2a] rounded-[24px] border border-white/5 shadow-md flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-[15px] tracking-wide mb-3">日程</h3>
                                        <div className="w-full aspect-video bg-[#1e2e2a] rounded-[24px] border border-white/5 shadow-md flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Nav */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 z-40 bg-gradient-to-t from-[#11211e] via-[#11211e]/90 to-transparent flex justify-center pb-8">
                                <div className="bg-[#1e2e2a] rounded-full px-6 py-3 flex text-white/40 gap-8 border border-white/5 shadow-lg backdrop-blur-md">
                                    <button className="flex flex-col items-center gap-1 active:scale-95 text-white">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                        <span className="text-[10px] font-medium">角色</span>
                                    </button>
                                    <button onClick={() => setPhoneActivePage('HOME')} className="flex flex-col items-center gap-1 active:scale-95">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="text-[10px] font-medium">设备</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-1 active:scale-95">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                        <span className="text-[10px] font-medium">聊天</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-1 active:scale-95">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        <span className="text-[10px] font-medium">我的</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Import Progress Modal Overlay */}
                    {isImportModalOpen && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]">
                            <div className="w-[300px] bg-white rounded-[40px] p-6 pb-8 flex flex-col items-center shadow-2xl relative animate-[scaleIn_0.3s_ease-out]">
                                <div className="absolute -top-[50px] w-[130px] h-[140px] rounded-[32px] overflow-hidden shadow-xl border-[4px] border-white bg-black">
                                    <img src={customAvatarUrl || ''} className="w-full h-full object-cover" />
                                </div>
                                <h2 className="text-[22px] font-bold text-black mt-[85px] mb-3 tracking-wide">{characterName || '日向押守'}</h2>
                                <p className="text-[#a3a3a3] text-[12px] text-center leading-[1.6] mb-8 font-medium">
                                    数字生命接入设备将会在后台进行
                                    <br/>
                                    预计30秒，请保持设备持续开机与网络通畅
                                </p>
                                <div className="w-full h-[5px] bg-[#f2f2f7] rounded-full mb-8 overflow-hidden">
                                    <div className="h-full bg-[#cbee35] transition-all duration-300" style={{ width: `${importProgress || 0}%` }}></div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsImportModalOpen(false);
                                        setPhoneActivePage('IMPORT_PROGRESS');
                                    }}
                                    className="w-[180px] bg-black text-white py-3.5 rounded-full text-[14px] font-bold active:scale-[0.98] transition-transform tracking-widest shadow-md"
                                >
                                    好的
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[110px] h-[34px] rounded-full z-[60] flex items-center justify-end px-2 bg-black shadow-[inset_0px_0px_2px_1px_rgba(255,255,255,0.1)] ring-[1.2px] ring-black pointer-events-none">
                        <div className="w-3 h-3 rounded-full bg-[#1a1a1a] shadow-inner ring-[0.8px] ring-white/10 relative">
                            <div className="absolute top-[2px] right-[2px] w-[3px] h-[3px] rounded-full bg-blue-500/30 blur-[1px]"></div>
                        </div>
                    </div>

                    {/* Phone Status Bar */}
                    <div className={`absolute top-0 left-0 right-0 w-full h-14 flex justify-between items-center px-8 z-[50] text-[13px] font-semibold pointer-events-none ${isDarkMode ? 'text-white' : 'text-black'}`}>
                         <span className="mt-1 ml-1">{currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}</span>
                         <div className="flex items-center gap-1.5 mt-1 mr-1">
                             <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                             <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 22 1.34-21.4 1.34-20.67V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                         </div>
                    </div>
            
            {/* Phone Home Bar */}
            <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 rounded-full z-[60] pointer-events-none ${isDarkMode ? 'bg-white/40' : 'bg-black/30'}`}></div>
            </div>
            </div>
        </div>

        <div className="relative">
        {currentView === 'FRONT' && (
        <div className="w-[340px] h-[340px] relative rounded-full bg-[#1a1a1c] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center border border-gray-800 ring-1 ring-black animate-fadeIn">
          
          {/* Metallic Texture Overlay */}
          <div className="absolute inset-0 rounded-full opacity-30 pointer-events-none mix-blend-overlay" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.4\'/%3E%3C/svg%3E")'}}></div>

          {/* Speaker Holes */}
          <div className="absolute top-[16px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-[2px] z-10 pointer-events-none opacity-80">
              <div className="flex gap-[3px]">
                {[...Array(6)].map((_, i) => <div key={`r1-${i}`} className="w-[2px] h-[2px] rounded-full bg-black/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"></div>)}
              </div>
              <div className="flex gap-[3px]">
                 {[...Array(4)].map((_, i) => <div key={`r2-${i}`} className="w-[2px] h-[2px] rounded-full bg-black/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"></div>)}
              </div>
          </div>

          {/* Buttons */}
          <button 
             onMouseDown={handlePowerDown} 
             onMouseUp={handlePowerUp}
             onMouseLeave={handlePowerUp}
             onTouchStart={handlePowerDown}
             onTouchEnd={handlePowerUp}
             className="absolute left-[-4px] top-1/2 -translate-x-0 w-3 h-16 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-700 rounded-l-md shadow-[-2px_0_5px_rgba(0,0,0,0.5)] active:translate-x-[2px] transition-transform z-0 flex items-center justify-center border-y border-l border-gray-900 group"
             style={{ top: '50%', transform: 'translateY(-50%)' }}
             aria-label="电源"
          >
             {/* Power Icon Engraving */}
             <div className="w-[10px] h-3 relative opacity-60 group-active:opacity-80">
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" fill="none" className="w-full h-full text-gray-800 rotate-90">
                    <path d="M12 1v10" strokeLinecap="round" />
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" strokeLinecap="round" />
                </svg>
             </div>
          </button>

          <button 
            onMouseDown={startAiLongPress} onMouseUp={endAiLongPress} onMouseLeave={endAiLongPress} onTouchStart={startAiLongPress} onTouchEnd={endAiLongPress}
            className="absolute right-[15px] top-[80px] w-3 h-12 bg-gradient-to-l from-gray-600 via-gray-400 to-gray-700 rounded-r-md shadow-[2px_0_5px_rgba(0,0,0,0.5)] active:translate-x-[-2px] transition-transform z-0 flex items-center justify-center border-y border-r border-gray-900 origin-left -rotate-[20deg]"
            aria-label="AI 对话"
          >
             <div className="w-[1px] h-6 bg-purple-500/60 shadow-[0_0_2px_rgba(168,85,247,0.8)]"></div>
          </button>
          
          <button 
            onClick={handleFuncClick} 
            className="absolute right-[15px] bottom-[80px] w-3 h-12 bg-gradient-to-l from-gray-600 via-gray-400 to-gray-700 rounded-r-md shadow-[2px_0_5px_rgba(0,0,0,0.5)] active:translate-x-[-2px] transition-transform z-0 flex items-center justify-center border-y border-r border-gray-900 origin-left rotate-[20deg]"
            aria-label="菜单"
          >
            <div className="w-[1px] h-6 bg-black/20"></div>
          </button>

          {/* Lanyard Hole */}
          <div className="absolute top-[-10px] w-12 h-6 bg-[#1a1a1c] rounded-t-xl border-t border-x border-gray-800 flex justify-center items-end pb-1 shadow-md left-1/2 -translate-x-1/2">
             <div className="w-8 h-1.5 bg-black/80 rounded-full shadow-inner"></div>
          </div>

          {/* --- RGB Ring Layer --- */}
          <div className="relative w-[318px] h-[318px] rounded-full flex items-center justify-center bg-black shadow-inner">
             
             {/* The glowing LED strip */}
             {!aiPreloading && !aiExitPreloading && <div className={getLightStripClass()} style={{ 
                ...getLightStripStyle(),
                ...(mode === BadgeMode.CHAT_ENTERING || mode === BadgeMode.CHAT_EXITING ? { WebkitMaskImage: 'radial-gradient(closest-side, transparent 91%, black 94%)', maskImage: 'radial-gradient(closest-side, transparent 91%, black 94%)' } : {}) 
             }}></div>}
             
             {/* Solid strip for definition (hidden in power save, chat anims, exit anim, or cheer mode) */}
             {!aiPreloading && !aiExitPreloading && !isPowerSaving && (mode !== BadgeMode.CHAT_ENTERING && mode !== BadgeMode.CHAT_EXITING) && !(mode === BadgeMode.MENU && menuState === 'CHEER') && (!isScreenOff || isCharging) && (
                 <div 
                   className={`absolute inset-0 rounded-full border-[6px] transition-all duration-700 ${
                       mode === BadgeMode.CHAT ? 'border-white opacity-40' : 
                       ((mode === BadgeMode.IDLE || ((mode === BadgeMode.OFF || mode === BadgeMode.SLEEP || isScreenOff) && isCharging)) ? `opacity-40 ${chargingAnim}` : lightColor.replace('border-', 'border-') + ' opacity-40')
                   }`}
                   style={(mode === BadgeMode.IDLE || ((mode === BadgeMode.OFF || mode === BadgeMode.SLEEP || isScreenOff) && isCharging)) ? getLightStripStyle() : {}}
                 ></div>
             )}

             {/* AI Entry Preloading Strip */}
             {aiPreloading && (
                 <div className="absolute inset-0 rounded-full animate-fill-ring z-10" 
                      style={{ 
                        maskImage: 'radial-gradient(closest-side, transparent 96%, black 96.5%)',
                        WebkitMaskImage: 'radial-gradient(closest-side, transparent 96%, black 96.5%)'
                      }}
                 ></div>
             )}

             {/* AI Exit Animation Strip */}
             {aiExitPreloading && (
                 <div className="absolute inset-0 rounded-full animate-erase-ring z-10" 
                      style={{ 
                        maskImage: 'radial-gradient(closest-side, transparent 96%, black 96.5%)',
                        WebkitMaskImage: 'radial-gradient(closest-side, transparent 96%, black 96.5%)'
                      }}
                 ></div>
             )}

             {/* --- Screen Bezel & Glass --- */}
             <div className="w-[260px] h-[260px] bg-black rounded-full overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,1)] ring-1 ring-gray-800 z-20">
                
                {/* Apply Power Saving Dimming */}
                <div className="absolute inset-0 z-[100] pointer-events-none transition-all duration-500" style={{ backgroundColor: isPowerSaving ? 'rgba(0,0,0,0.8)' : 'transparent' }}></div>

                {/* Wallpaper Layer */}
                {(mode === BadgeMode.IDLE || mode === BadgeMode.MENU || mode === BadgeMode.SLEEP) && !isScreenOff && (
                    <Wallpaper activeResource={activeResource} mode={mode} volume={volume} />
                )}
                
                {/* Find My Device Overlay */}
                {isFindingDevice && (
                    <div className="absolute inset-0 z-[120] flex flex-col items-center justify-center animate-pulse bg-red-900/40 backdrop-blur-sm">
                        <div className="w-full h-full absolute inset-0 bg-gradient-to-tr from-red-600/30 to-blue-600/30 animate-spin-slow mix-blend-overlay"></div>
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="p-4 bg-black/50 rounded-full border border-white/20 shadow-[0_0_30px_red]">
                                <BellIcon className="w-12 h-12 text-white animate-bounce" />
                            </div>
                            <div className="text-white font-display text-lg tracking-widest font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">设备查找中</div>
                        </div>
                    </div>
                )}

                {/* Content Layer */}
                <div className="relative w-full h-full">
                  
                  {/* Screen Off Overlay (Keeps state active underneath) */}
                  {isScreenOff && mode !== BadgeMode.OFF && (
                     <div className="absolute inset-0 z-[200] bg-black flex flex-col items-center justify-center">
                          {isCharging && (
                              <div className="flex flex-col items-center animate-fadeIn">
                                  <div 
                                    className="text-4xl font-display font-bold transition-colors duration-500"
                                    style={{ color: batteryInfoColor, filter: `drop-shadow(0 0 10px ${batteryInfoColor})` }}
                                  >
                                    {batteryLevel}%
                                  </div>
                                  <div 
                                    className="text-xs mt-3 font-medium tracking-widest transition-colors duration-500"
                                    style={{ color: batteryInfoColor, opacity: 0.8 }}
                                  >
                                    {batteryLevel === 100 ? "充电已完成" : "正在充电中..."}
                                  </div>
                              </div>
                          )}
                     </div>
                  )}

                  {/* Screen Components */}
                  {mode === BadgeMode.IDLE && (
                    <div 
                      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden cursor-grab active:cursor-grabbing z-10"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={handleTouchStart}
                      onMouseUp={handleTouchEnd}
                      onMouseLeave={() => { touchStartX.current = null; }}
                    >
                      {/* Removed Battery Display from here as per request */}
                      {!activeResource && <div className="text-white/20 font-display text-[10px] tracking-widest absolute bottom-6">无信号</div>}
                    </div>
                  )}
                  {mode === BadgeMode.MENU && (
                      <ScreenMenu
                          menuState={menuState}
                          setMenuState={setMenuState}
                          isPowerSaving={isPowerSaving}
                          togglePowerSave={togglePowerSave}
                          volume={volume}
                          setVolume={setVolume}
                          handleVolumeClick={handleVolumeClick}
                          handleCameraClick={handleCameraClick}
                          onPhotoCapture={handlePhotoCapture}
                          pickupData={pickupData}
                          handlePickupClick={handlePickupClick}
                          handleDeleteRequest={handleDeleteRequest}
                          confirmDelete={confirmDelete}
                          handleLinkClick={handleLinkClick}
                          handleQRCodeClick={handleQRCodeClick}
                          handleCheerClick={handleCheerClick}
                          cheerColorIndex={cheerColorIndex}
                          isCheerStrobe={isCheerStrobe}
                          setIsCheerStrobe={setIsCheerStrobe}
                          handleTouchStart={handleTouchStart}
                          handleTouchEnd={handleTouchEnd}
                          brightness={brightness}
                          setBrightness={setBrightness}
                          handleBrightnessClick={handleBrightnessClick}
                          currentTime={currentTime}
                          batteryLevel={batteryLevel}
                          isCharging={isCharging}
                          uploadedText={uploadedText}
                          textSpeed={textSpeed}
                          textColor={textColor}
                          textSize={textSize}
                      />
                  )}
                  {(mode === BadgeMode.OFF || mode === BadgeMode.SLEEP) && (
                      <div className="w-full h-full bg-black flex flex-col items-center justify-center z-50 absolute inset-0">
                          {/* Charging UI for OFF Mode */}
                          {isCharging && (
                              <div className="flex flex-col items-center">
                                  <div 
                                    className="text-4xl font-display font-bold transition-colors duration-500"
                                    style={{ color: batteryInfoColor, filter: `drop-shadow(0 0 10px ${batteryInfoColor})` }}
                                  >
                                    {batteryLevel}%
                                  </div>
                                  <div 
                                    className="text-xs mt-3 font-medium tracking-widest transition-colors duration-500"
                                    style={{ color: batteryInfoColor, opacity: 0.8 }}
                                  >
                                    {batteryLevel === 100 ? "充电已完成" : "正在充电中..."}
                                  </div>
                              </div>
                          )}
                      </div>
                  )}
                  {mode === BadgeMode.BOOTING && (
                    <div className="w-full h-full bg-black flex flex-col items-center justify-center relative overflow-hidden z-50 animate-fadeIn">
                       <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 animate-spin-slow">
                          {[...Array(36)].map((_,i) => <div key={i} className="border-[0.5px] border-[#01fce9]/20"></div>)}
                       </div>
                       <div className="z-10 flex flex-col items-center">
                         <div className="text-[#01fce9] font-display font-bold text-4xl tracking-tighter animate-[pulse_0.2s_ease-in-out_infinite] drop-shadow-[0_0_15px_rgba(1,252,233,0.6)]">BBS</div>
                       </div>
                    </div>
                  )}
                  {mode === BadgeMode.SHUTTING_DOWN && (
                    <div className="w-full h-full bg-black flex flex-col items-center justify-center relative z-50 overflow-hidden">
                       <div className="w-full h-[2px] bg-red-500 shadow-[0_0_20px_red] animate-ping absolute top-1/2 -translate-y-1/2"></div>
                       <div className="text-red-500 font-mono text-xs mt-2 animate-pulse z-10 bg-black px-2">系统离线</div>
                    </div>
                  )}
                  {(mode === BadgeMode.CHAT_ENTERING || mode === BadgeMode.CHAT_EXITING) && (
                    <div className="w-full h-full bg-black flex flex-col items-center justify-center relative overflow-hidden z-50 animate-fadeIn">
                        {(() => {
                            const res = mode === BadgeMode.CHAT_ENTERING ? aiResources[11] : aiResources[12];
                            if (res) {
                                return res.type === 'video' ? (
                                    <video 
                                        src={res.url} 
                                        autoPlay 
                                        playsInline
                                        ref={(el) => { if(el) el.volume = volume / 100; }}
                                        className="w-full h-full object-cover"
                                        onEnded={() => setMode(mode === BadgeMode.CHAT_ENTERING ? BadgeMode.CHAT : BadgeMode.IDLE)}
                                    />
                                ) : (
                                    <img src={res.url} className="w-full h-full object-cover" alt="Animation" />
                                );
                            }
                            // Fallback default animation
                            return (
                                <>
                                    <div className="w-16 h-16 rounded-full border-2 border-t-white border-white/20 animate-spin"></div>
                                    <div className="text-white/70 text-xs mt-4 font-display tracking-widest animate-pulse">AI LOADING</div>
                                </>
                            );
                        })()}
                    </div>
                  )}
                  {mode === BadgeMode.CHAT && (
                     <ChatComp 
                       ref={chatRef}
                       volume={volume} 
                       setMode={setMode} 
                       setChatStatus={setChatStatus} 
                       chatStatus={chatStatus}
                       backgroundResource={activeAiResource}
                       onGenerateImage={handleImageGeneration}
                       aiResources={aiResources}
                       activeAiResourceId={activeAiResourceId}
                       setActiveAiResourceId={setActiveAiResourceId}
                       isMenuOpen={isChatMenuOpen}
                       onCloseMenu={() => setIsChatMenuOpen(false)}
                       onAiResourceUpload={(slotId, file) => handleAiFileUpload(null, slotId, file)}
                       onNfcEnd={handleNfcComplete}
                       whiteNoiseAudios={whiteNoiseAudios}
                       onSleep={() => setIsScreenOff(true)}
                     />
                  )}
                </div>

                {/* Glass Reflection Overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none z-50 opacity-50 mix-blend-overlay"></div>
                <div className="absolute top-4 right-8 w-24 h-12 bg-white/5 blur-xl rounded-full transform -rotate-45 pointer-events-none z-50"></div>
                
                {/* Toast Overlay */}
                {toastMessage && (
                   <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-[10px] px-3 py-1.5 rounded-full border border-gray-700 shadow-xl z-[60] whitespace-nowrap animate-slideDown backdrop-blur-md">
                      {toastMessage}
                   </div>
                )}
             </div>
          </div>
        </div>
        )}
        
        {/* ... (Other views BACK/LEFT/RIGHT remain the same) ... */}
        {currentView === 'LEFT' && (
          <div className="flex flex-col items-center gap-6 animate-fadeIn">
              {/* The Device Side View - NFC Panel Removed */}
              <div className="w-[60px] h-[340px] rounded-2xl bg-gradient-to-r from-[#1a1a1c] via-[#2a2a2c] to-[#0a0a0c] shadow-2xl relative flex items-center justify-center border-y border-gray-800">
                 <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none mix-blend-overlay" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.4\'/%3E%3C/svg%3E")'}}></div>
                 <div className={`absolute right-[5px] top-4 bottom-4 w-1 rounded-full ${isPowerSaving ? 'opacity-0' : lightColor.replace('border-', 'bg-')} blur-[2px] opacity-60 ${mode !== BadgeMode.OFF && mode !== BadgeMode.SLEEP && !isPowerSaving ? 'opacity-80' : 'opacity-0'}`}></div>
                 <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3 h-16 bg-gradient-to-b from-gray-600 via-gray-400 to-gray-700 rounded-md shadow-lg border border-black/30 flex flex-col justify-center items-center">
                     <div className="w-1 h-8 bg-black/20 rounded-full"></div>
                 </div>
                 <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-8 h-4 bg-[#1a1a1c] rounded-t-lg border-t border-gray-700"></div>
                 
                 {/* NFC Contact Point Indicator */}
                 <div className="absolute top-10 left-1/2 -translate-x-1/2 w-8 h-12 border border-white/10 rounded-md flex items-center justify-center opacity-30 pointer-events-none">
                    <span className="text-[8px] text-white rotate-90">NFC</span>
                 </div>
              </div>
          </div>
        )}
        
        {currentView === 'RIGHT' && (
          <div className="w-[60px] h-[340px] rounded-2xl bg-gradient-to-l from-[#1a1a1c] via-[#2a2a2c] to-[#0a0a0c] shadow-2xl relative flex items-center justify-center border-y border-gray-800 animate-fadeIn mx-auto">
             <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none mix-blend-overlay" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.4\'/%3E%3C/svg%3E")'}}></div>
             <div className={`absolute left-[5px] top-4 bottom-4 w-1 rounded-full ${isPowerSaving ? 'opacity-0' : lightColor.replace('border-', 'bg-')} blur-[2px] opacity-60 ${mode !== BadgeMode.OFF && mode !== BadgeMode.SLEEP && !isPowerSaving ? 'opacity-80' : 'opacity-0'}`}></div>
             <div className="absolute left-1/2 -translate-x-1/2 top-[80px] w-3 h-12 bg-gradient-to-b from-gray-600 via-gray-400 to-gray-700 rounded-md shadow-lg border border-black/30 flex flex-col justify-center items-center">
                 <div className="w-1 h-6 bg-purple-500/50 shadow-[0_0_2px_rgba(168,85,247,0.8)] rounded-full"></div>
             </div>
             <div className="absolute left-1/2 -translate-x-1/2 bottom-[80px] w-3 h-12 bg-gradient-to-b from-gray-600 via-gray-400 to-gray-700 rounded-md shadow-lg border border-black/30 flex flex-col justify-center items-center">
                 <div className="w-1 h-6 bg-black/20 rounded-full"></div>
             </div>
             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-8 h-4 bg-[#1a1a1c] rounded-t-lg border-t border-gray-700"></div>
          </div>
        )}

        {currentView === 'BACK' && (
          <div className="w-[340px] h-[340px] relative rounded-full bg-[#151517] shadow-2xl flex items-center justify-center border border-gray-800 ring-1 ring-black animate-fadeIn overflow-hidden">
            <div className="absolute inset-0 rounded-full opacity-60 pointer-events-none mix-blend-overlay" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.4\'/%3E%3C/svg%3E")'}}></div>
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center relative z-10 border border-gray-800">
                <div className="w-36 h-36 rounded-full bg-[#0a0a0c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center border border-gray-800">
                   <div className="text-gray-700 font-display font-bold text-xl tracking-widest opacity-30 select-none">BBS</div>
                </div>
            </div>
            <div className="absolute bottom-16 flex flex-col items-center gap-1 z-10">
               <div className="flex gap-2 bg-gray-900/80 px-3 py-1.5 rounded-full border border-gray-800 shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-sm border border-amber-800/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-sm border border-amber-800/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-sm border border-amber-800/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-sm border border-amber-800/50"></div>
               </div>
               <span className="text-[6px] text-gray-600 font-mono tracking-wider">磁吸充电 5V</span>
            </div>
            <div className="absolute top-8 w-3 h-3 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center border border-black/50"><div className="w-2 h-[1px] bg-black/50 rotate-45"></div><div className="w-2 h-[1px] bg-black/50 -rotate-45"></div></div>
            <div className="absolute left-10 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center border border-black/50"><div className="w-2 h-[1px] bg-black/50 rotate-45"></div><div className="w-2 h-[1px] bg-black/50 -rotate-45"></div></div>
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center border border-black/50"><div className="w-2 h-[1px] bg-black/50 rotate-45"></div><div className="w-2 h-[1px] bg-black/50 -rotate-45"></div></div>
            <div className="absolute bottom-6 text-[8px] text-gray-600 font-display tracking-wider opacity-50">BBS 实验室设计</div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}