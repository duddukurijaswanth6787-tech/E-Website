"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwaggerSpec = createSwaggerSpec;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const env_1 = require("../../config/env");
// Install swagger-jsdoc if needed: npm install swagger-jsdoc @types/swagger-jsdoc
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vasanthi Creations API',
            version: '1.0.0',
            description: `
## Vasanthi Creations — Premium Ethnic Fashion Boutique API

Enterprise-grade REST API for the Vasanthi Creations D2C platform.

### Authentication
- **Customer**: Use \`POST /api/v1/auth/login\` to get a Bearer token
- **Admin**: Use \`POST /api/v1/admin-auth/login\` to get an Admin Bearer token

Include the token in the \`Authorization\` header as \`Bearer <token>\`

### Base URL
\`/api/v1\`
      `,
            contact: {
                name: 'Vasanthi Creations Tech Team',
                email: 'tech@vasanthicreations.com',
            },
            license: { name: 'Proprietary' },
        },
        servers: [
            { url: `http://localhost:${env_1.env.port}/api/v1`, description: 'Development Server' },
            { url: 'https://api.vasanthicreations.com/api/v1', description: 'Production Server' },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Customer JWT access token',
                },
                AdminBearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Admin JWT access token',
                },
            },
            schemas: {
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'object' },
                        error: { type: 'object', nullable: true },
                    },
                },
                PaginatedResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'array', items: { type: 'object' } },
                        pagination: {
                            type: 'object',
                            properties: {
                                currentPage: { type: 'integer' },
                                totalPages: { type: 'integer' },
                                totalItems: { type: 'integer' },
                                itemsPerPage: { type: 'integer' },
                                hasNextPage: { type: 'boolean' },
                                hasPrevPage: { type: 'boolean' },
                            },
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        error: { type: 'object', nullable: true },
                    },
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'Customer authentication' },
            { name: 'Admin Auth', description: 'Admin authentication' },
            { name: 'Users', description: 'User profile and management' },
            { name: 'Admins', description: 'Admin user management' },
            { name: 'Products', description: 'Product catalog' },
            { name: 'Categories', description: 'Product categories' },
            { name: 'Collections', description: 'Curated collections' },
            { name: 'Banners', description: 'Homepage and promotional banners' },
            { name: 'Content', description: 'CMS content pages and blogs' },
            { name: 'Cart', description: 'Shopping cart management' },
            { name: 'Wishlist', description: 'Customer wishlist' },
            { name: 'Addresses', description: 'Customer address book' },
            { name: 'Orders', description: 'Order management and lifecycle' },
            { name: 'Payments', description: 'Payment processing (Razorpay + COD)' },
            { name: 'Reviews', description: 'Product reviews' },
            { name: 'Coupons', description: 'Discount coupon management' },
            { name: 'Custom Blouse', description: 'Custom blouse request workflow' },
            { name: 'Analytics', description: 'Admin analytics and reports' },
            { name: 'Settings', description: 'Application settings' },
            { name: 'Uploads', description: 'Media upload and library' },
            { name: 'Support', description: 'Customer support tickets' },
            { name: 'Audit Logs', description: 'Admin action audit trail' },
        ],
    },
    apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};
