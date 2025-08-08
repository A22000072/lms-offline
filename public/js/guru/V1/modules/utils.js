

export function formatTanggal(datetimeStr) {
  if (!datetimeStr) return '-';
  const date = new Date(datetimeStr);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit',
  });
}