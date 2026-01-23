import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { cycles } from '../data/mockData';
import { ArrowLeft, Pin } from 'lucide-react';

const AutoResizeTextarea = ({ value, onChange, className, placeholder, minHeight = 'auto', maxHeight = 'none' }) => {
    const textareaRef = useRef(null);

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // We need to reset height to 'auto' to get the correct scrollHeight for shrinking.
        // However, this can cause the scroll position to be lost.
        // We'll capture the current scrollTop before resizing.
        const currentScrollTop = textarea.scrollTop;

        // Reset height to shrink
        textarea.style.height = 'auto';

        const scrollHeight = textarea.scrollHeight;
        const limit = maxHeight !== 'none' ? parseInt(maxHeight) : Infinity;

        if (scrollHeight > limit) {
            textarea.style.height = `${limit}px`;
        } else {
            textarea.style.height = `${scrollHeight}px`;
        }

        // Restore scroll position
        textarea.scrollTop = currentScrollTop;

    }, [value, maxHeight]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            // Added overflow-y-auto permanently to ensure scrollbar is always available/managed by browser
            className={`${className} resize-none block overflow-y-auto`}
            placeholder={placeholder}
            rows={1}
            style={{
                minHeight: minHeight,
                maxHeight: maxHeight
            }}
        />
    );
};

