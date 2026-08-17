/** Swap this for the Play Store listing URL when it is live. */
export const PLAY_STORE_URL = '#';

/** Public Edge function. Authz is the token; never put a service-role key here. */
export const PUBLIC_ORDER_FUNCTION_URL =
  import.meta.env.VITE_PUBLIC_ORDER_FUNCTION_URL?.trim() ||
  'https://kooeycoizuvlhcuzltxy.supabase.co/functions/v1/public-order';

/** Anon key is public by design; required by the Supabase gateway even with verify_jwt = false. */
export const PUBLIC_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