function titleCase(input) {
    return input
        .split(/[-_\s]+/g)
        .filter(Boolean)
        .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
        .join(' ');
}
function mountPathFromLayerRegexp(regexp) {
    if (!regexp)
        return '';
    // Express `Layer.regexp` typically looks like: /^\/auth\/?(?=\/|$)/i
    // We only need the initial static mount segment.
    const src = regexp.source;
    const match = src.match(/^\^\\\/([^\\/?()]+)(?:\\\/\?\(\?=\\\/\|\$\))?/);
    if (!match)
        return '';
    return `/${match[1]}`;
}
function normalizeRoutePath(path) {
    // express can produce paths like "//users" from concatenation
    return path.replace(/\/{2,}/g, '/');
}
function getRoutePaths(routePath) {
    if (Array.isArray(routePath)) {
        return routePath.flatMap((p) => (typeof p === 'string' ? [p] : []));
    }
    return typeof routePath === 'string' ? [routePath] : [];
}
function extractRoutesFromRouter(router, prefix) {
    const anyRouter = router;
    const stack = anyRouter.stack ?? [];
    const routes = [];
    for (const layer of stack) {
        if (layer.route) {
            const routePaths = getRoutePaths(layer.route.path);
            const methods = Object.keys(layer.route.methods ?? {}).filter((m) => layer.route.methods[m]);
            const handlers = (layer.route.stack ?? []).map((s) => s.handle).filter(Boolean);
            for (const p of routePaths) {
                for (const method of methods) {
                    routes.push({
                        method: method.toLowerCase(),
                        path: normalizeRoutePath(`${prefix}${p}`),
                        handlers,
                    });
                }
            }
            continue;
        }
        // Nested router via router.use('/x', childRouter)
        const childStack = layer.handle?.stack;
        if (layer.name === 'router' && Array.isArray(childStack)) {
            const mount = mountPathFromLayerRegexp(layer.regexp);
            const childRouter = layer.handle;
            routes.push(...extractRoutesFromRouter(childRouter, normalizeRoutePath(`${prefix}${mount}`)));
        }
    }
    return routes;
}
function expressPathToOpenApi(path) {
    const params = [];
    const openapiPath = path.replace(/\/:([A-Za-z0-9_]+)/g, (_m, p1) => {
        params.push(p1);
        return `/{${p1}}`;
    });
    return { openapiPath, params };
}
function isExpressValidatorChain(fn) {
    // express-validator chains are callable functions with a `builder` object.
    return typeof fn === 'function' && fn.builder && typeof fn.builder === 'object' && Array.isArray(fn.builder.fields);
}
function inferSchemaTypeFromValidators(validators) {
    const names = new Set();
    for (const v of validators) {
        if (v && typeof v === 'object' && typeof v.validator === 'object' && typeof v.validator.name === 'string') {
            names.add(v.validator.name);
        }
    }
    if (names.has('isEmail'))
        return { type: 'string', format: 'email' };
    if (names.has('isMobilePhone'))
        return { type: 'string' };
    if (names.has('isBoolean'))
        return { type: 'boolean' };
    if (names.has('isNumeric') || names.has('isInt') || names.has('isFloat'))
        return { type: 'number' };
    return { type: 'string' };
}
function buildRequestBodySchemaFromHandlers(handlers) {
    if (!handlers?.length)
        return null;
    const chains = handlers.filter(isExpressValidatorChain);
    if (!chains.length)
        return null;
    const properties = {};
    const required = new Set();
    for (const chain of chains) {
        const fields = Array.isArray(chain.builder?.fields) ? chain.builder.fields : [];
        const optional = Boolean(chain.builder?.optional);
        const validators = Array.isArray(chain.builder?.stack) ? chain.builder.stack : [];
        const inferred = inferSchemaTypeFromValidators(validators);
        for (const field of fields) {
            properties[field] = {
                ...(properties[field] ?? {}),
                ...inferred,
            };
            if (!optional)
                required.add(field);
        }
    }
    const schema = { type: 'object', properties };
    const reqArr = Array.from(required);
    if (reqArr.length)
        schema.required = reqArr;
    return schema;
}
const tagByPrefix = {
    '/auth': 'Auth',
    '/admin-auth': 'Admin Auth',
    '/users': 'Users',
    '/admins': 'Admins',
    '/roles': 'Admins',
    '/products': 'Products',
    '/categories': 'Categories',
    '/collections': 'Collections',
    '/banners': 'Banners',
    '/content': 'Content',
    '/cart': 'Cart',
    '/wishlist': 'Wishlist',
    '/addresses': 'Addresses',
    '/orders': 'Orders',
    '/payments': 'Payments',
    '/reviews': 'Reviews',
    '/coupons': 'Coupons',
    '/custom-blouse': 'Custom Blouse',
    '/analytics': 'Analytics',
    '/settings': 'Settings',
    '/uploads': 'Uploads',
    '/support': 'Support',
    '/notifications': 'Support',
    '/audit-logs': 'Audit Logs',
};
function inferTagFromPath(fullPath) {
    // fullPath may or may not include /api/v1 prefix (servers already include /api/v1)
    const withoutPrefix = fullPath.replace(/^\/api\/v1/, '');
    const seg = `/${(withoutPrefix.split('/').filter(Boolean)[0] ?? '').toString()}`;
    if (tagByPrefix[seg])
        return tagByPrefix[seg];
    if (seg === '/')
        return 'General';
    return titleCase(seg.replace(/^\//, ''));
}
function buildOpenApiPaths(routes) {
    const paths = {};
    for (const r of routes) {
        // Build spec paths relative to the server URL (which already includes /api/v1)
        const relative = r.path.replace(/^\/api\/v1/, '') || '/';
        if (!relative.startsWith('/'))
            continue;
        const { openapiPath, params } = expressPathToOpenApi(relative);
        paths[openapiPath] ?? (paths[openapiPath] = {});
        const tag = inferTagFromPath(relative);
        const operation = {
            tags: [tag],
            summary: `${r.method.toUpperCase()} ${relative}`,
            responses: {
                200: {
                    description: 'OK',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ApiResponse' },
                        },
                    },
                },
            },
        };
        if (params.length) {
            operation.parameters = params.map((name) => ({
                name,
                in: 'path',
                required: true,
                schema: { type: 'string' },
            }));
        }
        const requestSchema = buildRequestBodySchemaFromHandlers(r.handlers);
        if (requestSchema && ['post', 'put', 'patch'].includes(r.method)) {
            operation.requestBody = {
                required: true,
                content: {
                    'application/json': {
                        schema: requestSchema,
                    },
                },
            };
        }
        else if (['post', 'put', 'patch'].includes(r.method)) {
            operation.requestBody = {
                required: false,
                content: {
                    'application/json': {
                        schema: { type: 'object' },
                    },
                },
            };
        }
        paths[openapiPath][r.method] = operation;
    }
    return paths;
}
function createSwaggerSpec(apiRouter) {
    const baseSpec = (0, swagger_jsdoc_1.default)(options);
    const discoveredRoutes = extractRoutesFromRouter(apiRouter, '/api/v1');
    const generatedPaths = buildOpenApiPaths(discoveredRoutes);
    baseSpec.paths = {
        ...(baseSpec.paths ?? {}),
        ...generatedPaths,
    };
    return baseSpec;
}
//# sourceMappingURL=index.js.map