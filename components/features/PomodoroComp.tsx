import React from 'react';

type PomodoroStatus = 'IDLE' | 'SETTINGS' | 'FOCUS' | 'BREAK' | 'CONFIRM_STOP';

interface PomodoroCompProps {
    status: PomodoroStatus;
    focusLength: number;
    breakLength: number;
    setFocusLength: (val: number) => void;
    setBreakLength: (val: number) => void;
    onStart: () => void;
    onCancel: () => void; // Go to IDLE
    onConfirmStop: () => void; // Exit completely
    onResume: () => void; // Cancel stop request
    timeLeft: number;
    activeResourceId?: string;
    focusResourceId?: string;
}

const PomodoroComp: React.FC<PomodoroCompProps> = ({
    status,
    focusLength,
    breakLength,
    setFocusLength,
    setBreakLength,
    onStart,
    onCancel,
    onConfirmStop,
    onResume,
    timeLeft,
    activeResourceId,
    focusResourceId
}) => {
    // Top Bar Logic (Focus/Break)
    const showTopBar = status === 'FOCUS' || status === 'BREAK';
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <>
            {/* Top Bar Overlay */}
            <div 
                className={`absolute top-0 left-0 right-0 h-40 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.9)_0%,transparent_70%)] z-40 pointer-events-none flex flex-col items-center pt-2 transition-opacity duration-500 ease-in-out ${showTopBar ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="flex flex-col items-center gap-1">
                    <div className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-lg ${status === 'FOCUS' ? 'bg-blue-600/60 text-blue-100' : 'bg-orange-600/60 text-orange-100'}`}>
                        {status === 'FOCUS' ? '专注中' : '休息中'}
                    </div>
                    <div className="font-display font-bold text-2xl text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {status === 'SETTINGS' && (
                <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fadeIn">
                    <h3 className="text-white font-display text-xl font-bold mb-6">番茄钟设置</h3>
                    
                    <div className="w-full space-y-4 mb-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-blue-300 text-xs font-bold uppercase">专注时长 (分钟)</label>
                            <div className="flex items-center justify-between bg-white/10 rounded-xl p-2">
                                <button onClick={() => setFocusLength(Math.max(5, focusLength - 5))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">-</button>
                                <span className="text-xl font-bold font-display">{focusLength}</span>
                                <button onClick={() => setFocusLength(Math.min(60, focusLength + 5))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">+</button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-orange-300 text-xs font-bold uppercase">休息时长 (分钟)</label>
                            <div className="flex items-center justify-between bg-white/10 rounded-xl p-2">
                                <button onClick={() => setBreakLength(Math.max(1, breakLength - 1))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">-</button>
                                <span className="text-xl font-bold font-display">{breakLength}</span>
                                <button onClick={() => setBreakLength(Math.min(15, breakLength + 1))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">+</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full">
                        <button onClick={onCancel} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold">取消</button>
                        <button onClick={onStart} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30">开始</button>
                    </div>
                </div>
            )}

            {/* Confirm Stop Modal */}
            {status === 'CONFIRM_STOP' && (
                <div className="absolute inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fadeIn">
                        <div className="text-white font-bold text-lg mb-2">确定退出专注吗？</div>
                        <div className="text-gray-400 text-xs mb-6 text-center">虽然 AI 会有点失望，<br/>但休息一下也没关系哦。</div>
                        <div className="flex gap-4 w-full">
                        <button onClick={onResume} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold">继续专注</button>
                        <button onClick={onConfirmStop} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-500/30">退出</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PomodoroComp;
