import React from 'react';

type DivinationStatus = 'IDLE' | 'INTRO' | 'WAITING' | 'SPEAKING' | 'CONFIRM_EXIT';

interface DivinationCompProps {
    status: DivinationStatus;
    onConfirmExit: () => void;
    onCancelExit: () => void;
}

const DivinationComp: React.FC<DivinationCompProps> = ({ status, onConfirmExit, onCancelExit }) => {
    if (status === 'IDLE') return null;

    return (
        <>
            {/* Divination Status Overlay */}
            {status !== 'CONFIRM_EXIT' && (
                <div className="absolute top-4 right-4 text-xs font-bold text-purple-300 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/30">
                    🔮 占卜中
                </div>
            )}

            {/* Divination Exit Confirm Modal */}
            {status === 'CONFIRM_EXIT' && (
                <div className="absolute inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fadeIn">
                        <div className="text-white font-bold text-lg mb-2">确定结束占卜吗？</div>
                        <div className="text-gray-400 text-xs mb-6 text-center">命运的启示也许就在下一刻...</div>
                        <div className="flex gap-4 w-full">
                        <button onClick={onCancelExit} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold">继续</button>
                        <button onClick={onConfirmExit} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-500/30">确定结束</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default DivinationComp;
