export function money(value: { amount: number; currency: string }): string {
  return `${new Intl.NumberFormat('es-ES').format(value.amount)} ${value.currency}`;
}

export function pips(value: number): string {
  return `${new Intl.NumberFormat('es-ES').format(value)} pips`;
}

export function yesNo(value: boolean): string {
  return value ? 'Sí' : 'No';
}
