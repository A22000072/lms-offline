
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

window.editSoal = editSoal;
window.hapusSoal = hapusSoal;
window.hapusSemuaSoal = hapusSemuaSoal;

export function initHalamanSoal() {
  loadTabelSoal();
  setupFormSoal();
}