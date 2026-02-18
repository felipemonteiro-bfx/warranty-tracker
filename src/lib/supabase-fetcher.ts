/**
 * Fetcher com retry para Supabase
 * Usado com SWR para cache e revalidação
 */

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function supabaseFetcherWithRetry<T>(
  fetcher: () => Promise<{ data: T | null; error: unknown }>
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await fetcher();
      if (error) throw error;
      if (data !== null && data !== undefined) return data;
      return [] as T;
    } catch (e) {
      lastError = e;
      const isNetworkError =
        e instanceof TypeError && e.message?.includes('fetch') ||
        (e as Error)?.name === 'TypeError';
      if (attempt < MAX_RETRIES && isNetworkError) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      } else {
        throw lastError;
      }
    }
  }
  throw lastError;
}
