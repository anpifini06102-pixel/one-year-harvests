import React from 'react';
import { cycles } from '../data/mockData';
import { Book, Star } from 'lucide-react';
import { getCurrentCycle } from '../utils/dateUtils';

const AlmanacView = ({ onSelectCycle }) => {
    // Real-time: Calculate current cycle based on today
    const { cycle: currentCycleId } = getCurrentCycle();

    return (
        <div className="flex flex-col items-center">
            <div className="mb-6 bg-wood-light border-4 border-wood-dark p-4 shadow-pixel md:w-3/4 text-center">
                <h2 className="text-xl mb-2 uppercase border-b-2 border-wood-dark pb-1">Year Almanac</h2>
                <p className="text-xs">Select a Season Log to view details.</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 md:gap-6">
                {cycles.map((cycle) => {
                    const isCurrent = cycle.id === currentCycleId;
                    const isSummary = cycle.isSummary;

                    return (
                        <button
                            key={cycle.id}
                            onClick={() => onSelectCycle(cycle.id)}
                            className={`
                relative group flex flex-col items-center justify-center p-1 md:p-2 
                border-4 transition-all active:translate-y-1
                ${isSummary
                                    ? 'bg-yellow-200 border-yellow-800 text-yellow-900 col-span-full md:col-span-2 md:col-start-3 lg:col-start-auto'
                                    : 'bg-white border-wood-dark text-wood-dark'
                                }
                ${isCurrent ? 'animate-pulse ring-4 ring-yellow-400 ring-opacity-70 z-10' : 'hover:scale-105'}
                shadow-pixel
                w-full h-28 md:h-36
              `}
                        >
                            {isCurrent && (
                                <div className="absolute -top-3 -right-3 text-yellow-500 animate-bounce">
                                    <Star fill="currentColor" size={24} />
                                </div>
                            )}

                            <div className="mb-1">
                                {isSummary ? '👑' : <Book size={isSummary ? 40 : 28} strokeWidth={1.5} />}
                            </div>

                            <span className={`font-bold uppercase ${isSummary ? 'text-sm md:text-base' : 'text-[10px] md:text-xs'}`}>
                                {isSummary ? 'Annual Summary' : `C-${cycle.id}`}
                            </span>

                            {!isSummary && (
                                <span className="text-[8px] md:text-[10px] opacity-70 mt-1 font-mono leading-tight px-1 text-center">
                                    {cycle.dateRange}
                                </span>
                            )}

                            {/* Mini progress bar vibe (only for normal cycles) */}
                            {!isSummary && (
                                <div className="mt-2 flex gap-0.5">
                                    <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-green-500 rounded-full"></div>
                                    <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-green-500 rounded-full"></div>
                                    <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-red-500 rounded-full"></div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AlmanacView;
