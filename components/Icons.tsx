
import React from 'react';

interface IconProps {
  children?: React.ReactNode;
  className?: string;
  strokeWidth?: number;
  fill?: string;
}

export const Icon: React.FC<IconProps> = ({ children, className = "w-6 h-6", strokeWidth = 1.5, fill = "none" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill={fill} 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const HeartIcon = ({ className }: { className?: string }) => (
  <Icon className={className} fill="currentColor" strokeWidth={0}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </Icon>
);

export const UploadIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <Icon className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
);

export const TrashIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <Icon className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
);

export const PlayIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <Icon className={className} fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" stroke="none" />
  </Icon>
);

export const PauseIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <Icon className={className} fill="currentColor">
    <rect x="6" y="4" width="4" height="16" stroke="none" />
    <rect x="14" y="4" width="4" height="16" stroke="none" />
  </Icon>
);

export const ChargingIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <Icon className={className} fill="currentColor" strokeWidth={0}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </Icon>
);

export const BluetoothIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <Icon className={className} strokeWidth={2}>
    <path d="M6.5 17.5L17.5 6.5L12 1V23L17.5 17.5L6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const SignalIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <Icon className={className} fill="currentColor" strokeWidth={0}>
    <rect x="1" y="16" width="3" height="6" rx="1" className="opacity-40"/>
    <rect x="6" y="11" width="3" height="11" rx="1" className="opacity-60"/>
    <rect x="11" y="6" width="3" height="16" rx="1" className="opacity-80"/>
    <rect x="16" y="1" width="3" height="21" rx="1" />
  </Icon>
);

export const ChevronUpIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <Icon className={className}>
    <polyline points="18 15 12 9 6 15" />
  </Icon>
);

export const ChevronDownIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <Icon className={className}>
    <polyline points="6 9 12 15 18 9" />
  </Icon>
);

export const GiftIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </Icon>
);

export const BatteryIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
    <line x1="23" y1="13" x2="23" y2="11" />
  </Icon>
);

export const SunIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </Icon>
);

export const MoonIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Icon>
);

export const HelpIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Icon>
);

export const XIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

export const SpeakerIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </Icon>
);

export const CheerIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Icon>
);

export const LinkIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Icon>
);

export const TextIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M4 7V4h16v3M9 20h6M12 4v16" />
  </Icon>
);

export const CameraIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </Icon>
);

export const MicIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </Icon>
);

export const TrashMenuIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </Icon>
);

export const ClockIcon = ({ className }: { className?: string }) => (
    <Icon className={className}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </Icon>
);

export const CalendarIcon = ({ className }: { className?: string }) => (
    <Icon className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </Icon>
);

export const SearchIcon = ({ className }: { className?: string }) => (
    <Icon className={className}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Icon>
);

export const BellIcon = ({ className }: { className?: string }) => (
    <Icon className={className}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Icon>
);

export const MessageSquareIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Icon>
);
