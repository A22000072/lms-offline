// /js/selesai/modules/api.js

/**
 * Mengambil data pengaturan ujian dari server.
 * @returns {Promise<object>} Objek pengaturan.
 */
export async function fetchPengaturan() {
  const response = await fetch('/api/pengaturan');
  if (!response.ok) {
    throw new Error('Gagal memuat data pengaturan.');
  }
  return await response.json();
}

/**
 * Mengambil data hasil ujian terakhir milik siswa.
 * @returns {Promise<object>} Objek hasil ujian.
 */
export async function fetchHasilTerakhir() {
  // Pastikan backend Anda menyediakan endpoint ini
  const response = await fetch('/api/hasil/terakhir');
  if (!response.ok) {
    throw new Error('Gagal memuat data hasil terakhir.');
  }
  return await response.json();
}