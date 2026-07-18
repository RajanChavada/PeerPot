import { analyze } from './src/core/analyze.ts';

async function run() {
  const env = await import('fs/promises').then(m => m.readFile('.env.local', 'utf-8'));
  const key = env.split('\n').find(l => l.startsWith('VITE_BACKBOARD_API_KEY'))?.split('=')[1];
  
  (globalThis as any).import = { meta: { env: { VITE_BACKBOARD_API_KEY: key } } };

  const res = await analyze({ kind: 'code', content: 'const a = 1;' });
  console.log("FINAL RESULT:", JSON.stringify(res, null, 2));
}
run();
