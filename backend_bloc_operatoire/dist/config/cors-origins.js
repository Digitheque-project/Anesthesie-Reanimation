"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORS_ORIGINS = void 0;
const DEFAULT_CORS_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://front-clinique.onrender.com',
    'https://ton-frontend.onrender.com',
    'https://blocbackfront.onrender.com',
    'https://chu-bloc-backend.onrender.com',
    'https://anesthesie-reanimation.onrender.com',
];
const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
exports.CORS_ORIGINS = [
    ...new Set([...DEFAULT_CORS_ORIGINS, ...configuredOrigins]),
];
//# sourceMappingURL=cors-origins.js.map