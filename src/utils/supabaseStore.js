
import { supabase } from '../supabaseClient';
import { cycles as initialCycles } from '../data/mockData';

export const supabaseStore = {
    // Determine the current user and fetch tasks for a specific cycle
    getCycleTasks: async (cycleId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .eq('cycle_id', cycleId);

            if (error) {
                console.error('Error fetching tasks:', error);
                return [];
            }
            return data;
        } catch (error) {
            console.error('Unexpected error fetching tasks:', error);
            return [];
        }
    },

    // Create or Update a task
    upsertTask: async (task) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            // Ensure task has user_id
            const taskToSave = {
                ...task,
                user_id: user.id
            };

            // Remove temporary UI flags/keys if any before saving (like 'focusData' objects need to be flattened or mapped if table differs)
            // For MVP, we assumed table has specific columns: title, status, focus_time, is_running, last_start_time
            // We need to map the JSON structure to Table columns if they defer, or use a JSONB column. 
            // The plan specified columns: id, user_id, title, status, focus_time, is_running, last_start_time, cycle_id

            // Mapping UI model to DB model
            const dbTask = {
                title: task.title,
                status: task.status,
                cycle_id: task.cycleId, // Ensure this is passed
                user_id: user.id,
                focus_time: task.focusData?.totalSeconds || 0,
                is_running: task.focusData?.isRunning || false,
                last_start_time: task.focusData?.lastStartTime || null,
            };

            if (task.id && !task.id.toString().startsWith('new-')) {
                dbTask.id = task.id;
            }

            const { data, error } = await supabase
                .from('tasks')
                .upsert(dbTask)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error saving task:', error);
            return null;
        }
    },

    // Fetch all for summary
    // Delete a task
    deleteTask: async (taskId) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    },

    getAllTasks: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;
            return data;
        } catch (e) {
            console.error(e);
            return [];
        }
    }
};
