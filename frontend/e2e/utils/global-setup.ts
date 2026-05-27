import { request } from '@playwright/test';

export default async function globalSetup() {
  const backendUrl = process.env['BACKEND_URL'] ?? 'http://localhost:8000';
  const maxRetries = 30;
  const delayMs = 2000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const ctx = await request.newContext({ baseURL: backendUrl });
      const resp = await ctx.get('/health');
      await ctx.dispose();
      if (resp.ok()) {
        console.log('Backend is healthy. Starting E2E tests.');
        return;
      }
    } catch {
      // backend not ready yet
    }
    console.log(`Waiting for backend... attempt ${i + 1}/${maxRetries}`);
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error('Backend health check failed after max retries.');
}
