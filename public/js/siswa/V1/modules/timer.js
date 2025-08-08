
import { examState, durasiUjian } from './state.js';
import { submitUjian } from './exam-logic.js';

export function mulaiTimer(isResume = false) {
  if (!isResume) {
    examState.waktuMulai = new Date().toISOString();
    examState.endTime = new Date(new Date().getTime() + durasiUjian * 1000);
  }

  if (examState.timerWorker) {
    examState.timerWorker.terminate();
  }

  examState.timerWorker = new Worker('/js/siswa/timer.worker.js');
  examState.timerWorker.postMessage({
    command: 'start',
    endTime: examState.endTime.getTime()
  });

  examState.timerWorker.onmessage = function(e) {
    const { status, sisaWaktu } = e.data;
    if (status === 'tick' && !examState.isPaused) {
      const timerDisplay = document.getElementById('timer');
      if (timerDisplay) {
        const menit = Math.floor(sisaWaktu / 60000);
        const detik = Math.floor((sisaWaktu % 60000) / 1000);
        timerDisplay.textContent = `${String(menit).padStart(2, '0')}:${String(detik).padStart(2, '0')}`;
      }
    }
    if (status === 'done') {
      examState.timerWorker.terminate();
      examState.timerWorker = null;
      document.getElementById('timer').textContent = 'Waktu Habis';
      if (typeof deactivateAntiSwitch === 'function') deactivateAntiSwitch();
      alert('Waktu habis! Ujian akan dikumpulkan secara otomatis.');
      const originalConfirm = window.confirm;
      window.confirm = () => true;
      submitUjian();
      window.confirm = originalConfirm;
    }
  };
}

export function pauseExamTimer() {
  examState.isPaused = true;
}

export function resumeExamTimer() {
  examState.isPaused = false;
}