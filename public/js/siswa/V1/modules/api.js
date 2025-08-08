
export async function fetchStartExam() {
  const response = await fetch("/api/ujian/start");
  if (!response.ok) throw new Error('Gagal memulai sesi ujian.');
  return await response.json();
}

export async function fetchSoalById(id) {
  const response = await fetch(`/api/soal/by-id/${id}`);
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return await response.json();
}

export async function submitExamToServer(data) {
  const response = await fetch('/api/ujian/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Gagal mengirim jawaban.');
  return await response.json();
}