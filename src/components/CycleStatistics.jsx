import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#d97706', '#92400e', '#451a03', '#1e293b', '#64748b'];

const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-wood-light border-2 border-wood-dark p-2 text-xs font-mono shadow-pixel-sm">
                <p className="font-bold mb-1">{label || payload[0].name}</p>
                <p>{formatTime(payload[0].value)} ({payload[0].value}s)</p>
            </div>
        );
    }
    return null;
};

const CycleStatistics = ({ tasks }) => {
    const [chartType, setChartType] = useState('pie');

    // Process Data
    const validTasks = tasks.filter(t => t.title && t.focusData.totalSeconds > 0);
    const totalCycleTime = validTasks.reduce((acc, curr) => acc + curr.focusData.totalSeconds, 0);

    const chartData = validTasks.map(t => ({
        name: t.title.length > 15 ? t.title.substring(0, 15) + '...' : t.title,
        fullTitle: t.title,
        value: t.focusData.totalSeconds
    }));

    if (totalCycleTime === 0) {
        return (
            <div className="bg-white p-6 shadow-pixel border-2 border-wood-dark text-center font-mono opacity-80">
                <h3 className="text-xl mb-2 bg-wood-dark text-wood-light inline-block px-3 py-1">Focus Distribution</h3>
                <p className="mt-4 text-gray-400">No focus sessions recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 shadow-pixel border-2 border-wood-dark font-pixel">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl mb-1 bg-wood-dark text-wood-light inline-block px-3 py-1">Focus Distribution</h3>
                    <p className="text-sm font-mono text-gray-500 mt-2">
                        Total Focus: <span className="font-bold text-wood-dark">{formatTime(totalCycleTime)}</span>
                    </p>
                </div>

                <div className="flex bg-wood-light border-2 border-wood-dark p-1">
                    <button
                        onClick={() => setChartType('pie')}
                        className={`px-3 py-1 text-xs font-bold transition-colors ${chartType === 'pie' ? 'bg-wood-dark text-wood-light' : 'text-wood-dark hover:bg-wood/50'}`}
                    >
                        PIE
                    </button>
                    <button
                        onClick={() => setChartType('bar')}
                        className={`px-3 py-1 text-xs font-bold transition-colors ${chartType === 'bar' ? 'bg-wood-dark text-wood-light' : 'text-wood-dark hover:bg-wood/50'}`}
                    >
                        BAR
                    </button>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'pie' ? (
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#2f1b0c" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px' }}
                            />
                        </PieChart>
                    ) : (
                        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fef3c7', opacity: 0.4 }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#2f1b0c" strokeWidth={2} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CycleStatistics;
