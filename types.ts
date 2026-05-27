

export enum BadgeMode {
  OFF = 'OFF',
  BOOTING = 'BOOTING',
  SHUTTING_DOWN = 'SHUTTING_DOWN',
  SLEEP = 'SLEEP',
  IDLE = 'IDLE',
  MENU = 'MENU',
  CHAT = 'CHAT',
  CHAT_ENTERING = 'CHAT_ENTERING',
  CHAT_EXITING = 'CHAT_EXITING'
}

export enum LightColor {
  OFF = 'border-gray-800',
  BLUE = 'border-blue-500',
  CYAN = 'border-[#01fce9]',
  PURPLE = 'border-purple-500',
  GREEN = 'border-green-500',
  RED = 'border-red-500',
  WHITE = 'border-white'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Resource {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
}

export type ViewType = 'FRONT' | 'LEFT' | 'RIGHT' | 'BACK';
export type MenuState = 'MAIN' | 'DELETE_CONFIRM' | 'BRIGHTNESS' | 'VOLUME' | 'CHEER' | 'QRCODE' | 'TEXT' | 'CAMERA' | 'PICKUP';

// --- Ranch Types ---
export interface Coin {
    id: number;
    x: number;
    y: number;
}
export interface FloatingText {
    id: number;
    x: number;
    y: number;
    text: string;
}
export interface RanchEntity {
    id: string;
    url: string;
    name: string;
    emotion: string;
    intro: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    sourceTag: string;
}