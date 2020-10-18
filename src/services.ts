// Export services
export * from './services/index';

// Initialize the database on import
import { initDB } from './services/util';
initDB();
