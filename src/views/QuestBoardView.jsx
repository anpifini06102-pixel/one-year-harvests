import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Timer from '../components/Timer';
import CycleStatistics from '../components/CycleStatistics';
import ManualTimeModal from '../components/ManualTimeModal';
import { supabaseStore } from '../utils/supabaseStore';
import { cycles } from '../data/mockData';
import { ArrowLeft, Pin, Trash2, X, Plus, RotateCcw, RefreshCw } from 'lucide-react';

const AutoResizeTextarea = ({ value, onChange, className, placeholder, minHeight = 'auto', maxHeight = 'none' }) => {
    const textareaRef = useRef(null);

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const currentScrollTop = textarea.scrollTop;
        textarea.style.height = 'auto';

        const scrollHeight = textarea.scrollHeight;
        const limit = maxHeight !== 'none' ? parseInt(maxHeight) : Infinity;

        if (scrollHeight > limit) {
            textarea.style.height = `${limit}px`;
        } else {
            textarea.style.height = `${scrollHeight}px`;
        }

        textarea.scrollTop = currentScrollTop;

    }, [value, maxHeight]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
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
    // 1. Initialize with static data immediately for instant load
    const baseCycle = cycles.find(c => c.id === Number(cycleId));

    // Initial state uses the static data so UI renders immediately
    const [cycleData, setCycleData] = useState(baseCycle ? {
        ...baseCycle,
        days: baseCycle.days?.map(d => ({ ...d, note: d.note || '' })) || [],
        focusTasks: Array(5).fill(null).map((_, i) => ({
            id: `temp-${i}`,
            title: '',
            status: 'empty',
            cycleId: Number(cycleId),
            focusData: { totalSeconds: 0, isRunning: false, lastStartTime: null }
        }))
    } : null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    // 2. Fetch real data in background
    const loadCycleData = async () => {
        if (!baseCycle) {
            setError(`Cycle ${cycleId} not found`);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let dbTasks = [];
            try {
                dbTasks = await supabaseStore.getCycleTasks(Number(cycleId));
            } catch (err) {
                console.error("Supabase fetch error:", err);
                dbTasks = [];
            }

            const mappedDbTasks = (dbTasks || []).map(t => ({
                id: t.id,
                title: t.title,
                status: t.status,
                cycleId: t.cycle_id,
                focusData: {
                    totalSeconds: t.focus_time || 0,
                    isRunning: t.is_running || false,
                    lastStartTime: t.last_start_time || null
                }
            }));

            const clampedDbTasks = mappedDbTasks.slice(0, 5);
            const existingCount = clampedDbTasks.length;
            const fullList = [...clampedDbTasks];

            for (let i = existingCount; i < 5; i++) {
                fullList.push({
                    id: `new-${cycleId}-${i}-${Date.now()}`,
                    title: '',
                    status: 'empty',
                    cycleId: Number(cycleId),
                    focusData: { totalSeconds: 0, isRunning: false, lastStartTime: null }
                });
            }

            setCycleData({
                ...baseCycle,
                days: baseCycle.days.map(d => ({ ...d, note: d.note || '' })),
                focusTasks: fullList
            });
        } catch (e) {
            console.error(e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCycleData();
    }, [cycleId]);

    // Handle early error state if base cycle doesn't exist (unlikely)
    if (!cycleData && error) return <div className="text-center p-10 font-mono text-red-600 font-bold bg-white m-4 border-2 border-red-600">Error: {error}</div>;
    if (!cycleData) return <div className="text-center p-10 font-mono text-wood-dark font-bold bg-white m-4 border-2 border-wood-dark">No Cycle Data Found</div>;

    const handleTaskChange = async (taskId, newTitle) => {
        const newTasks = cycleData.focusTasks.map(t =>
            t.id === taskId ? { ...t, title: newTitle } : t
        );
        const taskIndex = newTasks.findIndex(t => t.id === taskId);
        const task = newTasks[taskIndex];

        if (task.status === 'empty' && newTitle.trim() !== '') {
            task.status = 'pending';
        }

        setCycleData({ ...cycleData, focusTasks: newTasks });

        if (task.status !== 'empty' || !task.id.toString().startsWith('new')) {
            const savedObj = await supabaseStore.upsertTask(task);
            if (savedObj && task.id.toString().startsWith('new-')) {
                newTasks[taskIndex].id = savedObj.id;
                setCycleData({ ...cycleData, focusTasks: newTasks });
            }
        }
    };

    const toggleTaskStatus = async (taskId) => {
        const statuses = ['pending', 'completed', 'failed'];
        const task = cycleData.focusTasks.find(t => t.id === taskId);
        if (!task) return;

        let nextStatus = 'pending';
        if (task.status !== 'empty') {
            const currentStatus = statuses.includes(task.status) ? task.status : 'pending';
            const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
            nextStatus = statuses[nextIndex];
        }

        const newTasks = cycleData.focusTasks.map(t =>
            t.id === taskId ? { ...t, status: nextStatus } : t
        );
        setCycleData({ ...cycleData, focusTasks: newTasks });

        const updatedTask = newTasks.find(t => t.id === taskId);
        await supabaseStore.upsertTask(updatedTask);
    };

    const handleAddManualTime = async (taskId, minutesToAdd) => {
        const secondsToAdd = minutesToAdd * 60;
        const newTasks = cycleData.focusTasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    focusData: {
                        ...t.focusData,
                        totalSeconds: t.focusData.totalSeconds + secondsToAdd
                    }
                };
            }
            return t;
        });
        setCycleData({ ...cycleData, focusTasks: newTasks });
        const task = newTasks.find(t => t.id === taskId);
        await supabaseStore.upsertTask(task);
    };

    const handleResetTime = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete the recorded time?")) return;
        const newTasks = cycleData.focusTasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    focusData: {
                        ...t.focusData,
                        totalSeconds: 0
                    }
                };
            }
            return t;
        });
        setCycleData({ ...cycleData, focusTasks: newTasks });
        const task = newTasks.find(t => t.id === taskId);
        await supabaseStore.upsertTask(task);
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        const taskIndex = cycleData.focusTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        const newTasks = [...cycleData.focusTasks];
        newTasks[taskIndex] = {
            id: `new-${cycleId}-${taskIndex}-${Date.now()}`,
            title: '',
            status: 'empty',
            cycleId: Number(cycleId),
            focusData: { totalSeconds: 0, isRunning: false, lastStartTime: null }
        };
        setCycleData({ ...cycleData, focusTasks: newTasks });
        if (!taskId.toString().startsWith('new-')) {
            await supabaseStore.deleteTask(taskId);
        }
    };

    const toggleTaskTimer = async (taskId) => {
        const now = Date.now();
        let updatedTask = null;
        const newTasks = cycleData.focusTasks.map(t => {
            if (t.id !== taskId) {
                if (t.focusData.isRunning) {
                    const elapsed = Math.floor((now - t.focusData.lastStartTime) / 1000);
                    return { ...t, focusData: { totalSeconds: t.focusData.totalSeconds + elapsed, isRunning: false, lastStartTime: null } };
                }
                return t;
            }
            updatedTask = { ...t };
            if (t.focusData.isRunning) {
                const elapsed = Math.floor((now - t.focusData.lastStartTime) / 1000);
                updatedTask.focusData = { totalSeconds: t.focusData.totalSeconds + elapsed, isRunning: false, lastStartTime: null };
            } else {
                updatedTask.focusData = { ...t.focusData, isRunning: true, lastStartTime: now };
            }
            return updatedTask;
        });
        setCycleData({ ...cycleData, focusTasks: newTasks });
        if (updatedTask) await supabaseStore.upsertTask(updatedTask);
    };

    const toggleDayStatus = (dayIndex) => {
        const statuses = ['empty', 'pending', 'harvested', 'withered'];
        const currentStatus = cycleData.days[dayIndex].status || 'empty';
        const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
        const newDays = [...cycleData.days];
        newDays[dayIndex] = { ...newDays[dayIndex], status: statuses[nextIndex] };
        setCycleData({ ...cycleData, days: newDays });
    };

    const handleDayNoteChange = (dayIndex, newNote) => {
        const newDays = [...cycleData.days];
        newDays[dayIndex] = { ...newDays[dayIndex], note: newNote };
        setCycleData({ ...cycleData, days: newDays });
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
            <div className="flex items-center justify-between border-b-4 border-wood-dark pb-4">
                <button onClick={onBack} className="flex items-center gap-2 px-3 py-1 bg-wood-light border-2 border-wood-dark shadow-pixel-sm active:translate-y-1 hover:bg-white">
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="text-center">
                    <h2 className="text-2xl uppercase tracking-widest text-shadow-sm">{cycleData.theme} #{cycleData.id}</h2>
                    <p className="text-xs font-mono text-wood-dark opacity-75 mt-1">{cycleData.dateRange}</p>
                </div>
                <div className="w-20"></div>
            </div>

            {cycleData.isSummary ? (
                <div className="w-full bg-white p-8 shadow-pixel border-2 border-wood-dark relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-600">
                        <Pin fill="#d97706" size={32} />
                    </div>
                    <h3 className="text-2xl mb-6 text-center underline decoration-4 decoration-yellow-200 uppercase tracking-widest text-wood-dark">Annual Summary</h3>
                    <textarea
                        value={cycleData.summaryNote || ''}
                        onChange={(e) => {
                            const newData = { ...cycleData, summaryNote: e.target.value };
                            setCycleData(newData);
                        }}
                        className="w-full h-96 bg-yellow-50/50 border-2 border-dashed border-wood-light p-6 font-mono text-lg leading-relaxed resize-none focus:outline-none focus:border-wood-dark focus:bg-yellow-50 transition-colors"
                        placeholder="Reflect on the past 37 cycles... What has withered? What has bloomed?"
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-full md:w-1/3 bg-yellow-50 p-6 shadow-pixel border-2 border-wood-dark relative text-wood-dark self-stretch">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-red-800">
                                <Pin fill="#8b0000" size={32} />
                            </div>
                            <div className="flex items-center justify-between mb-1 border-b-2 border-yellow-200 pb-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl underline decoration-4 decoration-yellow-200">Tasks</h3>
                                    {loading && <RefreshCw size={14} className="animate-spin text-wood-dark opacity-50" />}
                                </div>
                                <button
                                    onClick={() => setIsManualModalOpen(true)}
                                    className="flex items-center gap-1 text-xs font-bold bg-white px-2 py-1 border border-wood-dark hover:bg-yellow-100 transition-colors shadow-sm"
                                    title="Add Manual Time"
                                >
                                    <Plus size={14} /> Add Time
                                </button>
                            </div>
                            <p className="text-xl font-mono mb-6 text-gray-500 font-bold tracking-widest">{cycleData.dateRange}</p>

                            <ul className="space-y-6">
                                {cycleData.focusTasks.map(task => (
                                    <li key={task.id} className={`flex flex-col gap-2 font-mono border-b border-yellow-200 pb-4 ${task.status === 'empty' ? 'opacity-70' : ''}`}>
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={() => toggleTaskStatus(task.id)}
                                                className={`w-8 h-8 flex items-center justify-center border-4 flex-shrink-0 mt-1 cursor-pointer transition-colors ${task.status === 'completed' ? 'bg-green-400 border-black' : ''} ${task.status === 'failed' ? 'bg-red-400 border-black' : ''} ${task.status === 'pending' ? 'bg-white border-black' : ''} ${task.status === 'empty' ? 'border-dashed border-black bg-transparent' : ''}`}
                                            >
                                                {task.status === 'completed' && <span className="font-bold text-xl">✓</span>}
                                                {task.status === 'failed' && <span className="font-bold text-xl">X</span>}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[10px] uppercase text-gray-500 font-bold leading-none mb-1 tracking-wider block">{task.status === 'empty' ? 'Available Slot' : 'focus'}</span>
                                                <AutoResizeTextarea
                                                    value={task.title}
                                                    onChange={(e) => handleTaskChange(task.id, e.target.value)}
                                                    className="bg-transparent border-none outline-none w-full font-mono text-lg md:text-xl focus:bg-yellow-100 placeholder-gray-400 leading-tight"
                                                    placeholder={task.status === 'empty' ? "Enter new task..." : "Enter task..."}
                                                />
                                            </div>
                                            {task.status !== 'empty' && (
                                                <button onClick={() => handleDeleteTask(task.id)} className="opacity-50 hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1" title="Delete Task">
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                        {task.status !== 'empty' && (
                                            <div className="pl-11 flex items-center gap-4">
                                                <Timer
                                                    totalSeconds={task.focusData.totalSeconds}
                                                    isRunning={task.focusData.isRunning}
                                                    lastStartTime={task.focusData.lastStartTime}
                                                    onToggle={() => toggleTaskTimer(task.id)}
                                                />
                                                <button
                                                    onClick={() => handleResetTime(task.id)}
                                                    className="opacity-50 hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 ml-2"
                                                    title="Reset Time to 00:00"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="w-full md:w-2/3 bg-white p-6 shadow-pixel border-2 border-wood-dark relative">
                            <h3 className="text-xl mb-6 bg-wood-dark text-wood-light inline-block px-3 py-1">Growth Log</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {cycleData.days.map((day, index) => (
                                    <div key={day.day} className="p-4 border-2 border-gray-200 hover:border-wood-dark transition-colors bg-gray-50 rounded flex flex-col">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg text-wood-dark leading-none">Day {day.day}</span>
                                                <span className="text-[10px] font-mono text-gray-500 uppercase leading-none mt-1">{day.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 select-none group" onClick={() => toggleDayStatus(index)}>
                                                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-widest group-hover:text-wood-dark transition-colors">{day.status || 'Empty'}</span>
                                                <div className={`text-2xl border-2 rounded p-1 w-12 h-12 flex items-center justify-center leading-none transition-colors ${getStatusStyles(day.status)}`}>{getStatusIcon(day.status)}</div>
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
                    <div id="cycle-analytics-container" className="mt-8">
                        <CycleStatistics tasks={cycleData.focusTasks} />
                    </div>
                </div>
            )}
            <ManualTimeModal
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
                tasks={cycleData.focusTasks}
                onConfirm={handleAddManualTime}
            />
        </div>
    );
};

export default QuestBoardView;
