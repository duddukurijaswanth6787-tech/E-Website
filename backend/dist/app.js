"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./common/middlewares/error.middleware");
const logger_middleware_1 = require("./common/middlewares/logger.middleware");
const routes_1 = __importDefault(require("./routes"));
const swagger_1 = require("./docs/swagger");
const app = (0, express_1.default)();
// ============= SECURITY HEADERS =============
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// ============= CORS =============
const allowedOrigins = [
    env_1.env.frontendUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    `http://localhost:${env_1.env.port}`,
    `http://127.0.0.1:${env_1.env.port}`,
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS policy blocked: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
}));
// ============= BODY PARSER =============
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// ============= REQUEST LOGGING =============
if (!env_1.env.isProduction) {
    app.use((0, morgan_1.default)('dev'));
}
app.use(logger_middleware_1.requestLogger);
// ============= STATIC FILES =============
app.use('/uploads', express_1.default.static(path_1.default.resolve(env_1.env.upload.uploadDir)));
// ============= RATE LIMITING =============
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimit.windowMs,
    max: env_1.env.rateLimit.max,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/api-docs') || req.path === '/api/health',
});
app.use(globalLimiter);
// ============= HEALTH CHECK =============
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Vasanthi Creations API is running',
        version: '1.0.0',
        environment: env_1.env.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});
// ============= API ROUTES =============
app.use('/api/v1', routes_1.default);
// ============= SWAGGER DOCS =============
const swaggerSpec = (0, swagger_1.createSwaggerSpec)(routes_1.default);
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
    customSiteTitle: 'Vasanthi Creations API',
    customCss: `.swagger-ui .topbar { background-color: #A51648; }`,
}));
// ============= 404 HANDLER =============
app.use(error_middleware_1.notFoundHandler);
// ============= GLOBAL ERROR HANDLER =============
app.use(error_middleware_1.globalErrorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map