import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const Timer = ({ totalSeconds, isRunning, lastStartTime, onToggle }) => {
    // Calculate current duration including elapsed time if running
    const calculateCurrentSeconds = () => {
        if (!isRunning || !lastStartTime) return totalSeconds;
        const now = Date.now();
        const elapsed = Math.floor((now - lastStartTime) / 1000);
        return totalSeconds + elapsed;
    };

    const [displayTime, setDisplayTime] = useState(calculateCurrentSeconds());

    useEffect(() => {
        setDisplayTime(calculateCurrentSeconds()); // Update immediately on prop change

        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setDisplayTime(calculateCurrentSeconds());
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, lastStartTime, totalSeconds]);

    return (
        <div className="flex items-center gap-2 font-mono text-sm">
            <div className={`
                w-20 px-2 py-1 text-right border-2 
                ${isRunning ? 'bg-red-50 border-red-200 text-red-900' : 'bg-gray-50 border-gray-200 text-gray-500'}
            `}>
                {formatTime(displayTime)}
            </div>
            <button
                onClick={onToggle}
                className={`
                   w-8 h-8 flex items-center justify-center border-2 shadow-sm active:translate-y-0.5 transition-all
                   ${isRunning
                        ? 'bg-red-100 border-red-300 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 border-green-300 text-green-600 hover:bg-green-200'}
                `}
                title={isRunning ? "Pause Focus Session" : "Start Focus Session"}
            >
                {isRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            </button>
        </div>
    );
};

export default Timer;
