
async function loadPengaturan() {
  try {
    const response = await fetch('/api/pengaturan');
    const data = await response.json();

    // Isi form dengan data dari server
    document.getElementById('durasi').value = data.durasi;
    document.getElementById('tampilkan-nilai').checked = data.tampilkan_nilai;
    document.getElementById('tampilkan-review').checked = data.tampilkan_review;

  } catch (error) {
    console.error('Gagal memuat pengaturan:', error);
    alert('Gagal memuat pengaturan ujian.');
  }
}

function setupFormPengaturan() {
  const form = document.getElementById('form-pengaturan');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const data = {
      durasi: document.getElementById('durasi').value,
      tampilkan_nilai: document.getElementById('tampilkan-nilai').checked,
      tampilkan_review: document.getElementById('tampilkan-review').checked,
    };

    try {
      const response = await fetch('/api/pengaturan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Gagal menyimpan.');
      alert('Pengaturan berhasil disimpan!');
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan pengaturan.');
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Simpan Pengaturan';
    }
  });
}

export function initHalamanPengaturan() {
  loadPengaturan();
  setupFormPengaturan();
}