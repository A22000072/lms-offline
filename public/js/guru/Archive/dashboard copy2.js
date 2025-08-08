// /js/guru/dashboard.js

// =======================================================================
// A. INISIALISASI & LOGIKA TAB
// =======================================================================

// Objek untuk melacak tab mana yang datanya sudah dimuat
const loadedTabs = {
  soal: false,
  hasil: false,
  monitoring: false,
  pengaturan: false,
};

// Fungsi ini akan dipanggil oleh tombol di sidebar
async function handleTabClick(tabName) {
  // Jika data untuk tab ini belum dimuat, muat sekarang.
  if (!loadedTabs[tabName]) {
    // console.log(`First time loading tab: ${tabName}`);
    switch (tabName) {
      case 'soal':
        await initHalamanSoal();
        break;
      case 'hasil':
        await initHalamanHasil();
        break;
      case 'pengaturan':
        await initHalamanPengaturan();
        break;
      case 'monitoring':
        // Panggil fungsi inisialisasi dari monitoring.js jika ada
        if (typeof initMonitoring === 'function') {
          initMonitoring();
        }
        break;
    }
    // Tandai bahwa tab ini sudah dimuat
    loadedTabs[tabName] = true;
  }

  // Panggil fungsi `showTab` yang ada di HTML untuk menampilkan section-nya
  showTab(tabName);
}

// Inisialisasi halaman saat pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
  // Secara otomatis memuat dan menampilkan tab 'soal' sebagai default
  handleTabClick('soal');
});

// Definisi fungsi inisialisasi untuk setiap tab
function initHalamanSoal() {
  loadTabelSoal();
  setupFormSoal();
  setupFormImport();
}

function initHalamanHasil() {
  loadHasilUjian();
}

function initHalamanPengaturan() {
  loadPengaturan();
  setupFormPengaturan();
}

// =======================================================================
// B. FUNGSI CRUD (Create, Read, Update, Delete) SOAL
// =======================================================================

async function loadTabelSoal() {
  const tbody = document.getElementById('tabel-soal');
  tbody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500 py-4">Memuat data soal...</td></tr>`;
  try {
    const response = await fetch('/api/soal');
    if (!response.ok) throw new Error('Gagal mengambil data dari server.');
    const data = await response.json();
    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500 py-4">Belum ada soal. Silakan tambahkan soal baru.</td></tr>`;
      return;
    }
    data.forEach((soal, i) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-gray-100';
      tr.innerHTML = `
        <td class="px-4 py-3">${i + 1}</td>
        <td class="px-4 py-3">${soal.pertanyaan}</td>
        <td class="px-4 py-3 font-semibold">${soal.jawaban_benar?.toUpperCase() || '-'}</td>
        <td class="px-4 py-3">
          <button class="bg-yellow-400 hover:bg-yellow-500 text-white text-xs px-3 py-1 rounded-md transition" onclick="editSoal(${soal.id})">Edit</button>
          <button class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-md transition" onclick="hapusSoal(${soal.id})">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Gagal memuat soal:', error);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500 py-4">Gagal memuat data. Silakan coba lagi.</td></tr>`;
  }
}

function setupFormSoal() {
  const form = document.getElementById('formTambahSoal');
  const submitBtn = document.getElementById('submit-soal-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';
    const data = {
      pertanyaan: document.getElementById('pertanyaan').value,
      pilihan_a: document.getElementById('a').value,
      pilihan_b: document.getElementById('b').value,
      pilihan_c: document.getElementById('c').value,
      pilihan_d: document.getElementById('d').value,
      pilihan_e: document.getElementById('e').value,
      jawaban_benar: document.getElementById('jawaban').value.toLowerCase(),
    };
    const editId = document.getElementById('edit-id').value;
    const url = editId ? `/api/soal/${editId}` : '/api/soal';
    const method = editId ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(`Gagal ${editId ? 'memperbarui' : 'menyimpan'} soal.`);
      resetFormSoal();
      await loadTabelSoal();
    } catch (error) {
      console.error('Error saat menyimpan soal:', error);
      alert('Terjadi kesalahan saat menyimpan soal.');
    } finally {
      submitBtn.disabled = false;
    }
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      resetFormSoal();
    });
  }
}

