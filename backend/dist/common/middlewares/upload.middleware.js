"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileUrl = exports.uploadCustomBlouseFiles = exports.uploadDocument = exports.uploadMultipleImages = exports.uploadSingleImage = exports.uploadImages = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../config/env");
const errors_1 = require("../errors");
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = env_1.env.upload.maxFileSizeMb * 1024 * 1024;
const ensureUploadDir = (folder) => {
    const dir = path_1.default.resolve(env_1.env.upload.uploadDir, folder);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    return dir;
};
const localStorage = (folder) => multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = ensureUploadDir(folder);
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${crypto_1.default.randomBytes(6).toString('hex')}${ext}`;
        cb(null, uniqueName);
    },
});
const imageFilter = (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errors_1.BadRequestError(`Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.`));
    }
};
const documentFilter = (_req, file, cb) => {
    if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errors_1.BadRequestError('Invalid file type'));
    }
};
const uploadImages = (folder, maxCount = 10) => (0, multer_1.default)({
    storage: localStorage(folder),
    fileFilter: imageFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: maxCount },
});
exports.uploadImages = uploadImages;
const uploadSingleImage = (folder, fieldName = 'image') => (0, exports.uploadImages)(folder, 1).single(fieldName);
exports.uploadSingleImage = uploadSingleImage;
const uploadMultipleImages = (folder, fieldName = 'images', maxCount = 10) => (0, exports.uploadImages)(folder, maxCount).array(fieldName, maxCount);
exports.uploadMultipleImages = uploadMultipleImages;
const uploadDocument = (folder, fieldName = 'file') => (0, multer_1.default)({
    storage: localStorage(folder),
    fileFilter: documentFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).single(fieldName);
exports.uploadDocument = uploadDocument;
const uploadCustomBlouseFiles = (folder) => (0, multer_1.default)({
    storage: localStorage(folder),
    fileFilter: imageFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: 5 },
}).array('references', 5);
exports.uploadCustomBlouseFiles = uploadCustomBlouseFiles;
const getFileUrl = (req, filePath) => {
    const proto = req.protocol;
    const host = req.get('host');
    const relative = filePath.replace(/\\/g, '/').replace(env_1.env.upload.uploadDir, '');
    return `${proto}://${host}/uploads${relative}`;
};
exports.getFileUrl = getFileUrl;
//# sourceMappingURL=upload.middleware.js.map