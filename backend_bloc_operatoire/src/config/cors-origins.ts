// Origines autorisées, partagées entre le CORS HTTP (main.ts) et le CORS du gateway WebSocket
// (operation-gateway.gateway.ts) — un seul endroit à mettre à jour.
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

// Permet d'ajouter d'autres fronts sans modifier le code :
// CORS_ORIGINS=https://front-a.example.com,https://front-b.example.com
const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

export const CORS_ORIGINS = [
  ...new Set([...DEFAULT_CORS_ORIGINS, ...configuredOrigins]),
];
