export function getCurrencySymbol(currencyStr?: string): string {
  if (!currencyStr) return "DZA";
  const str = currencyStr.trim();
  if (str.includes("DZA") || str.includes("DZD") || str.includes("DA")) return "DZA";
  if (str.includes("€") || str.includes("EUR")) return "€";
  if (str.includes("$") || str.includes("USD")) return "$";
  if (str.includes("CHF")) return "CHF";
  if (str.includes("MAD") || str.includes("DH")) return "DH";
  if (str.includes("TND") || str.includes("DT")) return "DT";

  const match = str.match(/\(([^)]+)\)/);
  if (match && match[1]) return match[1];
  return str;
}

export function formatCurrency(amount: number, currencyStr?: string): string {
  const symbol = getCurrencySymbol(currencyStr);
  const formatted = amount.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return `${formatted} ${symbol}`;
}
