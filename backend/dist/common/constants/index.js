"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.PERMISSIONS = exports.ADMIN_ROLES = exports.USER_ROLES = void 0;
var roles_1 = require("./roles");
Object.defineProperty(exports, "USER_ROLES", { enumerable: true, get: function () { return roles_1.USER_ROLES; } });
Object.defineProperty(exports, "ADMIN_ROLES", { enumerable: true, get: function () { return roles_1.ADMIN_ROLES; } });
Object.defineProperty(exports, "PERMISSIONS", { enumerable: true, get: function () { return roles_1.PERMISSIONS; } });
Object.defineProperty(exports, "ROLE_PERMISSIONS", { enumerable: true, get: function () { return roles_1.ROLE_PERMISSIONS; } });
__exportStar(require("./enums"), exports);
//# sourceMappingURL=index.js.map