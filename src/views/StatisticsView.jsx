import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { ArrowLeft, Calendar, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { supabaseStore } from '../utils/supabaseStore';
import { cycles } from '../data/mockData';
import { format } from 'date-fns';

const COLORS = ['#d97706', '#92400e', '#451a03', '#1e293b', '#64748b'];

const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const StatisticsView = () => {
    const [filter, setFilter] = useState('cycle'); // 'day', 'cycle', 'year'
    const [selectedCycleId, setSelectedCycleId] = useState('');

    // Initialize with optimistic data based on local mock metadata
    const [statsData, setStatsData] = useState(() => {
        if (cycles.length > 0) {
            const initialCycle = cycles[0];
            return {
                title: `${initialCycle.theme} #${initialCycle.id}`,
                subTitle: initialCycle.dateRange,
                totalTime: 0,
                chartData: []
            };
        }
        return null;
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnnualData = async () => {
            setLoading(true);
            try {
                // 1. Fetch all user tasks from DB
                const dbTasks = await supabaseStore.getAllTasks();

                // 2. Default to first cycle if not selected
                let currentId = selectedCycleId;
                if (!currentId && cycles.length > 0) {
                    currentId = cycles[0].id.toString();
                    setSelectedCycleId(currentId);
                }

                // 3. Process data
                processData(dbTasks, currentId || (cycles[0]?.id));

            } catch (error) {
                console.error("Failed to load stats:", error);
            } finally {
                setLoading(false);
            }
        };

        // If we already have selectedCycleId, we can just reload data, 
        // effectively this runs on mount and when filter/cycle changes
        loadAnnualData();
    }, [filter, selectedCycleId]);

    const processData = (dbTasks, currentCycleId) => {
        // Filter: Cycle View
        if (filter === 'cycle') {
            const cycleMetadata = cycles.find(c => c.id === Number(currentCycleId));
            if (!cycleMetadata) return;

            const cycleTasks = dbTasks.filter(t => t.cycle_id === Number(currentCycleId));
            const validTasks = cycleTasks.filter(t => t.focus_time > 0);

            const chartData = validTasks.map(t => ({
                name: t.title || '(Untitled)',
                value: t.focus_time
            }));

            // Only update if we have data or to clear it
            setStatsData({
                title: `${cycleMetadata.theme} #${cycleMetadata.id}`,
                subTitle: cycleMetadata.dateRange,
                totalTime: validTasks.reduce((acc, curr) => acc + curr.focus_time, 0),
                chartData
            });
        }
        // Filter: Year View
        else if (filter === 'year') {
            // Aggregate totals per cycle
            const cycleData = cycles.map(c => {
                const totalCycleTime = dbTasks
                    .filter(t => t.cycle_id === c.id)
                    .reduce((acc, t) => acc + (t.focus_time || 0), 0);

                return {
                    name: `Cycle ${c.id}`,
                    value: totalCycleTime
                };
            }).filter(d => d.value > 0); // Only show active cycles

            setStatsData({
                title: 'Annual Overview',
                subTitle: 'All 37 Cycles',
                totalTime: cycleData.reduce((acc, curr) => acc + curr.value, 0),
                chartData: cycleData
            });
        }
    };

    // Removed the Blocking Loading State
    // if (loading) return ...

    // Fallback if completely empty (shouldn't happen with optimistic init)
    if (!statsData) return (
        <div className="text-center p-10 font-mono text-gray-500">
            No initial metadata found.
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b-4 border-wood-dark pb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl uppercase tracking-widest text-shadow-sm">
                        Statistics
                    </h2>
                    {loading && <RefreshCw size={16} className="animate-spin text-wood-dark opacity-50" />}
                </div>

                <div className="flex gap-2 bg-wood-light p-1 border-2 border-wood-dark">
                    <button
                        onClick={() => setFilter('cycle')}
                        className={`px-3 py-1 font-bold text-xs ${filter === 'cycle' ? 'bg-wood-dark text-wood-light' : 'text-wood-dark hover:bg-wood/50'}`}
                    >
                        CYCLE
                    </button>
                    <button
                        onClick={() => setFilter('year')}
                        className={`px-3 py-1 font-bold text-xs ${filter === 'year' ? 'bg-wood-dark text-wood-light' : 'text-wood-dark hover:bg-wood/50'}`}
                    >
                        YEAR
                    </button>
                </div>
            </div>

            {/* Filters */}
            {filter === 'cycle' && (
                <div className="flex items-center gap-4 bg-white p-4 border-2 border-wood-light shadow-pixel-sm">
                    <label className="font-mono text-sm text-gray-500 font-bold">Select Cycle:</label>
                    <select
                        value={selectedCycleId}
                        onChange={(e) => setSelectedCycleId(e.target.value)}
                        className="border-2 border-gray-300 p-1 font-mono focus:border-wood-dark outline-none bg-gray-50"
                    >
                        {cycles.map(c => (
                            <option key={c.id} value={c.id}>Cycle {c.id} - {c.theme}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Main Stats Card */}
            <div className="bg-white p-8 shadow-pixel border-2 border-wood-dark transition-opacity duration-300">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="text-3xl font-bold text-wood-dark">{statsData.title}</h3>
                        <p className="font-mono text-gray-500">{statsData.subTitle}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-mono uppercase text-gray-400 block mb-1">Total Focus Time</span>
                        <span className="text-4xl font-mono text-wood-dark border-b-4 border-amber-400">
                            {formatTime(statsData.totalTime)}
                        </span>
                    </div>
                </div>

                <div className="h-96 w-full bg-gray-50 border border-gray-100 p-4 relative">
                    {/* Show empty state or charts */}
                    {statsData.chartData.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-mono">
                            {loading ? "Syncing data..." : "No recorded focus time for this period."}
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            {filter === 'year' ? (
                                <BarChart data={statsData.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                                    <YAxis tickFormatter={(val) => `${Math.round(val / 60)}m`} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                                    <Tooltip
                                        formatter={(value) => [formatTime(value), 'Time']}
                                        contentStyle={{ backgroundColor: '#fffbeb', borderColor: '#78350f', fontFamily: 'monospace' }}
                                    />
                                    <Bar dataKey="value" fill="#92400e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            ) : (
                                <PieChart>
                                    <Pie
                                        data={statsData.chartData}
                                        cx="50%"
                                        cy="50%"
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statsData.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [formatTime(value), 'Duration']} />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                                </PieChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatisticsView;
