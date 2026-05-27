
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Resource, BadgeMode, Coin, FloatingText, RanchEntity } from '../types';
import { sendMessageStream, startNewSession } from '../services/geminiService';
import { DEFAULT_AVATAR, EMOTION_TO_SLOT, WHITE_NOISE_TYPES } from '../constants';
import { HeartIcon, MoonIcon } from './Icons';
import RanchComp from './features/RanchComp';
import PomodoroComp from './features/PomodoroComp';
import WhiteNoiseComp from './features/WhiteNoiseComp';
import DivinationComp from './features/DivinationComp';

// --- Seamless Media Components ---
interface MediaLayerProps {
  resource: Resource;
  loop: boolean;
  muted: boolean;
  volume: number;
  onReady?: () => void;
  onEnded?: () => void;
  opacity: number;
  zIndex: number;
}

const MediaLayer: React.FC<MediaLayerProps> = ({ 
  resource, 
  loop, 
  muted, 
  volume, 
  onReady, 
  onEnded, 
  opacity,
  zIndex 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.volume = muted ? 0 : volume / 100;
    }
  }, [volume, muted]);

  // Handle Playback Retry
  useEffect(() => {
      if (resource.type === 'video' && videoRef.current) {
          // Attempt to play if it's paused or stopped
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
              playPromise.catch(() => {});
          }
      }
  }, [resource]);

  if (resource.type === 'image') {
      return (
          <>
            <img 
                src={resource.url} 
                alt="bg"
                className="absolute inset-0 w-full h-full object-cover scale-110 transition-opacity duration-500 ease-in-out"
                style={{ opacity: opacity, zIndex }} 
                onLoad={onReady}
            />
          </>
      );
  }

  return (
      <video
        ref={videoRef}
        src={resource.url}
        className="absolute inset-0 w-full h-full object-cover scale-110 transition-opacity duration-500 ease-in-out"
        style={{ opacity: opacity, zIndex }} 
        autoPlay
        playsInline
        loop={loop}
        muted={muted}
        onCanPlay={() => {
            onReady && onReady();
        }}
        onEnded={onEnded}
      />
  );
};

const SeamlessBackground = ({ 
    resource, 
    shouldLoop, 
    onEnded, 
    volume 
}: { 
    resource?: Resource, 
    shouldLoop: boolean, 
    onEnded?: () => void, 
    volume: number 
}) => {
    const [current, setCurrent] = useState<{ res: Resource, loop: boolean } | null>(null);
    const [next, setNext] = useState<{ res: Resource, loop: boolean } | null>(null);
    const [isNextReady, setIsNextReady] = useState(false);
    
    const effectiveResource = resource || DEFAULT_AVATAR;

    useEffect(() => {
        if (!current && !next) {
            setCurrent({ res: effectiveResource, loop: shouldLoop });
        }
    }, []);

    useEffect(() => {
        if (effectiveResource.id !== current?.res.id && effectiveResource.id !== next?.res.id) {
            setNext({ res: effectiveResource, loop: shouldLoop });
            setIsNextReady(false);
        }
    }, [effectiveResource, shouldLoop, current, next]);

    useEffect(() => {
        if (isNextReady && next) {
            const timer = setTimeout(() => {
                setCurrent(next);
                setNext(null);
                setIsNextReady(false);
            }, 500); 
            return () => clearTimeout(timer);
        }
    }, [isNextReady, next]);

    const handleNextReady = () => setIsNextReady(true);

    return (
        <>
            {current && (
                 <MediaLayer 
                    key={current.res.id} 
                    resource={current.res} 
                    loop={current.loop}
                    muted={!!next && isNextReady} 
                    volume={volume}
                    onEnded={!next ? onEnded : undefined} 
                    zIndex={10}
                    opacity={1} 
                 />
            )}
            
            {next && (
                 <MediaLayer 
                    key={next.res.id} 
                    resource={next.res} 
                    loop={next.loop}
                    muted={false}
                    volume={volume}
                    onReady={handleNextReady}
                    zIndex={20}
                    opacity={isNextReady ? 1 : 0} 
                 />
            )}
        </>
    )
}

const FORTUNES = ['大吉', '中吉', '小吉', '吉', '末吉', '凶', '大凶', '桃花运爆棚', '财运滚滚', '水逆退散', '宜摸鱼', '忌加班', '今日宜告白', '诸事顺遂'];

const DEFAULT_ENTITY_IMGS = [
    'https://image.pollinations.ai/prompt/pixel%20art%20slime%20monster%20cute?width=128&height=128&nologo=true',
    'https://image.pollinations.ai/prompt/pixel%20art%20ghost%20cute?width=128&height=128&nologo=true',
    'https://image.pollinations.ai/prompt/pixel%20art%20robot%20pet?width=128&height=128&nologo=true'
];

export interface ChatCompHandle {
    handleMenuPress: () => boolean;
}

