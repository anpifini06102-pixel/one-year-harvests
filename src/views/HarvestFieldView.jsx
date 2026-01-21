import React from 'react';
import { cycles } from '../data/mockData';

const HarvestFieldView = () => {
    // Filter out the Summary cycle (38) for the grid view
    const gridCycles = cycles.filter(c => !c.isSummary);

    // Transpose data: 10 Rows (Days), 37 Cols (Cycles)
    const rows = Array.from({ length: 10 }, (_, dayIndex) => {
        return gridCycles.map(cycle => {
            // Handle Epilogue (Cycle 37 only has 5 days)
            if (cycle.id === 37 && dayIndex >= 5) {
                return { type: 'wall', id: `${cycle.id}-${dayIndex}` };
            }
            const dayData = cycle.days[dayIndex];
            return {
                type: dayData ? dayData.status : 'empty',
                id: `${cycle.id}-${dayIndex}`,
                cycleId: cycle.id
            };
        });
    });

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4 bg-wood-light border-4 border-wood-dark p-2 text-center shadow-pixel">
                <h2 className="text-lg uppercase">The Grand Harvest Field</h2>
                <p className="text-[10px]">Scroll horizontally to track patterns across seasons.</p>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden border-4 border-wood-dark bg-amber-900/20 shadow-inner relative max-w-full">
                <div className="inline-block min-w-max p-4">

                    {/* Header Row (Cycle Numbers) */}
                    <div className="flex mb-2 ml-8 gap-px"> {/* ml-8 for day label offset */}
                        {gridCycles.map(c => (
                            <div key={c.id} className="w-8 text-center text-[8px] font-bold text-wood-dark border-b border-wood-dark">
                                {c.id}
                            </div>
                        ))}
                    </div>

                    {/* Matrix */}
                    <div className="flex flex-col gap-1">
                        {rows.map((row, dayIndex) => (
                            <div key={dayIndex} className="flex gap-px items-center">
                                {/* Row Label */}
                                <div className="w-8 text-[8px] font-bold text-right pr-2 text-wood-dark sticky left-0 bg-wood/90">
                                    Day {dayIndex + 1}
                                </div>

                                {/* Cells */}
                                {row.map((cell) => {
                                    let bgClass = 'bg-stone-300';
                                    let content = '';

                                    if (cell.type === 'harvested') {
                                        bgClass = 'bg-green-500 border-green-700 text-white';
                                        content = '🌻';
                                    } else if (cell.type === 'withered') {
                                        bgClass = 'bg-amber-800 border-amber-950 text-white';
                                        content = '🥀';
                                    } else if (cell.type === 'pending') {
                                        bgClass = 'bg-amber-100 border-amber-200 text-amber-900';
                                        content = '🌱';
                                    } else if (cell.type === 'wall') {
                                        bgClass = 'bg-gray-700 border-gray-900 opacity-50 bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxwYXRoIGQ9Ik0wIDBMNCA0Wk00IDBMMCA0WiIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+")]';
                                        content = '';
                                    } else {
                                        // Default / Empty
                                        bgClass = 'bg-white border-gray-200 text-gray-300 leading-none';
                                        content = '⬜';
                                    }

                                    return (
                                        <div
                                            key={cell.id}
                                            className={`
                          w-8 h-8 flex items-center justify-center text-xs 
                          border-2 ${bgClass}
                          hover:scale-110 hover:z-10 transition-transform cursor-pointer
                        `}
                                            title={`Cycle ${cell.cycleId}, Day ${dayIndex + 1}: ${cell.type}`}
                                        >
                                            {content}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-4 text-[10px] items-center">
                <div className="flex items-center gap-1"><span className="w-4 h-4 bg-green-500 border-2 border-green-700 block"></span> Harvested</div>
                <div className="flex items-center gap-1"><span className="w-4 h-4 bg-amber-800 border-2 border-amber-950 block"></span> Withered</div>
                <div className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-700 border-2 border-gray-900 block"></span> Wall</div>
            </div>
        </div>
    );
};

export default HarvestFieldView;
