// /js/guru/modules/hasil-manager.js
import { formatTanggal } from './utils.js';

async function loadHasilUjian() {
  const tbody = document.getElementById('tabel-hasil');
  tbody.innerHTML = `<tr><td colspan="4" class="text-center">Memuat...</td></tr>`;
  try {
    const response = await fetch('/api/hasil');
    if (!response.ok) throw new Error('Gagal mengambil data.');
    const data = await response.json();
    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center">Belum ada hasil.</td></tr>`;
      return;
    }
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = 'border-b';
      tr.innerHTML = `
        <td class="px-4 py-3">${row.nama}</td>
        <td class="px-4 py-3">${row.kelas}</td>
        <td class="px-4 py-3 font-semibold">${row.nilai}</td>
        <td class="px-4 py-3">${formatTanggal(row.waktu_selesai)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500">Gagal memuat.</td></tr>`;
  }
}

export function initHalamanHasil() {
  loadHasilUjian();
}