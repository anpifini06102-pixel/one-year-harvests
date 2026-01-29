import React from 'react';

import { getCurrentCycle } from '../utils/dateUtils';

const Layout = ({ children, currentView, setView }) => {
    const { cycle, day } = getCurrentCycle();
    // const cycle = 1;
    // const day = 1;

    return (
        <div className="min-h-screen bg-wood-dark p-4 flex flex-col items-center justify-center font-pixel">
            <div className="w-full max-w-6xl bg-wood border-4 border-wood-dark shadow-pixel rounded-none relative">
                {/* Wooden Frame Header */}
                <header className="bg-wood-dark p-4 border-b-4 border-wood text-wood-light flex justify-between items-center select-none sticky top-0 z-50">
                    <h1 className="text-xl md:text-2xl tracking-widest uppercase drop-shadow-md">
                        37 Harvests
                    </h1>
                    <nav className="flex space-x-2 md:space-x-4 text-xs md:text-sm">
                        <button
                            onClick={() => setView('almanac')}
                            className={`px-3 py-1 border-2 ${currentView === 'almanac' ? 'bg-wood-light text-wood-dark border-wood-dark' : 'bg-wood text-wood-light border-wood-light hover:bg-wood/80'} shadow-pixel-sm transition-transform active:translate-y-1`}
                        >
                            Almanac
                        </button>
                        <button
                            onClick={() => setView('quest')}
                            className={`px-3 py-1 border-2 ${currentView === 'quest' ? 'bg-wood-light text-wood-dark border-wood-dark' : 'bg-wood text-wood-light border-wood-light hover:bg-wood/80'} shadow-pixel-sm transition-transform active:translate-y-1`}
                        >
                            Quest Board
                        </button>
                        <button
                            onClick={() => setView('harvest')}
                            className={`px-3 py-1 border-2 ${currentView === 'harvest' ? 'bg-wood-light text-wood-dark border-wood-dark' : 'bg-wood text-wood-light border-wood-light hover:bg-wood/80'} shadow-pixel-sm transition-transform active:translate-y-1`}
                        >
                            The Field
                        </button>
                        <button
                            onClick={() => setView('statistics')}
                            className={`px-3 py-1 border-2 ${currentView === 'statistics' ? 'bg-wood-light text-wood-dark border-wood-dark' : 'bg-wood text-wood-light border-wood-light hover:bg-wood/80'} shadow-pixel-sm transition-transform active:translate-y-1`}
                        >
                            Statistics
                        </button>
                    </nav>
                </header>

                {/* Content Area */}
                <main className="p-4 md:p-8 bg-wood overflow-y-auto" style={{ minHeight: '600px' }}>
                    {children}
                </main>

                {/* Footer / Status Bar */}
                <footer className="bg-wood-dark text-wood-light p-2 text-xs text-center border-t-4 border-wood">
                    Day {day} / Cycle {cycle} • Season of the Sun
                </footer>
            </div>
        </div>
    );
};

export default Layout;
