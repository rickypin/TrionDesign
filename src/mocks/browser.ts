/**
 * MSW Browser Setup
 * Configures Mock Service Worker for browser environment
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup MSW worker with our handlers
export const worker = setupWorker(...handlers);

