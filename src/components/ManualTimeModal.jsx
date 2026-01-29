import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ManualTimeModal = ({ isOpen, onClose, tasks, onConfirm }) => {
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [duration, setDuration] = useState('');

    useEffect(() => {
        if (isOpen && tasks.length > 0) {
            // Default to the first non-empty task
            const firstTask = tasks.find(t => t.status !== 'empty');
            if (firstTask) setSelectedTaskId(firstTask.id);
        }
    }, [isOpen, tasks]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTaskId || !duration) return;
        onConfirm(selectedTaskId, parseInt(duration, 10));
        onClose();
        setDuration('');
    };

    // Filter out empty slots
    const availableTasks = tasks.filter(t => t.status !== 'empty');

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-wood-light border-4 border-wood-dark p-6 shadow-pixel w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-wood-dark hover:text-red-600"
                >
                    <X size={24} />
                </button>

                <h3 className="text-xl font-bold uppercase mb-4 text-center text-wood-dark border-b-2 border-wood-dark pb-2">
                    Record Past Harvest
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-mono">
                    <div>
                        <label className="block text-sm font-bold mb-1 text-wood-dark">Select Task</label>
                        <select
                            value={selectedTaskId}
                            onChange={(e) => setSelectedTaskId(e.target.value)}
                            className="w-full p-2 border-2 border-wood-dark bg-white focus:outline-none"
                            required
                        >
                            <option value="" disabled>Choose a task...</option>
                            {availableTasks.map(task => (
                                <option key={task.id} value={task.id}>
                                    {task.title || '(Untitled Task)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1 text-wood-dark">Result (Minutes)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full p-2 border-2 border-wood-dark bg-white focus:outline-none"
                                placeholder="e.g. 45"
                                required
                            />
                            <span className="text-sm font-bold">MIN</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-2 bg-wood-dark text-wood-light py-2 px-4 font-bold uppercase hover:bg-wood transition-colors border-2 border-transparent hover:border-wood-dark"
                    >
                        Add to Log
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ManualTimeModal;
