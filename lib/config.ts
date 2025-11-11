// TurboZaps Configuration
// Sprint 1 - Environment variables configuration

// Load environment variables
// Next.js automatically loads .env.local, but we can use dotenv for explicit loading
import 'dotenv/config';

export const config = {
  lnbits: {
    url: process.env.LNBITS_URL || 'https://demo.lnbits.com',
    apiKey: process.env.LNBITS_API_KEY || '',
  },
  database: {
    url: process.env.DATABASE_URL || './turbozaps.db',
  },
};

// Validate required environment variables
if (!config.lnbits.apiKey && process.env.NODE_ENV === 'production') {
  console.warn('Warning: LNBITS_API_KEY is not set. LNbits integration will not work.');
}

