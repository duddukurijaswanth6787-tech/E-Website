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
const logger_1 = require("./common/logger");
const error_middleware_1 = require("./common/middlewares/error.middleware");
const logger_middleware_1 = require("./common/middlewares/logger.middleware");
const routes_1 = __importDefault(require("./routes"));
const seo_routes_1 = __importDefault(require("./routes/seo.routes"));
const swagger_1 = require("./docs/swagger");
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [env_1.env.frontendUrl, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'];
        if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimit.windowMs,
    max: env_1.env.rateLimit.max,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Request Parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging
if (env_1.env.nodeEnv !== 'test') {
    app.use((0, morgan_1.default)(env_1.env.nodeEnv === 'development' ? 'dev' : 'combined', {
        stream: { write: (message) => logger_1.logger.http(message.trim()) },
    }));
    app.use(logger_middleware_1.requestLogger);
}
// Static Files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Swagger Documentation - passing apiRoutes to the spec generator
const swaggerSpec = (0, swagger_1.createSwaggerSpec)(routes_1.default);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
    swaggerOptions: {
        persistAuthorization: true,
    },
    customSiteTitle: 'Vasanthi Creations API Documentation',
}));
// SEO & Sitemap Routes
app.use('/', seo_routes_1.default);
// Health Check
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        env: env_1.env.nodeEnv,
    });
});
// API Routes
app.use('/api/v1', routes_1.default);
// 404 Handler
app.use(error_middleware_1.notFoundHandler);
// Global Error Handler
app.use(error_middleware_1.globalErrorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map