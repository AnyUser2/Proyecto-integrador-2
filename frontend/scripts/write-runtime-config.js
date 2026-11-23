import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const runtimeConfig = {
  apiUrl: process.env.VITE_API_URL || '',
};

writeFileSync(
  resolve('dist/runtime-config.js'),
  `globalThis.__APP_CONFIG__ = ${JSON.stringify(runtimeConfig)};\n`,
);
