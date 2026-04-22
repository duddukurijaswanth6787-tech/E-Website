"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRazorpayInstance = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const env_1 = require("./env");
let razorpayInstance = null;
const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        razorpayInstance = new razorpay_1.default({
            key_id: env_1.env.razorpay.keyId,
            key_secret: env_1.env.razorpay.keySecret,
        });
    }
    return razorpayInstance;
};
exports.getRazorpayInstance = getRazorpayInstance;
//# sourceMappingURL=razorpay.js.map