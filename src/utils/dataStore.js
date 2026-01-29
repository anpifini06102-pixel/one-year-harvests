import { cycles as initialCycles } from '../data/mockData';

const STORAGE_KEY = 'harvest_cycles_v1';

export const dataStore = {
    getCycles: () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
            // Initialize if empty
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCycles));
            return initialCycles;
        } catch (error) {
            console.error('Failed to load cycles from storage:', error);
            return initialCycles;
        }
    },

    saveCycles: (cycles) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cycles));
        } catch (error) {
            console.error('Failed to save cycles to storage:', error);
        }
    },

    updateCycle: (updatedCycle) => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            let cycles = stored ? JSON.parse(stored) : initialCycles;
            
            const index = cycles.findIndex(c => c.id === updatedCycle.id);
            if (index !== -1) {
                cycles[index] = updatedCycle;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cycles));
            }
            return cycles;
        } catch (error) {
            console.error('Failed to update cycle:', error);
            return [];
        }
    }
};
