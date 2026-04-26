"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingValue = void 0;
const setting_model_1 = require("../../modules/settings/setting.model");
const getSettingValue = async (key, defaultValue) => {
    try {
        const setting = await setting_model_1.Setting.findOne({ key }).lean();
        if (setting) {
            return setting.value;
        }
        return defaultValue;
    }
    catch (error) {
        return defaultValue;
    }
};
exports.getSettingValue = getSettingValue;
//# sourceMappingURL=settings.js.map