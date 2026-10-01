/** Format integer cents as en-ZA ZAR (matches the app / Brew Lab seed). */
export function zar(cents: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format((cents || 0) / 100);
}

export function zarSigned(cents: number): string {
  const abs = zar(Math.abs(cents));
  return cents < 0 ? `-${abs}` : abs;
}