async function editSoal(id) {
  try {
    const response = await fetch(`/api/soal/${id}`);
    if (!response.ok) throw new Error('Gagal memuat data soal untuk diedit.');
    const data = await response.json();
    document.getElementById('edit-id').value = data.id;
    document.getElementById('pertanyaan').value = data.pertanyaan;
    document.getElementById('a').value = data.pilihan_a;
    document.getElementById('b').value = data.pilihan_b;
    document.getElementById('c').value = data.pilihan_c;
    document.getElementById('d').value = data.pilihan_d;
    document.getElementById('e').value = data.pilihan_e;
    document.getElementById('jawaban').value = data.jawaban_benar;
    document.getElementById('submit-soal-btn').textContent = 'Update Soal';
    document.getElementById('formTambahSoal').scrollIntoView({ behavior: 'smooth' });
    
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const formTitle = document.getElementById('form-title');
    if (cancelBtn) cancelBtn.classList.remove('hidden');
    if (formTitle) formTitle.textContent = 'Edit Soal';

  } catch (error) {
    console.error('Gagal mengambil soal untuk diedit:', error);
    alert('Gagal memuat data soal.');
  }
}

async function hapusSoal(id) {
  if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
    try {
      const response = await fetch(`/api/soal/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus soal.');
      await loadTabelSoal();
    } catch (error) {
      console.error('Gagal menghapus soal:', error);
      alert('Gagal menghapus soal.');
    }
  }
}

function resetFormSoal() {
  const form = document.getElementById('formTambahSoal');
  form.reset();
  document.getElementById('edit-id').value = '';
  document.getElementById('submit-soal-btn').textContent = 'Simpan Soal';

  const cancelBtn = document.getElementById('cancel-edit-btn');
  const formTitle = document.getElementById('form-title');
  if (cancelBtn) cancelBtn.classList.add('hidden');
  if (formTitle) formTitle.textContent = 'Tambah Soal Baru';
}

// =======================================================================
// C. FUNGSI HASIL UJIAN
// =======================================================================

async function loadHasilUjian() {
  const tbody = document.getElementById('tabel-hasil');
  tbody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500 py-4">Memuat hasil ujian...</td></tr>`;
  try {
    const response = await fetch('/api/hasil');
    if (!response.ok) throw new Error('Gagal mengambil data hasil ujian.');
    const data = await response.json();
    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500 py-4">Belum ada hasil ujian yang masuk.</td></tr>`;
      return;
    }
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-gray-100';
      tr.innerHTML = `
        <td class="px-4 py-3">${row.nama}</td>
        <td class="px-4 py-3">${row.kelas}</td>
        <td class="px-4 py-3 font-semibold">${row.nilai}</td>
        <td class="px-4 py-3">${formatTanggal(row.waktu_selesai)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Gagal memuat hasil ujian:', error);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500 py-4">Gagal memuat hasil ujian.</td></tr>`;
  }
}

// =======================================================================
// D. FUNGSI PENGATURAN UJIAN
// =======================================================================

async function loadPengaturan() {
    // Menggunakan ID dari HTML Anda
    const judulInput = document.getElementById('judulUjian');
    const durasiInput = document.getElementById('durasiUjian');
    const tampilNilaiCheck = document.getElementById('tampilkanNilai');
    const tampilKunciCheck = document.getElementById('tampilkanKunci');

    try {
        const response = await fetch('/api/pengaturan');
        if (!response.ok) throw new Error('Gagal mengambil data pengaturan.');
        const data = await response.json();

        judulInput.value = data.judul || 'Ujian Online';
        durasiInput.value = data.durasi || 15;
        tampilNilaiCheck.checked = data.tampilkanNilai ?? true;
        tampilKunciCheck.checked = data.tampilkanKunci ?? false;
    } catch (err) {
        console.error('Gagal memuat pengaturan:', err);
        alert('Gagal memuat pengaturan ujian.');
    }
}

function setupFormPengaturan() {
    // Menggunakan ID dari HTML Anda
    const form = document.getElementById('formPengaturanUjian');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Menyimpan...';

        const data = {
            judul: document.getElementById('judulUjian').value,
            durasi: parseInt(document.getElementById('durasiUjian').value),
            tampilkanNilai: document.getElementById('tampilkanNilai').checked,
            tampilkanKunci: document.getElementById('tampilkanKunci').checked,
        };

        try {
            const response = await fetch('/api/pengaturan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Gagal menyimpan pengaturan.');
            alert('Pengaturan berhasil disimpan!');
        } catch (err) {
            alert('Terjadi kesalahan saat menyimpan.');
            console.error(err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan Pengaturan';
        }
    });
}