// --- Chat Component ---
const ChatComp = forwardRef<ChatCompHandle, { 
  volume: number;
  setMode: React.Dispatch<React.SetStateAction<BadgeMode>>;
  setChatStatus: React.Dispatch<React.SetStateAction<'IDLE' | 'LISTENING' | 'SPEAKING'>>;
  chatStatus: 'IDLE' | 'LISTENING' | 'SPEAKING';
  backgroundResource?: Resource;
  onGenerateImage: (url: string, name: string) => void;
  aiResources: Record<number, Resource>;
  activeAiResourceId: string | null;
  setActiveAiResourceId: (id: string | null) => void;
  isMenuOpen: boolean;
  onCloseMenu: () => void;
  onAiResourceUpload?: (slotId: number, file: File) => void; 
  onNfcEnd?: () => void;
  whiteNoiseAudios?: Record<string, string>;
  onSleep?: () => void;
}>(({ 
  volume, 
  setMode, 
  setChatStatus, 
  chatStatus,
  backgroundResource,
  onGenerateImage,
  aiResources,
  activeAiResourceId,
  setActiveAiResourceId,
  isMenuOpen,
  onCloseMenu,
  onAiResourceUpload,
  onNfcEnd,
  whiteNoiseAudios = {},
  onSleep
}, ref) => {
   const recognitionRef = useRef<any>(null);
   const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
   const [displayText, setDisplayText] = useState("你好呀！我是 醒春。");
   const [isTextBoxVisible, setIsTextBoxVisible] = useState(false);
   const [isIntimacyVisible, setIsIntimacyVisible] = useState(true);
   const isMountedRef = useRef(true);
   const chatStatusRef = useRef(chatStatus);
   const chatTouchStartX = useRef<number | null>(null);
   const idleTimerRef = useRef<number | null>(null);
   const textBoxTimerRef = useRef<number | null>(null);

   // --- Chat Logic State ---
   const [chatRoundCount, setChatRoundCount] = useState(0);

   // --- Pomodoro State ---
   const [pomodoroStatus, setPomodoroStatus] = useState<'IDLE' | 'SETTINGS' | 'FOCUS' | 'BREAK' | 'CONFIRM_STOP'>('IDLE');
   const [focusLength, setFocusLength] = useState(25); 
   const [breakLength, setBreakLength] = useState(5); 
   const [timeLeft, setTimeLeft] = useState(0); 
   const timerIntervalRef = useRef<number | null>(null);
   
   // --- White Noise State ---
   const [whiteNoiseStatus, setWhiteNoiseStatus] = useState<'IDLE' | 'ACTIVE' | 'VOLUME_ADJUST'>('IDLE');
   const [whiteNoiseIndex, setWhiteNoiseIndex] = useState(0);
   const [isPlayingWhiteNoise, setIsPlayingWhiteNoise] = useState(true);
   const [localVolume, setLocalVolume] = useState(volume); 
   const audioRef = useRef<HTMLAudioElement | null>(null);

   // --- Divination State ---
   const [divinationStatus, setDivinationStatus] = useState<'IDLE' | 'INTRO' | 'WAITING' | 'SPEAKING' | 'CONFIRM_EXIT'>('IDLE');
   const [divinationStep, setDivinationStep] = useState(0);
   const [targetFortune, setTargetFortune] = useState<string>('');
   const [divinationRoundLimit, setDivinationRoundLimit] = useState(3);
   
   const divinationStepRef = useRef(0);
   const targetFortuneRef = useRef('');
   const divinationRoundLimitRef = useRef(3);

   // --- Sleep Aid State ---
   const [sleepAidStatus, setSleepAidStatus] = useState<'IDLE' | 'INTRO' | 'WAITING_INPUT' | 'TELLING'>('IDLE');
   const sleepTimerRef = useRef<number | null>(null);

   // --- Data Ranch State ---
   const [ranchStatus, setRanchStatus] = useState<'IDLE' | 'ACTIVE' | 'DETAIL'>('IDLE');
   const [goldCount, setGoldCount] = useState(1280);
   const [showGoldHeader, setShowGoldHeader] = useState(false);
   const [coins, setCoins] = useState<Coin[]>([]);
   const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
   const [ranchEntities, setRanchEntities] = useState<RanchEntity[]>([]);
   const [selectedEntity, setSelectedEntity] = useState<RanchEntity | null>(null);
   
   const goldHeaderTimerRef = useRef<number | null>(null);
   const coinIntervalRef = useRef<number | null>(null);
   const entityAnimRef = useRef<number | null>(null);

   // Sync Refs for imperative handle
   const ranchStatusRef = useRef(ranchStatus);
   useEffect(() => { ranchStatusRef.current = ranchStatus; }, [ranchStatus]);
   
   const pomodoroStatusRef = useRef(pomodoroStatus);
   useEffect(() => { pomodoroStatusRef.current = pomodoroStatus; }, [pomodoroStatus]);
   
   const whiteNoiseStatusRef = useRef(whiteNoiseStatus);
   useEffect(() => { whiteNoiseStatusRef.current = whiteNoiseStatus; }, [whiteNoiseStatus]);
   
   const divinationStatusRef = useRef(divinationStatus);
   useEffect(() => { divinationStatusRef.current = divinationStatus; }, [divinationStatus]);
   
   const sleepAidStatusRef = useRef(sleepAidStatus);
   useEffect(() => { sleepAidStatusRef.current = sleepAidStatus; }, [sleepAidStatus]);

   const activeAiResourceIdRef = useRef(activeAiResourceId);
   useEffect(() => { activeAiResourceIdRef.current = activeAiResourceId; }, [activeAiResourceId]);

   // Helper: Is any sub-feature active?
   const isAnyFeatureActive = () => {
       return ranchStatusRef.current !== 'IDLE' || 
              pomodoroStatusRef.current !== 'IDLE' || 
              whiteNoiseStatusRef.current !== 'IDLE' || 
              divinationStatusRef.current !== 'IDLE' ||
              sleepAidStatusRef.current !== 'IDLE';
   };

   // --- IMPERATIVE HANDLE FOR MENU BUTTON ---
   useImperativeHandle(ref, () => ({
       handleMenuPress: () => {
           // 1. Ranch Logic
           if (ranchStatusRef.current === 'DETAIL') {
               setRanchStatus('ACTIVE');
               setSelectedEntity(null);
               return true;
           }
           if (ranchStatusRef.current === 'ACTIVE') {
               setRanchStatus('IDLE');
               onCloseMenu();
               if (aiResources[1]) setActiveAiResourceId(aiResources[1].id);
               return true;
           }

           // 2. Pomodoro Logic
           if (pomodoroStatusRef.current === 'SETTINGS') {
               setPomodoroStatus('IDLE');
               return true;
           }
           if (pomodoroStatusRef.current === 'FOCUS' || pomodoroStatusRef.current === 'BREAK') {
               setPomodoroStatus('CONFIRM_STOP');
               return true;
           }
           if (pomodoroStatusRef.current === 'CONFIRM_STOP') {
               const isFocus = aiResources[17] && activeAiResourceIdRef.current === aiResources[17].id;
               setPomodoroStatus(isFocus ? 'FOCUS' : 'BREAK');
               return true;
           }

           // 3. Divination Logic
           if (divinationStatusRef.current === 'INTRO' || divinationStatusRef.current === 'WAITING' || divinationStatusRef.current === 'SPEAKING') {
               setDivinationStatus('CONFIRM_EXIT');
               return true;
           }
           if (divinationStatusRef.current === 'CONFIRM_EXIT') {
               setDivinationStatus('WAITING'); 
               return true;
           }

           // 4. White Noise Logic
           if (whiteNoiseStatusRef.current === 'VOLUME_ADJUST') {
               setWhiteNoiseStatus('ACTIVE');
               return true;
           }
           if (whiteNoiseStatusRef.current === 'ACTIVE') {
               setWhiteNoiseStatus('IDLE');
               onCloseMenu();
               if (aiResources[1]) setActiveAiResourceId(aiResources[1].id);
               return true;
           }

           // 5. Sleep Aid Logic
           if (sleepAidStatusRef.current !== 'IDLE') {
               setSleepAidStatus('IDLE');
               if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
               onCloseMenu();
               if (aiResources[1]) setActiveAiResourceId(aiResources[1].id);
               startNewSession(); // Reset persona
               return true;
           }

           return false; // Not handled, pass to main chat menu
       }
   }));

   // --- Sub-Feature Start Wrappers ---
   const startDivination = () => {
        setDivinationStatus('INTRO');
        if (aiResources[20]) setActiveAiResourceId(aiResources[20].id);
        const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        const rounds = Math.floor(Math.random() * 4) + 2; 
        setTargetFortune(fortune);
        setDivinationRoundLimit(rounds);
        setDivinationStep(0);
        targetFortuneRef.current = fortune;
        divinationRoundLimitRef.current = rounds;
        divinationStepRef.current = 0;
        startNewSession("身份：虚拟电子徽章助手“醒春”。正在进行趣味占卜模式。性格：活泼可爱，古灵精怪，喜欢撒娇，偶尔有点中二。语言风格：虽然是占卜，但依然保持少女的元气，可以使用一些玄学或科幻词汇，但要显得可爱。回复限制：简短（1-2句），句首必须带[情绪]标签。最高指令：在占卜模式下，绝对禁止闲聊！绝对禁止回答与占卜流程无关的问题（如天气、心情、科普等）。如果用户说无关话题，请用可爱的语气拒绝（如：“哎呀，现在是神圣的占卜时间，不要分心嘛！”），并强制将话题拉回占卜流程。");
   };

   const startWhiteNoise = () => {
        setWhiteNoiseStatus('ACTIVE');
        if (aiResources[19]) setActiveAiResourceId(aiResources[19].id);
   };

   const startPomodoroSettings = () => {
        setPomodoroStatus('SETTINGS');
   };

   const startRanch = () => {
        setRanchStatus('ACTIVE');
   };

   const startSleepAid = () => {
        setSleepAidStatus('INTRO');
        if (aiResources[23]) setActiveAiResourceId(aiResources[23].id);
        startNewSession("身份：虚拟电子徽章助手“醒春”。当前模式：哄睡故事讲述者。性格：极度温柔、舒缓、安心。语言风格：语速缓慢，用词温暖治愈。指令：1. 刚开始请用温柔的语气询问用户想听什么类型的故事，让用户提供三个关键词。 2. 收到关键词后，根据关键词编一个治愈温馨的睡前故事。 3. 如果用户没有回应（超时），你会收到[随机生成]的指令，此时请随机选择一个温馨主题（如星空、森林、海洋）讲故事。 4. 讲完故事后，必须用温柔的语气和用户道晚安。 5. 任何时候用户在故事讲述期间说话，请温柔地提醒用户“嘘... 专心听故事，早点睡觉哦”，不要中断故事氛围进行闲聊。回复限制：句首必须带[平常]标签。");
        speak("要睡觉了吗？想听什么故事呢？告诉我三个关键词吧。", 23, () => {
            setSleepAidStatus('WAITING_INPUT');
            if (aiResources[24]) setActiveAiResourceId(aiResources[24].id);
            // 10s Timeout for random story
            if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
            sleepTimerRef.current = window.setTimeout(() => {
                if (sleepAidStatusRef.current === 'WAITING_INPUT') {
                    setSleepAidStatus('TELLING');
                    if (aiResources[24]) setActiveAiResourceId(aiResources[24].id); // Use 24 (Waiting) while generating
                    // Trigger AI to generate random story via hidden message mechanism handled in onResult
                    const stream = sendMessageStream("[系统指令: 用户未响应，请随机选择一个温馨治愈的主题（如云朵、星辰、萤火虫），直接开始讲一个简短的睡前故事。讲完后记得道晚安。]", handleToolCall);
                    handleAiStream(stream, 25);
                }
            }, 10000);
        });
   };

   // --- Data Ranch Logic ---
   const coinsRef = useRef(coins);
   const ranchEntitiesRef = useRef(ranchEntities);

   useEffect(() => { coinsRef.current = coins; }, [coins]);
   useEffect(() => { ranchEntitiesRef.current = ranchEntities; }, [ranchEntities]);

   useEffect(() => {
       if (ranchStatus === 'ACTIVE') {
           if (coinIntervalRef.current) clearInterval(coinIntervalRef.current);
           coinIntervalRef.current = window.setInterval(() => {
               if (ranchEntitiesRef.current.length > 0 && coinsRef.current.length < 5) { 
                   const newCoin: Coin = {
                       id: Date.now() + Math.random(),
                       x: 10 + Math.random() * 80, 
                       y: 20 + Math.random() * 60, 
                   };
                   setCoins(prev => [...prev, newCoin]);
               }
           }, 3000); 
       } else {
           if (coinIntervalRef.current) clearInterval(coinIntervalRef.current);
       }
       return () => { if (coinIntervalRef.current) clearInterval(coinIntervalRef.current); };
   }, [ranchStatus]); 

   useEffect(() => {
       if (ranchStatus === 'ACTIVE') {
           const updateEntities = () => {
               setRanchEntities(prev => prev.map(entity => {
                   let nextX = entity.x + entity.vx;
                   let nextY = entity.y + entity.vy;
                   if (nextX <= 0 || nextX >= 85) entity.vx *= -1; 
                   if (nextY <= 10 || nextY >= 70) entity.vy *= -1; 
                   return {
                       ...entity,
                       x: Math.max(0, Math.min(85, nextX)),
                       y: Math.max(10, Math.min(70, nextY))
                   };
               }));
               entityAnimRef.current = requestAnimationFrame(updateEntities);
           };
           entityAnimRef.current = requestAnimationFrame(updateEntities);
       } else {
           if (entityAnimRef.current) cancelAnimationFrame(entityAnimRef.current);
       }
       return () => { if (entityAnimRef.current) cancelAnimationFrame(entityAnimRef.current); };
   }, [ranchStatus]);

   const collectCoin = (e: React.MouseEvent | React.TouchEvent, id: number, x: number, y: number) => {
       e.stopPropagation();
       setCoins(prev => prev.filter(c => c.id !== id));
       setGoldCount(prev => prev + 1);
       const newFloat: FloatingText = { id: Date.now() + Math.random(), x, y, text: '+1' };
       setFloatingTexts(prev => [...prev, newFloat]);
       setTimeout(() => {
           setFloatingTexts(prev => prev.filter(f => f.id !== newFloat.id));
       }, 1000);
       
       setShowGoldHeader(true);
       if (goldHeaderTimerRef.current) clearTimeout(goldHeaderTimerRef.current);
       goldHeaderTimerRef.current = window.setTimeout(() => {
           setShowGoldHeader(false);
       }, 2000);
   };

   const spawnEntityFromEmotion = (emotion: string) => {
       const slotId = EMOTION_TO_SLOT[emotion] || 34; 
       const resource = aiResources[slotId];
       const fallbackUrl = DEFAULT_ENTITY_IMGS[Math.floor(Math.random() * DEFAULT_ENTITY_IMGS.length)];
       const url = resource ? resource.url : fallbackUrl;
       
       const newEntity: RanchEntity = {
           id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
           url: url,
           name: `${emotion}精灵`, 
           emotion: emotion,
           intro: `这是你在对话中产生【${emotion}】情绪时诞生的电子生物。它携带了当时的记忆碎片。`,
           x: 50, y: 50, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: 20, sourceTag: emotion
       };
       setRanchEntities(prev => [...prev, newEntity]);
       setToastMessage("牧场诞生了新生物！");
   };
   
   const [toastMessage, setToastMessage] = useState<string | null>(null);
   useEffect(() => {
       if(toastMessage) {
           const t = setTimeout(() => setToastMessage(null), 2000);
           return () => clearTimeout(t);
       }
   }, [toastMessage]);

   const exitRanch = () => {
       setRanchStatus('IDLE');
       onCloseMenu();
   };

   const openEntityDetail = (entity: RanchEntity) => {
       setSelectedEntity(entity);
       setRanchStatus('DETAIL');
   };

   const closeRanchDetail = () => {
       setRanchStatus('ACTIVE');
       setSelectedEntity(null);
   };

   // Pomodoro Logic
   useEffect(() => {
       if (pomodoroStatus === 'FOCUS' || pomodoroStatus === 'BREAK') {
           timerIntervalRef.current = window.setInterval(() => {
               setTimeLeft(prev => {
                   if (prev <= 0) {
                       if (pomodoroStatus === 'FOCUS') {
                           setPomodoroStatus('BREAK');
                           setTimeLeft(breakLength * 60);
                           if (aiResources[18]) setActiveAiResourceId(aiResources[18].id);
                       } else {
                           setPomodoroStatus('FOCUS');
                           setTimeLeft(focusLength * 60);
                           if (aiResources[17]) setActiveAiResourceId(aiResources[17].id);
                       }
                       return 0;
                   }
                   return prev - 1;
               });
           }, 1000);
       } else {
           if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
       }
       return () => {
           if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
       };
   }, [pomodoroStatus, focusLength, breakLength, aiResources]);

   const startPomodoro = () => {
       setPomodoroStatus('FOCUS');
       setTimeLeft(focusLength * 60);
       if (aiResources[17]) setActiveAiResourceId(aiResources[17].id);
   };

   const stopPomodoro = () => {
       setPomodoroStatus('IDLE');
       onCloseMenu();
       if (aiResources[1]) setActiveAiResourceId(aiResources[1].id);
       startNewSession();
   };

   // White Noise Logic
   useEffect(() => {
       if (!audioRef.current) {
           audioRef.current = new Audio();
           audioRef.current.loop = true;
       }
       const audio = audioRef.current;
       const currentType = WHITE_NOISE_TYPES[whiteNoiseIndex];
       const src = whiteNoiseAudios[currentType.id];

       if (whiteNoiseStatus === 'ACTIVE' && isPlayingWhiteNoise && src) {
           if (audio.src !== src) {
               audio.src = src;
           }
           // Use a promise to handle play safely
           const playPromise = audio.play();
           if (playPromise !== undefined) {
               playPromise.catch(error => {
                   console.log("Audio play failed (user interaction needed or invalid src)", error);
               });
           }
       } else {
           audio.pause();
       }
   }, [whiteNoiseStatus, isPlayingWhiteNoise, whiteNoiseIndex, whiteNoiseAudios]);

   useEffect(() => {
       if(audioRef.current) audioRef.current.volume = localVolume / 100;
   }, [localVolume]);

   const exitWhiteNoise = () => {
       setWhiteNoiseStatus('IDLE');
       if (audioRef.current) {
           audioRef.current.pause();
           audioRef.current.currentTime = 0;
       }
       onCloseMenu();
       if (aiResources[1]) setActiveAiResourceId(aiResources[1].id);
   };

   // Divination Logic
   const stopDivination = () => {
       setDivinationStatus('IDLE');
       onCloseMenu();
       if (aiResources[1]) setActiveAiResourceId(aiResources[1].id);
       startNewSession();
   };

   useEffect(() => {
       setLocalVolume(volume);
   }, [volume]);

   // Menu Logic Refs
   const menuScrollRef = useRef<HTMLDivElement>(null);
   const [activeMenuIndex, setActiveMenuIndex] = useState(2); 

   const menuItems = [
     { id: 'rocket', content: '🚀', color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/30', onClick: startRanch },
     { id: 'heart', content: '🔮', color: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-500/30', onClick: startDivination },
     { id: 'dice', content: '🎲', color: 'from-pink-400 to-rose-600', shadow: 'shadow-pink-500/30', onClick: startPomodoroSettings },
     { id: 'candy', content: '🍬', color: 'from-green-400 to-emerald-600', shadow: 'shadow-green-500/30', onClick: startWhiteNoise },
     { id: 'moon', content: <MoonIcon className="w-6 h-6"/>, color: 'from-indigo-400 to-slate-600', shadow: 'shadow-indigo-500/30', onClick: startSleepAid },
   ];

   // Intimacy & Greeting Timer
   useEffect(() => {
     setTimeout(() => { if (isMountedRef.current) setIsIntimacyVisible(false); }, 3000);
     setIsTextBoxVisible(true);
     setTimeout(() => { if (isMountedRef.current) setIsTextBoxVisible(false); }, 3000); 
   }, []);
   
   const handleMenuScroll = () => {
       if (!menuScrollRef.current) return;
       const container = menuScrollRef.current;
       const center = container.scrollLeft + (container.clientWidth / 2);
       const children = Array.from(container.children);
       let closest = 0;
       let minDist = Infinity;
       children.forEach((child, index) => {
           const childEl = child as HTMLElement;
           const dist = Math.abs(center - (childEl.offsetLeft + (childEl.clientWidth / 2)));
           if (dist < minDist) { minDist = dist; closest = index; }
       });
       if (closest !== activeMenuIndex) setActiveMenuIndex(closest);
   };

   useEffect(() => {
       if (isMenuOpen && menuScrollRef.current) {
           const container = menuScrollRef.current;
           setTimeout(() => {
              if (container.children[2]) {
                  const child = container.children[2] as HTMLElement;
                  const scrollPos = child.offsetLeft - (container.clientWidth / 2) + (child.clientWidth / 2);
                  container.scrollTo({ left: scrollPos, behavior: 'smooth' });
              }
           }, 100);
       }
   }, [isMenuOpen]);

   // Disable mic when specific resources are playing to prevent self-triggering OR when Ranch is active
   const isMicDisabled = ranchStatus !== 'IDLE' ||
                                 (aiResources[2] && activeAiResourceId === aiResources[2].id) || // Head Pat
                                 (aiResources[3] && activeAiResourceId === aiResources[3].id) || // Poke Face
                                 (aiResources[9] && activeAiResourceId === aiResources[9].id) || // Gift A
                                 (aiResources[10] && activeAiResourceId === aiResources[10].id) || // Gift B
                                 (aiResources[11] && activeAiResourceId === aiResources[11].id) || // Entrance
                                 (aiResources[12] && activeAiResourceId === aiResources[12].id) || // Exit
                                 (aiResources[20] && activeAiResourceId === aiResources[20].id) || // Divination Intro
                                 (aiResources[23] && activeAiResourceId === aiResources[23].id);   // Sleep Aid Intro
   
   const isMicDisabledRef = useRef(isMicDisabled);
   useEffect(() => { isMicDisabledRef.current = isMicDisabled; }, [isMicDisabled]);
   useEffect(() => { chatStatusRef.current = chatStatus; }, [chatStatus]);
   
   const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (activeAiResourceId === aiResources[1]?.id && chatStatusRef.current !== 'SPEAKING' && pomodoroStatusRef.current === 'IDLE' && whiteNoiseStatusRef.current === 'IDLE' && divinationStatusRef.current === 'IDLE' && ranchStatusRef.current === 'IDLE' && sleepAidStatusRef.current === 'IDLE') {
          idleTimerRef.current = window.setTimeout(() => {
              if (isMountedRef.current && aiResources[16]) setActiveAiResourceId(aiResources[16].id);
          }, 10000);
      }
   };

   useEffect(() => {
       resetIdleTimer();
       return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
   }, [activeAiResourceId, chatStatus, aiResources, pomodoroStatus, whiteNoiseStatus, divinationStatus, ranchStatus, sleepAidStatus]);

   const speak = (text: string, slotId: number, onComplete?: () => void) => {
       if (!synthRef.current) return;
       synthRef.current.cancel();

       // Enforce feature-specific resources during speech for Pomodoro and White Noise
       let targetSlotId = slotId;
       if (pomodoroStatusRef.current === 'FOCUS' && aiResources[17]) targetSlotId = 17;
       else if (pomodoroStatusRef.current === 'BREAK' && aiResources[18]) targetSlotId = 18;
       else if (whiteNoiseStatusRef.current !== 'IDLE' && aiResources[19]) targetSlotId = 19;
       else if (sleepAidStatusRef.current === 'TELLING' && aiResources[25]) targetSlotId = 25; // Force storytelling slot

       if (aiResources[targetSlotId]) {
           setActiveAiResourceId(aiResources[targetSlotId].id);
       } else if (targetSlotId === slotId && aiResources[slotId]) {
            // If we didn't override, or overridden slot doesn't exist, try original
            setActiveAiResourceId(aiResources[slotId].id);
       }

       const utterance = new SpeechSynthesisUtterance(text);
       utterance.lang = 'zh-CN';
       
       const voices = synthRef.current.getVoices();
       const zhVoice = voices.find(v => v.lang === 'zh-CN') || voices.find(v => v.lang.includes('zh'));
       if (zhVoice) utterance.voice = zhVoice;

       // Set Speed and Pitch
       // Sleep aid should be slower
       if (sleepAidStatusRef.current !== 'IDLE') {
           utterance.rate = 0.85;
           utterance.pitch = 1.0;
       } else {
           utterance.rate = 1.1; 
           utterance.pitch = 1.3; 
       }

       utterance.onstart = () => {
           setChatStatus('SPEAKING');
           chatStatusRef.current = 'SPEAKING';
           setIsTextBoxVisible(true);
           if (textBoxTimerRef.current) clearTimeout(textBoxTimerRef.current);

           // Force stop recognition to prevent self-hearing
           if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch(e) {}
           }
           if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
       };

       utterance.onend = () => {
           if (!isMountedRef.current) return;
           
           // Auto hide text box after delay
           if (textBoxTimerRef.current) clearTimeout(textBoxTimerRef.current);
           textBoxTimerRef.current = window.setTimeout(() => {
               if (isMountedRef.current) setIsTextBoxVisible(false);
           }, 2000);
           
           if (onComplete) {
               onComplete();
               setChatStatus('LISTENING');
               chatStatusRef.current = 'LISTENING';
           } else {
               setChatStatus('LISTENING');
               chatStatusRef.current = 'LISTENING';
               if (pomodoroStatusRef.current === 'FOCUS' && aiResources[17]) {
                    setActiveAiResourceId(aiResources[17].id);
               } else if (pomodoroStatusRef.current === 'BREAK' && aiResources[18]) {
                    setActiveAiResourceId(aiResources[18].id);
               } else if (whiteNoiseStatusRef.current !== 'IDLE' && aiResources[19]) {
                    setActiveAiResourceId(aiResources[19].id);
               } else if (divinationStatusRef.current !== 'IDLE' && aiResources[21]) {
                    setActiveAiResourceId(aiResources[21].id);
               } else if (sleepAidStatusRef.current !== 'IDLE' && aiResources[24]) {
                    // Default to Waiting resource in sleep mode if not speaking
                    setActiveAiResourceId(aiResources[24].id);
               } else if (aiResources[1]) {
                    setActiveAiResourceId(aiResources[1].id);
               }
           }

           // Only restart if no special resource is blocking mic
           setTimeout(() => {
               if (!isMountedRef.current) return;
               if (!isMicDisabledRef.current) {
                    startListening();
               }
           }, 50);
           
           resetIdleTimer();
       };
       
       utterance.onerror = (e) => {
           console.error("Speech error:", e);
           if (!isMountedRef.current) return;
           setChatStatus('LISTENING');
           chatStatusRef.current = 'LISTENING';
           if (aiResources[1]) setActiveAiResourceId(aiResources[1].id);
           if (!isMicDisabledRef.current) {
                setTimeout(() => { startListening(); }, 50);
           }
       };

       synthRef.current.speak(utterance);
   };

   // Separate helper to process AI stream
   const handleAiStream = async (stream: AsyncGenerator<string, void, unknown>, slotId: number = 8) => {
       let rawText = "";
       let detectedSlotId = slotId;
       let tagChecked = false;
       let detectedEmotion = '';

       try {
         for await (const chunk of stream) {
           rawText += chunk;
           if (!tagChecked) {
             const match = rawText.match(/\[(开心|生气|困惑|悲伤|平常)\]/);
             if (match) {
               const emotion = match[1];
               detectedEmotion = emotion;
               // Map emotions to slots only if not overridden by features like sleep/divination
               if (sleepAidStatusRef.current === 'IDLE' && divinationStatusRef.current === 'IDLE') {
                   if (emotion === '开心') detectedSlotId = 4;
                   else if (emotion === '生气') detectedSlotId = 5;
                   else if (emotion === '困惑') detectedSlotId = 6;
                   else if (emotion === '悲伤') detectedSlotId = 7;
                   else detectedSlotId = 8;
               }
               tagChecked = true;
             } else if (rawText.length > 5 && !rawText.trim().startsWith('[')) {
               tagChecked = true; 
             }
           }
           if (isMountedRef.current) setDisplayText(rawText.replace(/\[(开心|生气|困惑|悲伤|平常)\]/, ''));
         }
       } catch(e) {
         if (isMountedRef.current) setDisplayText("我好像掉线了...");
       }
       
       const finalText = rawText.replace(/\[(开心|生气|困惑|悲伤|平常)\]/, '');
       
       const onCompleteCallback = () => {
           if (sleepAidStatusRef.current === 'TELLING' && onSleep) {
               // Story finished, sleep
               onSleep();
           }
       };
       
       speak(finalText, detectedSlotId, sleepAidStatusRef.current === 'TELLING' ? onCompleteCallback : undefined);
       if (detectedEmotion && sleepAidStatusRef.current === 'IDLE') spawnEntityFromEmotion(detectedEmotion);
   }

   const startListening = () => {
     const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
     if (!SpeechRecognition) return;
     
     if (recognitionRef.current) {
         recognitionRef.current.onend = null;
         try { recognitionRef.current.stop(); } catch(e) {}
     }
     
     const recognition = new SpeechRecognition();
     recognition.lang = 'zh-CN';
     recognition.continuous = false; 
     recognition.interimResults = false;
     recognition.onstart = () => { 
         if (isMountedRef.current) {
             setChatStatus('LISTENING'); 
             chatStatusRef.current = 'LISTENING';
         }
     };
     recognition.onerror = (event: any) => {
         console.error("Speech recognition error:", event.error);
         if (event.error === 'not-allowed' || event.error === 'audio-capture') {
             isMicDisabledRef.current = true; // Stop trying to restart
         }
     };
     recognition.onend = () => {
       if (isMountedRef.current && chatStatusRef.current !== 'SPEAKING' && !isMicDisabledRef.current) {
         setTimeout(() => { startListening(); }, 50);
       }
     };
     recognition.onresult = async (event: any) => {
       if (isMicDisabledRef.current) return;
       const transcript = event.results[0][0].transcript;
       if (transcript.includes("关闭") || transcript.includes("退出")) {
          setMode(BadgeMode.CHAT_EXITING);
          return;
       }
       setIsTextBoxVisible(true);
       if (textBoxTimerRef.current) clearTimeout(textBoxTimerRef.current);
       
       setChatStatus('SPEAKING');
       chatStatusRef.current = 'SPEAKING'; // Update ref synchronously to prevent onend from restarting
       setDisplayText("...");

       const isFeatureActive = isAnyFeatureActive();

       // --- Voice Command Checks (Only if no feature is active) ---
       if (!isFeatureActive) {
           if (transcript.includes("占卜") || transcript.includes("算命") || transcript.includes("运势")) {
               speak("收到，正在启动量子占卜程序...", 8, startDivination);
               return;
           }
           if (transcript.includes("白噪音") || transcript.includes("助眠") || transcript.includes("下雨") || transcript.includes("海浪")) {
               speak("好的，让我们放松一下。", 8, startWhiteNoise);
               return;
           }
           if (transcript.includes("番茄钟") || transcript.includes("专注") || transcript.includes("工作") || (transcript.includes("学习") && !transcript.includes("什么"))) {
               speak("要开始专注了吗？加油哦！", 8, startPomodoroSettings);
               return;
           }
           if (transcript.includes("牧场") || transcript.includes("农场") || transcript.includes("宠物")) {
               speak("正在前往数据牧场...", 8, startRanch);
               return;
           }
           if (transcript.includes("哄我睡觉") || transcript.includes("讲个故事")) {
               startSleepAid();
               return;
           }
       }
       
       let messageToSend = transcript;
       
       // Feature Logic Injection
       if (pomodoroStatusRef.current === 'FOCUS') {
           messageToSend = `[系统提示: 用户当前正在专注模式，还剩${Math.ceil(timeLeft/60)}分钟。请务必用可爱严厉的语气催促用户专心工作/学习，拒绝闲聊，除非用户询问时间。] ${transcript}`;
       } else if (sleepAidStatusRef.current === 'WAITING_INPUT') {
            if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
            setSleepAidStatus('TELLING');
            if (aiResources[24]) setActiveAiResourceId(aiResources[24].id); // Use 24 (Waiting) while generating
            messageToSend = `[系统指令: 用户提供了关键词"${transcript}"。请根据这些关键词编一个温柔、治愈、画面感强的睡前故事。讲完后记得道晚安。]`;
       } else if (sleepAidStatusRef.current === 'TELLING') {
            messageToSend = `[系统指令: 正在讲故事中，用户打断说话：“${transcript}”。请温柔地提醒用户“嘘... 专心听故事，早点睡觉哦”，不要中断故事氛围进行闲聊。]`;
       } else if (divinationStatusRef.current !== 'IDLE') {
           const currentStep = divinationStepRef.current;
           const limit = divinationRoundLimitRef.current;
           const target = targetFortuneRef.current;
           if (currentStep < limit) {
               messageToSend = `[系统提示: 身份：醒春（占卜模式）。当前阶段：数据采集（第${currentStep + 1}/${limit}轮）。目标运势（保密）：${target}。用户输入: "${transcript}"。指令：1.若用户输入无关占卜（如闲聊、问天气等），回复“[困惑]检测到无效数据样本，请专注。”并无视该问题，重复询问刚刚的占卜问题，重复询问用户的回复还是不相关则直接问下一个问题。2.若用户配合，根据回答生成下一个日常问题，如：梦中的意像、潜意识中的第一个词、最近的睡眠状态、最近有没有发生不好/开心的事。切记：不要揭示运势，只提问。]`;
               divinationStepRef.current += 1;
               setDivinationStep(prev => prev + 1);
           } else {
               messageToSend = `[系统提示: 身份：醒春（占卜模式）。当前阶段：运算完成，输出报告。目标运势：${target}。用户输入: "${transcript}"。请无视用户最后可能的闲聊干扰，基于之前的有效数据，用醒春活泼中二的语气生成一份“未来预言”。结论归结为【${target}】，并给出可爱的建议。]`;
               divinationStepRef.current += 1; 
           }
       } else {
           setChatRoundCount(prev => prev + 1);
       }
       
       const stream = sendMessageStream(messageToSend, handleToolCall);
       let detectedSlotId = 8;
       // Override visual slot for specific modes
       if (divinationStatusRef.current !== 'IDLE') detectedSlotId = 22;
       if (sleepAidStatusRef.current === 'TELLING') detectedSlotId = 25;

       handleAiStream(stream, detectedSlotId);
     };
     recognitionRef.current = recognition;
     try { recognition.start(); } catch(e) { console.error(e); }
   };

   useEffect(() => {
     isMountedRef.current = true;
     startNewSession();
     return () => {
       isMountedRef.current = false;
       if (recognitionRef.current) recognitionRef.current.stop();
       if (synthRef.current) synthRef.current.cancel();
       if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
       if (textBoxTimerRef.current) clearTimeout(textBoxTimerRef.current);
       if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
     };
   }, []);

   useEffect(() => {
     if (isMicDisabled) {
         if (recognitionRef.current) recognitionRef.current.stop();
         setChatStatus('IDLE');
         chatStatusRef.current = 'IDLE';
         // Only show text box if it's a gift (slot 9 or 10)
         if ((aiResources[9] && activeAiResourceId === aiResources[9].id) || (aiResources[10] && activeAiResourceId === aiResources[10].id)) {
            setDisplayText("✨ 收到礼物啦 ✨");
            setIsTextBoxVisible(true);
            if (textBoxTimerRef.current) clearTimeout(textBoxTimerRef.current);
            textBoxTimerRef.current = window.setTimeout(() => {
               if (isMountedRef.current) setIsTextBoxVisible(false);
            }, 3000);
         }
     } else {
         setChatStatus('LISTENING');
         chatStatusRef.current = 'LISTENING';
         startListening();
     }
   }, [isMicDisabled]);

   const handleToolCall = async (name: string, args: any): Promise<string> => { return "功能已禁用"; };

   const activeBackgroundResource = ranchStatus === 'ACTIVE' && aiResources[40] ? aiResources[40] : backgroundResource;
   const isActionResource = (aiResources[2] && backgroundResource?.id === aiResources[2].id) || 
                            (aiResources[3] && backgroundResource?.id === aiResources[3].id) || 
                            (aiResources[9] && backgroundResource?.id === aiResources[9].id) || 
                            (aiResources[10] && backgroundResource?.id === aiResources[10].id) || 
                            (aiResources[11] && backgroundResource?.id === aiResources[11].id) || // Entrance
                            (aiResources[12] && backgroundResource?.id === aiResources[12].id) || // Exit
                            (aiResources[16] && backgroundResource?.id === aiResources[16].id) ||
                            (aiResources[20] && backgroundResource?.id === aiResources[20].id) || // Divination Intro
                            (aiResources[23] && backgroundResource?.id === aiResources[23].id) || // Sleep Intro
                            (aiResources[26] && backgroundResource?.id === aiResources[26].id) || // NFC 1
                            (aiResources[27] && backgroundResource?.id === aiResources[27].id);    // NFC 2
   const isSpeakingResource = (aiResources[8] && backgroundResource?.id === aiResources[8].id) || (aiResources[4] && backgroundResource?.id === aiResources[4].id) || (aiResources[5] && backgroundResource?.id === aiResources[5].id) || (aiResources[6] && backgroundResource?.id === aiResources[6].id) || (aiResources[7] && backgroundResource?.id === aiResources[7].id);
   const isDefaultResource = aiResources[1] && backgroundResource?.id === aiResources[1].id;
   const isPomodoroResource = (aiResources[17] && backgroundResource?.id === aiResources[17].id) || (aiResources[18] && backgroundResource?.id === aiResources[18].id);
   const isWhiteNoiseResource = aiResources[19] && backgroundResource?.id === aiResources[19].id;
   const isDivinationLoop = (aiResources[21] && backgroundResource?.id === aiResources[21].id) || (aiResources[22] && backgroundResource?.id === aiResources[22].id);
   const isSleepLoop = (aiResources[24] && backgroundResource?.id === aiResources[24].id) || (aiResources[25] && backgroundResource?.id === aiResources[25].id);
   
   const shouldLoop = isDefaultResource || isSpeakingResource || isPomodoroResource || isWhiteNoiseResource || isDivinationLoop || isSleepLoop;

   const isNfcResource = (aiResources[26] && backgroundResource?.id === aiResources[26].id) ||
                         (aiResources[27] && backgroundResource?.id === aiResources[27].id);
   
   // Handle NFC Image Timeout (Videos handled by onEnded via SeamlessBackground)
   useEffect(() => {
       if (isNfcResource && backgroundResource?.type === 'image') {
           const timer = setTimeout(() => {
               if (onNfcEnd) onNfcEnd();
           }, 3000);
           return () => clearTimeout(timer);
       }
   }, [isNfcResource, backgroundResource, onNfcEnd]);

   useEffect(() => {
     if (isActionResource && backgroundResource?.type === 'image' && !isNfcResource) {
       const timer = setTimeout(() => {
         if (isMountedRef.current) {
             if (pomodoroStatusRef.current === 'FOCUS' && aiResources[17]) setActiveAiResourceId(aiResources[17].id);
             else if (pomodoroStatusRef.current === 'BREAK' && aiResources[18]) setActiveAiResourceId(aiResources[18].id);
             else if (whiteNoiseStatusRef.current !== 'IDLE' && aiResources[19]) setActiveAiResourceId(aiResources[19].id);
             else if (divinationStatusRef.current !== 'IDLE' && aiResources[21]) setActiveAiResourceId(aiResources[21].id);
             else if (sleepAidStatusRef.current !== 'IDLE' && aiResources[24]) setActiveAiResourceId(aiResources[24].id);
             else if (aiResources[1]) setActiveAiResourceId(aiResources[1].id);
         }
       }, 4000); 
       return () => clearTimeout(timer);
     }
   }, [activeAiResourceId, isActionResource, backgroundResource, aiResources, isNfcResource]);

   const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
     const x = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
     chatTouchStartX.current = x;
     resetIdleTimer();
     
     // Force restart listening on touch to recover from silent failures or permission issues
     if (chatStatus === 'LISTENING' && !isMicDisabledRef.current) {
         try {
             if (recognitionRef.current) {
                 recognitionRef.current.onend = null;
                 recognitionRef.current.stop();
             }
         } catch(e) {}
         setTimeout(() => { startListening(); }, 50);
     }
   };

   const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
     if (chatTouchStartX.current === null) return;

     // DISABLE INTERACTION: Block Head Pat/Poke Face if ANY sub-feature is active (Pomodoro, White Noise, Divination, Ranch, Sleep)
     if (isAnyFeatureActive()) {
        chatTouchStartX.current = null;
        return;
     }

     const x = 'changedTouches' in e ? (e as React.TouchEvent).changedTouches[0].clientX : (e as React.MouseEvent).clientX;
     const diff = chatTouchStartX.current - x;
     chatTouchStartX.current = null;
     resetIdleTimer();
     if (Math.abs(diff) > 30) { if (aiResources[2]) setActiveAiResourceId(aiResources[2].id); } 
     else if (Math.abs(diff) < 5) { if (aiResources[3]) setActiveAiResourceId(aiResources[3].id); }
   };
   
   const showIntimacy = (isIntimacyVisible || isMenuOpen) && !isAnyFeatureActive() && !isNfcResource;

   return (
     <div 
       className="w-full h-full bg-[#1a1a2e] flex flex-col relative overflow-hidden z-20 select-none"
       onTouchStart={handleTouchStart}
       onTouchEnd={handleTouchEnd}
       onMouseDown={handleTouchStart}
       onMouseUp={handleTouchEnd}
       onMouseLeave={() => { chatTouchStartX.current = null; }}
     >
       <div className="absolute inset-0 z-0">
          <SeamlessBackground 
             resource={activeBackgroundResource}
             shouldLoop={!!shouldLoop} 
             volume={volume} 
             onEnded={() => {
                 if (isNfcResource) {
                     onNfcEnd && onNfcEnd();
                     return;
                 }

                 if (divinationStatusRef.current === 'INTRO' && aiResources[20] && backgroundResource?.id === aiResources[20].id) {
                     setDivinationStatus('WAITING');
                     if (aiResources[21]) setActiveAiResourceId(aiResources[21].id);
                     return;
                 }
                 
                 if (sleepAidStatusRef.current === 'INTRO' && aiResources[23] && backgroundResource?.id === aiResources[23].id) {
                     setSleepAidStatus('WAITING_INPUT');
                     if (aiResources[24]) setActiveAiResourceId(aiResources[24].id);
                     return;
                 }

                 if (isActionResource) {
                     if (pomodoroStatusRef.current === 'FOCUS' && aiResources[17]) setActiveAiResourceId(aiResources[17].id);
                     else if (pomodoroStatusRef.current === 'BREAK' && aiResources[18]) setActiveAiResourceId(aiResources[18].id);
                     else if (whiteNoiseStatusRef.current !== 'IDLE' && aiResources[19]) setActiveAiResourceId(aiResources[19].id);
                     else if (divinationStatusRef.current !== 'IDLE' && aiResources[21]) setActiveAiResourceId(aiResources[21].id);
                     else if (sleepAidStatusRef.current !== 'IDLE' && aiResources[24]) setActiveAiResourceId(aiResources[24].id);
                     else if (aiResources[1]) setActiveAiResourceId(aiResources[1].id);
                 }
             }}
          />
       </div>
       
       <div 
         className={`absolute top-0 left-0 right-0 h-48 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.9)_0%,transparent_70%)] z-40 pointer-events-none flex flex-col items-center pt-[10px] transition-opacity duration-500 ease-in-out ${showIntimacy ? 'opacity-100' : 'opacity-0'}`}
       >
          <div className="flex flex-col items-center gap-2 transform scale-110">
             <div className="flex items-center gap-2">
                 <div className="relative"><HeartIcon className="w-8 h-8 text-[#a3e635]" /><span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black/60 pt-[1px]">6</span></div>
                 <span className="text-white font-display font-bold text-base tracking-widest drop-shadow-md">亲密</span>
             </div>
             <div className="w-28 h-2 bg-gray-700/50 backdrop-blur-sm rounded-full overflow-hidden border border-white/10"><div className="h-full bg-[#a3e635] w-[60%] shadow-[0_0_8px_rgba(163,230,53,0.6)] rounded-full"></div></div>
          </div>
       </div>

       <div 
         className={`absolute top-0 left-0 right-0 h-48 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.2)_0%,transparent_70%)] z-40 pointer-events-none flex flex-col items-center pt-[10px] transition-opacity duration-500 ease-in-out ${showGoldHeader ? 'opacity-100' : 'opacity-0'}`}
       >
          <div className="flex flex-col items-center gap-2 transform scale-110">
             <div className="flex items-center gap-2"><div className="text-2xl">🪙</div><span className="text-yellow-400 font-display font-bold text-xl tracking-widest drop-shadow-md">{goldCount}</span></div>
          </div>
       </div>
       
       {toastMessage && (
           <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-[10px] px-3 py-1.5 rounded-full border border-gray-700 shadow-xl z-[80] whitespace-nowrap animate-slideDown backdrop-blur-md">{toastMessage}</div>
       )}

       <RanchComp 
            status={ranchStatus} 
            chatRoundCount={chatRoundCount}
            entities={ranchEntities}
            coins={coins}
            floatingTexts={floatingTexts}
            selectedEntity={selectedEntity}
            onCollectCoin={collectCoin}
            onOpenDetail={openEntityDetail}
            onCloseDetail={closeRanchDetail}
            onExit={exitRanch}
       />

       <PomodoroComp 
            status={pomodoroStatus}
            focusLength={focusLength}
            breakLength={breakLength}
            setFocusLength={setFocusLength}
            setBreakLength={setBreakLength}
            onStart={startPomodoro}
            onCancel={() => setPomodoroStatus('IDLE')}
            onConfirmStop={stopPomodoro}
            onResume={() => setPomodoroStatus(timeLeft > 0 ? (aiResources[17] && activeAiResourceId === aiResources[17].id ? 'FOCUS' : 'BREAK') : 'FOCUS')}
            timeLeft={timeLeft}
            activeResourceId={activeAiResourceId || undefined}
       />

       <WhiteNoiseComp 
            status={whiteNoiseStatus}
            types={WHITE_NOISE_TYPES}
            activeIndex={whiteNoiseIndex}
            isPlaying={isPlayingWhiteNoise}
            volume={localVolume}
            onPrev={() => setWhiteNoiseIndex(prev => (prev - 1 + WHITE_NOISE_TYPES.length) % WHITE_NOISE_TYPES.length)}
            onNext={() => setWhiteNoiseIndex(prev => (prev + 1) % WHITE_NOISE_TYPES.length)}
            onTogglePlay={() => setIsPlayingWhiteNoise(!isPlayingWhiteNoise)}
            onVolumeChange={setLocalVolume}
            onExit={exitWhiteNoise}
            onOpenVolume={() => setWhiteNoiseStatus('VOLUME_ADJUST')}
            onCloseVolume={() => setWhiteNoiseStatus('ACTIVE')}
       />

       <DivinationComp 
            status={divinationStatus}
            onConfirmExit={stopDivination}
            onCancelExit={() => setDivinationStatus('WAITING')}
       />
       
       {/* Sleep Aid UI Overlay */}
       {sleepAidStatus !== 'IDLE' && (
           <div className="absolute top-4 right-4 text-xs font-bold text-indigo-300 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-500/30 animate-pulse">
               🌙 哄睡中
           </div>
       )}

       <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-40 transition-transform duration-500 ease-out flex items-center ${isMenuOpen && !isAnyFeatureActive() ? 'translate-y-0' : 'translate-y-full'}`}>
           <div 
             ref={menuScrollRef}
             onScroll={handleMenuScroll}
             className="w-full flex items-center overflow-x-auto no-scrollbar snap-x gap-6 py-4 px-[calc(50%-24px)]"
           >
                {menuItems.map((item, index) => {
                    const isActive = index === activeMenuIndex;
                    return (
                        <div 
                            key={item.id} 
                            onClick={item.onClick}
                            className={`flex-shrink-0 rounded-full bg-gradient-to-br ${item.color} ${item.shadow} shadow-lg flex items-center justify-center snap-center border-2 border-white/20 transform transition-all duration-300 ease-out cursor-pointer ${isActive ? 'w-16 h-16 border-white/60 scale-110 z-10 opacity-100' : 'w-12 h-12 scale-90 opacity-60'}`}
                        >
                            <div className={`${isActive ? 'text-3xl' : 'text-xl'} transition-all duration-300`}>{item.content}</div>
                        </div>
                    );
                })}
           </div>
       </div>

       <div 
         className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-10 z-30 pointer-events-none transition-all duration-500 ease-in-out ${isTextBoxVisible && !isMenuOpen && !isNfcResource ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
       >
          <div className="relative w-full h-full bg-black/60 backdrop-blur-md rounded-full border border-white/20 shadow-lg flex flex-col items-center justify-center overflow-hidden">
             <div className="w-full h-full flex items-center justify-center relative px-3">
                 <div className="absolute w-full animate-vertical-scroll flex items-center justify-center">
                    <p className="text-white/95 text-[10px] font-medium text-center leading-normal drop-shadow-md font-sans tracking-wide whitespace-pre-wrap">{displayText}</p>
                 </div>
             </div>
          </div>
       </div>
     </div>
   );
});

export default ChatComp;