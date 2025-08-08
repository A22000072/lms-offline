
export const examState = {
  shuffledIds: [],
  totalSoal: 0,
  currentSoal: null,
  jawabanSiswa: {},
  shuffledOptions: {},
  currentIndex: 0,
  waktuMulai: null,
  endTime: null,
  userInfo: { id: '', nama: '', kelas: '' },
  isPaused: false,
  timerWorker: null,
};

export let durasiUjian = 15 * 60;

export function setDurasiUjian(newDurasi) {
  durasiUjian = newDurasi;
}