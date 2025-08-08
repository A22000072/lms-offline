
import { examState } from './state.js';
import { fetchSoalById } from './api.js';
import { mulaiTimer } from './timer.js';

export function saveExamSession() {
  const stateToSave = {
    shuffledIds: examState.shuffledIds,
    totalSoal: examState.totalSoal,
    jawabanSiswa: examState.jawabanSiswa,
    shuffledOptions: examState.shuffledOptions,
    currentIndex: examState.currentIndex,
    endTime: examState.endTime,
    userInfo: examState.userInfo,
    waktuMulai: examState.waktuMulai,
  };
  localStorage.setItem('examInProgress', JSON.stringify(stateToSave));
}

export function resumeExamSession() {
  const savedStateJSON = localStorage.getItem('examInProgress');
  if (!savedStateJSON) return false;

  const savedState = JSON.parse(savedStateJSON);
  Object.assign(examState, savedState);
  examState.endTime = new Date(savedState.endTime);
  document.getElementById('modal-identitas').style.display = 'none';

  if (typeof activateAntiSwitch === 'function') activateAntiSwitch();
  
  fetchSoalById(examState.shuffledIds[examState.currentIndex]).then(() => {
    if (!sessionStorage.getItem('isExamBlocked')) {
      mulaiTimer(true);
    }
    setTimeout(() => {
      if (window.ujianMonitor && window.ujianMonitor.socket.connected) {
        const sisaWaktu = examState.endTime.getTime() - new Date().getTime();
        const reconnectData = {
          userInfo: examState.userInfo,
          progress: Object.keys(examState.jawabanSiswa).length,
          totalSoal: examState.totalSoal,
          sisaWaktu: sisaWaktu > 0 ? sisaWaktu : 0,
          token: sessionStorage.getItem('assignedToken') || null 
        };
        window.ujianMonitor.socket.emit('studentReconnected', reconnectData);
      }
    }, 500);
  });
  return true;
}