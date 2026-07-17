// Origines autorisées, partagées entre le CORS HTTP (main.ts) et le CORS du gateway WebSocket
// (operation-gateway.gateway.ts) — un seul endroit à mettre à jour.
export const CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://ton-frontend.onrender.com',
  'https://blocbackfront.onrender.com',
  'https://chu-bloc-backend.onrender.com',
  'https://anesthesie-reanimation.onrender.com',
];
