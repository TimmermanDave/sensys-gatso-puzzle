import { createServer } from 'node:http';
import { createApiHandler } from './api.js';

createServer(createApiHandler()).listen(3001, '0.0.0.0', () => {
  console.log('Puzzle API listening on port 3001');
});
