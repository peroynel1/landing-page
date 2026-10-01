/** Format integer cents as en-ZA ZAR (matches the app / Brew Lab seed). */
export function zar(cents: number): string {
  const value = (cents || 0) / 100;
  const fractionDigits = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
}

export function zarSigned(cents: number): string {
  const abs = zar(Math.abs(cents));
  return cents < 0 ? `-${abs}` : abs;
}
