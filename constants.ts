
import { Resource } from './types';

export const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const VIEW_NAMES: Record<string, string> = {
  'FRONT': '正面',
  'BACK': '背面',
  'LEFT': '左侧',
  'RIGHT': '右侧'
};

export const CHEER_COLORS = [
  { name: 'Orange', value: '#F97316', hex: '#F97316', tailwind: 'bg-orange-500' },
  { name: 'Red', value: '#EF4444', hex: '#EF4444', tailwind: 'bg-red-500' },
  { name: 'Green', value: '#22C55E', hex: '#22C55E', tailwind: 'bg-green-500' },
  { name: 'Blue', value: '#3B82F6', hex: '#3B82F6', tailwind: 'bg-blue-500' },
  { name: 'Cyan', value: '#06B6D4', hex: '#06B6D4', tailwind: 'bg-cyan-500' },
  { name: 'Purple', value: '#A855F7', hex: '#A855F7', tailwind: 'bg-purple-500' },
  { name: 'White', value: '#FFFFFF', hex: '#FFFFFF', tailwind: 'bg-white' },
];

export const BATTERY_COLORS = {
  HIGH: '#01fce9', // Cyan
  MID: '#fdaa1b',  // Orange
  LOW: '#c92525'   // Red
};

export const AI_SLOTS = [
  { id: 1, label: '默认' },
  { id: 2, label: '摸头' },
  { id: 3, label: '戳脸' },
  { id: 4, label: '开心' },
  { id: 5, label: '生气' },
  { id: 6, label: '困惑' },
  { id: 7, label: '悲伤' },
  { id: 8, label: '平常' },
  { id: 9, label: '礼物A' },
  { id: 10, label: '礼物B' },
  { id: 11, label: '入场' },
  { id: 12, label: '退场' },
  { id: 13, label: '收到信息' },
  { id: 14, label: '闹钟' },
  { id: 15, label: '提醒' },
  { id: 16, label: '无聊' },
  { id: 17, label: '专注' },
  { id: 18, label: '休息' },
  { id: 19, label: '白噪音' },
  { id: 20, label: '占卜-入场' },
  { id: 21, label: '占卜-等待' },
  { id: 22, label: '占卜-说话' },
  { id: 23, label: '哄睡-入场' },
  { id: 24, label: '故事-等候' },
  { id: 25, label: '故事-讲述' },
  { id: 26, label: 'NFC-幻夜紫' },
  { id: 27, label: 'NFC-森之息' },
];

// Mapping Emotion Tags to Slot IDs (30-34)
export const EMOTION_TO_SLOT: Record<string, number> = {
    '开心': 30,
    '生气': 31,
    '困惑': 32,
    '悲伤': 33,
    '平常': 34
};

export const WHITE_NOISE_TYPES = [
    { id: 'forest', name: '森林', icon: '🌲' },
    { id: 'rain', name: '下雨', icon: '🌧️' },
    { id: 'ocean', name: '海浪', icon: '🌊' },
    { id: 'keyboard', name: '键盘', icon: '⌨️' },
    { id: 'bonfire', name: '篝火', icon: '🔥' },
    { id: 'insects', name: '虫鸣', icon: '🦗' },
    { id: 'thunder', name: '雷雨', icon: '⛈️' },
];

// Configuration for Ranch UI Panel in App.tsx
export const RANCH_UI_CONFIG = [
    { id: 40, label: '背景' },
    { id: 30, label: '开心兽' },
    { id: 31, label: '生气兽' },
    { id: 32, label: '困惑兽' },
    { id: 33, label: '悲伤兽' },
    { id: 34, label: '平常兽' },
];

export const DEFAULT_AVATAR: Resource = {
  id: 'default_avatar',
  type: 'image',
  url: 'https://image.pollinations.ai/prompt/anime%20girl%20with%20pink%20hair%20twin%20tails%20cyberpunk%20style%20portrait%20bust%20shot?width=512&height=512&nologo=true&seed=101',
  name: 'Default'
};

export const getThemeClasses = (isDarkMode: boolean) => ({
    bg: isDarkMode ? 'bg-[#0a0a0c]' : 'bg-gray-100',
    text: isDarkMode ? 'text-white' : 'text-gray-800',
    panelBg: isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white/60 border-gray-200',
    panelBgStrong: isDarkMode ? 'bg-gray-900/90 border-gray-700/50' : 'bg-white/90 border-gray-200',
    subText: isDarkMode ? 'text-gray-500' : 'text-gray-500',
    iconActive: 'bg-blue-600 text-white shadow-lg shadow-blue-500/30',
    iconInactive: isDarkMode ? 'text-gray-500 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-black/5 hover:text-gray-700',
    iconBase: isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900',
});
