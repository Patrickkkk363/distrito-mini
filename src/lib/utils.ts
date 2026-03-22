export function formatCurrency(amount: number): string {
  return `S/ ${amount.toFixed(2)}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('es-PE', {
    month: 'short',
    day: 'numeric',
  });
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    yape: 'Yape',
    plin: 'Plin',
  };
  return labels[method] || method;
}

export function getPaymentMethodIcon(method: string): string {
  const icons: Record<string, string> = {
    cash: '💵',
    card: '💳',
    yape: '📱',
    plin: '📲',
  };
  return icons[method] || '💰';
}
