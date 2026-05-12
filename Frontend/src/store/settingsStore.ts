import { create } from 'zustand';
import { settingsService } from '../api/services/settings.service';

interface SettingsState {
    settings: Record<string, any>;
    loading: boolean;
    fetchSettings: () => Promise<void>;
    getOtpSetting: (key: string) => boolean;
    isFeatureEnabled: (module: string, feature: string) => boolean;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: {},
    loading: false,
    fetchSettings: async () => {
        set({ loading: true });
        try {
            const res = await settingsService.getPublicSettings();
            if (res.data?.success) {
                set({ settings: res.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            set({ loading: false });
        }
    },
    getOtpSetting: (key: string) => {
        const value = get().settings[key];
        // If the setting is missing, we default to TRUE for security
        return value !== undefined ? Boolean(value) : true;
    },
    isFeatureEnabled: (module: string, feature: string) => {
        const value = (get().settings?.feature_flags as any)?.[module]?.[feature];
        // Default to false unless explicitly enabled
        return Boolean(value);
    }
}));
