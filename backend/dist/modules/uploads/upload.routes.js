"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_middleware_1 = require("../../common/middlewares/upload.middleware");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
router.post('/single', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_MEDIA), (req, res, next) => {
    const folder = req.query.folder || constants_1.UPLOAD_FOLDER.MISC;
    (0, upload_middleware_1.uploadSingleImage)(folder)(req, res, next);
}, (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        const url = (0, upload_middleware_1.getFileUrl)(req, req.file.path);
        (0, responses_1.sendSuccess)(res, { url, filename: req.file.filename, size: req.file.size }, 'File uploaded');
    }
    catch (err) {
        next(err);
    }
});
router.post('/multiple', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_MEDIA), (req, res, next) => {
    const folder = req.query.folder || constants_1.UPLOAD_FOLDER.MISC;
    (0, upload_middleware_1.uploadMultipleImages)(folder, 'images', 10)(req, res, next);
}, (req, res, next) => {
    try {
        const files = req.files;
        const urls = files.map((f) => ({ url: (0, upload_middleware_1.getFileUrl)(req, f.path), filename: f.filename, size: f.size }));
        (0, responses_1.sendSuccess)(res, urls, 'Files uploaded');
    }
    catch (err) {
        next(err);
    }
});
router.get('/library', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_MEDIA), async (req, res, next) => {
    try {
        const folder = req.query.folder || '';
        const dirPath = path_1.default.resolve(env_1.env.upload.uploadDir, folder);
        if (!fs_1.default.existsSync(dirPath)) {
            (0, responses_1.sendSuccess)(res, []);
            return;
        }
        const files = fs_1.default.readdirSync(dirPath)
            .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
            .map((f) => ({
            filename: f,
            url: `${req.protocol}://${req.get('host')}/uploads/${folder ? folder + '/' : ''}${f}`,
            path: path_1.default.join(dirPath, f),
        }));
        (0, responses_1.sendSuccess)(res, files);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map