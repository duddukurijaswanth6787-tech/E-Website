import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MeasurementProfile } from '../utils/measurementSchema';
import { measurementService } from '../api/services/measurement.service';

interface MeasurementStore {
  profiles: MeasurementProfile[];
  isLoading: boolean;
  error: string | null;
  fetchProfiles: () => Promise<void>;
  addProfile: (profile: MeasurementProfile) => Promise<void>;
  updateProfile: (id: string, profile: Partial<MeasurementProfile>) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
  duplicateProfile: (id: string) => Promise<void>;
  setDefaultProfile: (id: string) => Promise<void>;
  getDefaultProfile: () => MeasurementProfile | undefined;
}

export const useMeasurementStore = create<MeasurementStore>()(
  persist(
    (set, get) => ({
      profiles: [],
      isLoading: false,
      error: null,

      fetchProfiles: async () => {
        set({ isLoading: true });
        try {
          const res = await measurementService.getMyProfiles();
          set({ profiles: res.data, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      addProfile: async (profile: MeasurementProfile) => {
        try {
          const res = await measurementService.createProfile(profile);
          set({ profiles: [...get().profiles, res.data] });
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      updateProfile: async (id: string, profile: Partial<MeasurementProfile>) => {
        try {
          const res = await measurementService.updateProfile(id, profile);
          set({
            profiles: get().profiles.map((p) => (p._id === id ? res.data : p)),
          });
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      removeProfile: async (id: string) => {
        try {
          await measurementService.deleteProfile(id);
          set({ profiles: get().profiles.filter((p) => p._id !== id) });
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      duplicateProfile: async (id: string) => {
        try {
          const res = await measurementService.duplicateProfile(id);
          set({ profiles: [res.data, ...get().profiles] });
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      setDefaultProfile: async (id: string) => {
        try {
          await measurementService.setDefault(id);
          set({
            profiles: get().profiles.map((p) => ({
              ...p,
              isDefault: p._id === id
            }))
          });
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      getDefaultProfile: () => {
        return get().profiles.find((p) => p.isDefault);
      },
    }),
    {
      name: 'vasanthi-measurements',
      partialize: (state) => ({ profiles: state.profiles }),
    }
  )
);
