import { create } from 'zustand';
import {  persist } from 'zustand/middleware';


export const useStore = create(
    persist(
        (set) => ({
            name: '',
            id: null,
            setName: (name) => set({ name }),
            setId: (id) => set({ id }),

            resetIdentity: () => set({ name: '', id: null }),
        }),
        {
            name: 'incoda-storage', // nome dello storage
            getStorage: () => localStorage, // usa localStorage
        }
    )
);