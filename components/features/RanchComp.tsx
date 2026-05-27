import React from 'react';
import { XIcon } from '../Icons';
import { Coin, FloatingText, RanchEntity } from '../../types';

interface RanchCompProps {
    status: 'IDLE' | 'ACTIVE' | 'DETAIL';
    chatRoundCount: number;
    entities: RanchEntity[];
    coins: Coin[];
    floatingTexts: FloatingText[];
    selectedEntity: RanchEntity | null;
    onCollectCoin: (e: React.MouseEvent | React.TouchEvent, id: number, x: number, y: number) => void;
    onOpenDetail: (entity: RanchEntity) => void;
    onCloseDetail: () => void;
    onExit: () => void;
}

const RanchComp: React.FC<RanchCompProps> = ({
    status,
    chatRoundCount,
    entities,
    coins,
    floatingTexts,
    selectedEntity,
    onCollectCoin,
    onOpenDetail,
    onCloseDetail,
    onExit
}) => {
    if (status === 'IDLE') return null;

    return (
        <div className="absolute inset-0 z-30 overflow-hidden animate-fadeIn">
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

            {/* Exit Button */}
            <button 
                onClick={onExit}
                className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-[60]"
            >
                <XIcon className="w-5 h-5" />
            </button>
            
            {/* Ranch Header Info */}
            <div className="absolute top-6 left-6 z-[60] flex flex-col items-start gap-1">
                <div className="text-[10px] font-bold text-[#01fce9] bg-black/40 px-2 py-0.5 rounded-md border border-[#01fce9]/30 backdrop-blur-sm">
                    回合数: {chatRoundCount}
                </div>
                <div className="text-[10px] font-bold text-[#fdaa1b] bg-black/40 px-2 py-0.5 rounded-md border border-[#fdaa1b]/30 backdrop-blur-sm">
                    生物数: {entities.length}
                </div>
            </div>

            {/* Entities Layer */}
            {entities.map(entity => (
                <div 
                    key={entity.id}
                    className="absolute transition-transform cursor-pointer hover:scale-110 active:scale-95"
                    style={{ 
                        left: `${entity.x}%`, 
                        top: `${entity.y}%`,
                        width: `${entity.size}%`,
                        height: `${entity.size}%`,
                        transition: 'width 0.3s, height 0.3s'
                    }}
                    onClick={() => onOpenDetail(entity)}
                >
                    <img src={entity.url} alt={entity.name} className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(1,252,233,0.5)]" />
                </div>
            ))}
            
            {/* No Entities Warning */}
            {entities.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white/50 text-xs font-display tracking-widest text-center">
                        <p>牧场空空如也...</p>
                        <p className="mt-1 text-[10px]">去聊天产生情绪吧</p>
                    </div>
                </div>
            )}

            {/* Coins Layer */}
            {coins.map(coin => (
                <div 
                    key={coin.id}
                    className="absolute w-8 h-8 flex items-center justify-center cursor-pointer animate-pulse hover:scale-110 active:scale-90 transition-transform"
                    style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
                    onClick={(e) => onCollectCoin(e, coin.id, coin.x, coin.y)}
                >
                    <div className="text-2xl drop-shadow-md">🪙</div>
                </div>
            ))}

            {/* Floating +1 Animations */}
            {floatingTexts.map(float => (
                <div 
                    key={float.id}
                    className="absolute text-yellow-300 font-bold text-xl animate-float-up pointer-events-none"
                    style={{ left: `${float.x}%`, top: `${float.y}%` }}
                >
                    +1
                </div>
            ))}

            {/* Entity Detail Modal */}
            {status === 'DETAIL' && selectedEntity && (
                <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fadeIn">
                    <div className="bg-[#1a1a2e] border border-[#01fce9]/30 rounded-2xl p-6 w-full max-w-xs shadow-[0_0_30px_rgba(1,252,233,0.1)] flex flex-col items-center gap-4 relative">
                        <button onClick={onCloseDetail} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"><XIcon className="w-5 h-5"/></button>
                        
                        <div className="w-24 h-24 rounded-full border-2 border-[#01fce9] overflow-hidden bg-black/50">
                            <img src={selectedEntity.url} alt={selectedEntity.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="text-center">
                            <h3 className="text-[#01fce9] font-display font-bold text-xl tracking-wider">{selectedEntity.name}</h3>
                            <div className="inline-block px-3 py-1 bg-[#01fce9]/10 rounded-full text-[#01fce9] text-xs font-bold mt-2 border border-[#01fce9]/20">
                                源自: {selectedEntity.sourceTag}
                            </div>
                        </div>
                        
                        <p className="text-gray-300 text-xs text-center leading-relaxed">
                            {selectedEntity.intro}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RanchComp;
