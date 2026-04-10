import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5259';
const api = axios.create({ baseURL: API_BASE });

export const DentalService = {
    getDailyRecords: async (userId: number) => {
        try {
            const response = await api.get(`/api/dailyrecord/last7days/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Günlük kayıtlar yüklenemedi:", error);
            return [];
        }
    },

    getDashboardStats: async (userId: number) => {
        const [todayRes, weeklyRes] = await Promise.all([
            api.get(`/api/dailyrecord/today/${userId}`),
            api.get(`/api/dailyrecord/last7days/${userId}`)
        ]);
        
        const data = todayRes.data;
        const currentStreak = data?.streak !== undefined ? data.streak : (data?.Streak !== undefined ? data.Streak : 0);
        
        return {
            ...data,
            streak: currentStreak,
            weeklyData: weeklyRes.data.map((item: any) => item.brushCount) || [0, 0, 0, 0, 0, 0, 0]
        };
    },

    upsertRecord: async (payload: { userId: number; brushCount: number; flossed: boolean; mouthwash: boolean }) => {
        const response = await api.post(`/api/dailyrecord/upsert`, payload);
        return response.data; 
    },

    getUserGoals: async (userId: number) => (await api.get(`/api/goal/user/${userId}`)).data,
    addGoal:      async (goalData: any) => (await api.post(`/api/goal`, goalData)).data,
    deleteGoal:   async (goalId: number) => await api.delete(`/api/goal/${goalId}`),
    
    getNotes:     async (userId: number) => (await api.get(`/api/note/user/${userId}`)).data,
    deleteNote:   async (noteId: number) => await api.delete(`/api/note/${noteId}`),
    
    saveNoteWithImage: async (userId: number, note: string, file?: File) => {
        const formData = new FormData();
        formData.append('userId', userId.toString());
        formData.append('description', note);
        if (file) formData.append('image', file);
        return (await api.post(`/api/note`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
    },
    
    getRecentActivities: async (userId: number) => (await api.get(`/api/activity/last7days/${userId}`)).data
};