// =======================================================================
// E. FUNGSI IMPORT EXCEL
// =======================================================================

function setupFormImport() {
  const form = document.getElementById('formImportExcel');
  const fileInput = document.getElementById('excel-file');
  const importBtn = form.querySelector('button[type="submit"]');
  const statusEl = document.createElement('p'); // Buat elemen status
  statusEl.className = 'text-sm text-gray-600 mt-2 hidden';
  form.appendChild(statusEl);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) {
      alert('Silakan pilih file Excel terlebih dahulu.');
      return;
    }
    importBtn.disabled = true;
    statusEl.textContent = 'Membaca file...';
    statusEl.classList.remove('hidden');
    try {
      const rows = await parseExcel(file);
      let importSuccess = 0, importFail = 0;
      for (const [index, row] of rows.entries()) {
        statusEl.textContent = `Mengimpor soal ${index + 1} dari ${rows.length}...`;
        const soal = {
          pertanyaan: row.Pertanyaan,
          pilihan_a: row.A, pilihan_b: row.B, pilihan_c: row.C, pilihan_d: row.D, pilihan_e: row.E,
          jawaban_benar: String(row.Jawaban || '').toLowerCase(),
        };
        if (isValidSoal(soal)) {
          const success = await sendSoalToServer(soal);
          if (success) importSuccess++; else importFail++;
        } else {
          importFail++;
        }
      }
      alert(`Import selesai.\nBerhasil: ${importSuccess}\nGagal: ${importFail}`);
      await loadTabelSoal();
    } catch (error) {
      console.error('Error saat import Excel:', error);
      alert('Terjadi kesalahan saat memproses file Excel.');
    } finally {
      importBtn.disabled = false;
      fileInput.value = '';
      statusEl.classList.add('hidden');
    }
  });
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(sheet, { defval: '' }));
      } catch (e) { reject(e); }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

function isValidSoal(soal) {
  return soal.pertanyaan && soal.pilihan_a && soal.pilihan_b && soal.pilihan_c && soal.pilihan_d && soal.pilihan_e && soal.jawaban_benar;
}

async function sendSoalToServer(soal) {
  try {
    const res = await fetch('/api/soal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(soal) });
    return res.ok;
  } catch (err) {
    console.error('Gagal mengirim soal:', err);
    return false;
  }
}

// =======================================================================
// F. FUNGSI UTILITAS
// =======================================================================

function formatTanggal(datetimeStr) {
  if (!datetimeStr) return '-';
  const date = new Date(datetimeStr);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

console.log('Script dimuat');
async function hapusSemuaSoal() {
    const konfirmasi = confirm("APAKAH ANDA YAKIN? Tindakan ini akan menghapus SEMUA soal secara permanen dan tidak dapat dibatalkan.");
    if (!konfirmasi) return;

    const konfirmasiKedua = prompt("Untuk konfirmasi, ketik 'HAPUS' di bawah ini:");
    if (konfirmasiKedua !== 'HAPUS') {
        alert('Konfirmasi tidak cocok. Tindakan dibatalkan.');
        return;
    }

    const btn = document.getElementById('hapus-semua-soal-btn');

    try {
        btn.disabled = true;
        btn.innerHTML = 'Menghapus...';

       const response = await fetch('/api/soal/all', { method: 'DELETE' });

const data = await response.json(); // Ambil response JSON
console.log('Respon dari server:', data); // <== Tambahkan ini

if (!response.ok) {
    throw new Error(data.error || 'Gagal menghapus semua soal dari server.');
}


        if (!response.ok) {
            throw new Error('Gagal menghapus semua soal dari server.');
        }

        alert('Semua soal berhasil dihapus.');
        await loadTabelSoal(); // Muat ulang tabel

    } catch (error) {
        console.error('Error saat menghapus semua soal:', error);
        alert('Terjadi kesalahan saat menghapus soal.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="trash-2" class="w-4 h-4"></i> Hapus Semua Soal`;
        lucide.createIcons();
    }
}

async function initHalamanPengaturan() {
  await loadPengaturan();
  setupFormPengaturan();
}

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