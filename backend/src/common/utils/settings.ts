import { Setting } from '../../modules/settings/setting.model';

export const getSettingValue = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const setting = await Setting.findOne({ key }).lean();
    if (setting) {
      return setting.value as T;
    }
    return defaultValue;
  } catch (error) {
    return defaultValue;
  }
};