const QuestBoardView = ({ cycleId, onBack }) => {
    const [cycleData, setCycleData] = useState(null);

    useEffect(() => {
        const found = cycles.find(c => c.id === cycleId);
        if (found) {
            // Deep copy to allow local mutation for demo
            const data = JSON.parse(JSON.stringify(found));
            // Ensure days have notes if not present
            data.days = data.days.map(d => ({ ...d, note: d.note || '' }));

            // Pad status tasks to 5 items
            const currentTasks = data.focusTasks || [];
            const paddedTasks = [...currentTasks];
            while (paddedTasks.length < 5) {
                paddedTasks.push({
                    id: `new-${cycleId}-${paddedTasks.length}`,
                    title: '',
                    status: 'empty' // Special status for empty slots
                });
            }
            data.focusTasks = paddedTasks;

            setCycleData(data);
        }
    }, [cycleId]);

    if (!cycleData) return <div className="text-center p-10">Loading Cycle...</div>;

    // Helper to update local state AND persist to global mockData
    const updateCycleData = (newData) => {
        setCycleData(newData);
        const index = cycles.findIndex(c => c.id === newData.id);
        if (index !== -1) {
            // Only persist valid tasks (don't save 'new-' IDs effectively unless we want to, 
            // but for mockData we probably want to filter out empty ones or convert them?
            // For this UI demo, satisfying the "editable" requirement: we persist them as is.
            cycles[index] = newData;
        }
    };

    const toggleDayStatus = (dayIndex) => {
        const statuses = ['empty', 'pending', 'harvested', 'withered'];
        const currentStatus = cycleData.days[dayIndex].status || 'empty';
        const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
        const nextStatus = statuses[nextIndex];

        const newDays = [...cycleData.days];
        newDays[dayIndex] = { ...newDays[dayIndex], status: nextStatus };
        updateCycleData({ ...cycleData, days: newDays });
    };

    const toggleTaskStatus = (taskId) => {
        const statuses = ['pending', 'completed', 'failed'];
        const task = cycleData.focusTasks.find(t => t.id === taskId);
        if (!task) return;

        // If currently empty, start as pending
        if (task.status === 'empty') {
            const newTasks = cycleData.focusTasks.map(t =>
                t.id === taskId ? { ...t, status: 'pending' } : t
            );
            updateCycleData({ ...cycleData, focusTasks: newTasks });
            return;
        }

        // Cycle through standard statuses
        const currentStatus = statuses.includes(task.status) ? task.status : 'pending';
        const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
        const nextStatus = statuses[nextIndex];

        const newTasks = cycleData.focusTasks.map(t =>
            t.id === taskId ? { ...t, status: nextStatus } : t
        );
        updateCycleData({ ...cycleData, focusTasks: newTasks });
    };

    const handleTaskChange = (taskId, newTitle) => {
        let newTasks = cycleData.focusTasks.map(t =>
            t.id === taskId ? { ...t, title: newTitle } : t
        );
        // If content is added to an empty slot, auto-set status to pending
        const task = newTasks.find(t => t.id === taskId);
        if (task && task.status === 'empty' && newTitle.trim() !== '') {
            newTasks = newTasks.map(t =>
                t.id === taskId ? { ...t, status: 'pending' } : t
            );
        }

        updateCycleData({ ...cycleData, focusTasks: newTasks });
    };

    const handleDayNoteChange = (dayIndex, newNote) => {
        const newDays = [...cycleData.days];
        newDays[dayIndex] = { ...newDays[dayIndex], note: newNote };
        updateCycleData({ ...cycleData, days: newDays });
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'harvested': return 'bg-green-500 border-green-700 text-white';
            case 'withered': return 'bg-amber-800 border-amber-950 text-white';
            case 'pending': return 'bg-amber-100 border-amber-200 text-amber-900';
            default: return 'bg-white border-gray-200 text-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'harvested': return '🌻';
            case 'withered': return '🥀';
            case 'pending': return '🌱';
            default: return '⬜';
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b-4 border-wood-dark pb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-3 py-1 bg-wood-light border-2 border-wood-dark shadow-pixel-sm active:translate-y-1 hover:bg-white"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="text-center">
                    <h2 className="text-2xl uppercase tracking-widest text-shadow-sm">
                        {cycleData.theme} #{cycleData.id}
                    </h2>
                    <p className="text-xs font-mono text-wood-dark opacity-75 mt-1">{cycleData.dateRange}</p>
                </div>
                <div className="w-20"></div>
            </div>

            {cycleData.isSummary ? (
                // Annual Summary Layout
                <div className="w-full bg-white p-8 shadow-pixel border-2 border-wood-dark relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-600">
                        <Pin fill="#d97706" size={32} />
                    </div>
                    <h3 className="text-2xl mb-6 text-center underline decoration-4 decoration-yellow-200 uppercase tracking-widest text-wood-dark">
                        Annual Summary
                    </h3>
                    <textarea
                        value={cycleData.summaryNote || ''}
                        onChange={(e) => {
                            const newData = { ...cycleData, summaryNote: e.target.value };
                            updateCycleData(newData);
                        }}
                        className="w-full h-96 bg-yellow-50/50 border-2 border-dashed border-wood-light p-6 font-mono text-lg leading-relaxed resize-none focus:outline-none focus:border-wood-dark focus:bg-yellow-50 transition-colors"
                        placeholder="Reflect on the past 37 cycles... What has withered? What has bloomed?"
                    />
                </div>
            ) : (
                // Standard Layout
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Left: Focus Tasks (Pinned Paper) */}
                    <div className="w-full md:w-1/3 bg-yellow-50 p-6 shadow-pixel rotate-1 border-2 border-wood-dark relative text-wood-dark self-stretch">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-red-800">
                            <Pin fill="#8b0000" size={32} />
                        </div>
                        <h3 className="text-xl mb-1 underline decoration-4 decoration-yellow-200">Tasks</h3>
                        <p className="text-xl font-mono mb-6 text-gray-500 font-bold tracking-widest">{cycleData.dateRange}</p>

                        <ul className="space-y-6">
                            {cycleData.focusTasks.map(task => (
                                <li key={task.id} className={`flex items-start gap-4 font-mono border-b border-yellow-200 pb-4 ${task.status === 'empty' ? 'opacity-70' : ''}`}>
                                    <button
                                        onClick={() => toggleTaskStatus(task.id)}
                                        className={`w-8 h-8 flex items-center justify-center border-4 flex-shrink-0 mt-1 cursor-pointer transition-colors
                          ${task.status === 'completed' ? 'bg-green-400 border-black' : ''}
                          ${task.status === 'failed' ? 'bg-red-400 border-black' : ''}
                          ${task.status === 'pending' ? 'bg-white border-black' : ''}
                          ${task.status === 'empty' ? 'border-dashed border-black bg-transparent' : ''}
                        `}
                                        title="Click to toggle status"
                                    >
                                        {task.status === 'completed' && <span className="font-bold text-xl">✓</span>}
                                        {task.status === 'failed' && <span className="font-bold text-xl">X</span>}
                                    </button>
                                    <div className="flex-1 flex flex-col min-w-0">
                                        <span className="text-[10px] uppercase text-gray-500 font-bold leading-none mb-1 tracking-wider">
                                            {task.status === 'empty' ? 'Available Slot' : 'focus'}
                                        </span>
                                        <AutoResizeTextarea
                                            value={task.title}
                                            onChange={(e) => handleTaskChange(task.id, e.target.value)}
                                            className="bg-transparent border-none outline-none w-full font-mono text-lg md:text-xl focus:bg-yellow-100 placeholder-gray-400 leading-tight"
                                            placeholder={task.status === 'empty' ? "Enter new task..." : "Enter task..."}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: Growth Log (Ledger) */}
                    <div className="w-full md:w-2/3 bg-white p-6 shadow-pixel -rotate-1 border-2 border-wood-dark relative">
                        <h3 className="text-xl mb-6 bg-wood-dark text-wood-light inline-block px-3 py-1">Growth Log</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {cycleData.days.map((day, index) => (
                                <div
                                    key={day.day}
                                    className="p-4 border-2 border-gray-200 hover:border-wood-dark transition-colors bg-gray-50 rounded flex flex-col"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg text-wood-dark leading-none">Day {day.day}</span>
                                            <span className="text-[10px] font-mono text-gray-500 uppercase leading-none mt-1">{day.date}</span>
                                        </div>
                                        <div
                                            className="flex items-center gap-2 cursor-pointer hover:opacity-80 select-none group"
                                            onClick={() => toggleDayStatus(index)}
                                            title="Click to change status"
                                        >
                                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-widest group-hover:text-wood-dark transition-colors">
                                                {day.status || 'Empty'}
                                            </span>
                                            <div className={`text-2xl border-2 rounded p-1 w-12 h-12 flex items-center justify-center leading-none transition-colors ${getStatusStyles(day.status)}`}>
                                                {getStatusIcon(day.status)}
                                            </div>
                                        </div>
                                    </div>

                                    <textarea
                                        value={day.note}
                                        onChange={(e) => handleDayNoteChange(index, e.target.value)}
                                        className="w-full h-32 bg-white border border-gray-200 p-2 font-mono text-sm resize-none overflow-y-auto focus:outline-none focus:border-wood-dark focus:ring-1 focus:ring-wood-dark"
                                        placeholder="Record what you did today..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestBoardView;
