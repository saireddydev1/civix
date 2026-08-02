/**
 * Helper to build API endpoints for CIVIX AI services.
 */
export function buildApiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return `${baseUrl}${path}`;
}
