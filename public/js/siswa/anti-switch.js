

const antiSwitchState = {
    isExamActive: false,
    isBlocked: false,
    offenseCount: 0,
    socket: null
};


let isUnloading = false;

function activateAntiSwitch() {
    if (!document.getElementById('quiz-container')) return;

    if (window.ujianMonitor && window.ujianMonitor.socket) {
        antiSwitchState.socket = window.ujianMonitor.socket;
    } else {
        console.error("[Anti-Switch] Gagal mendapatkan koneksi socket. Fitur tidak akan berjalan.");
        return;
    }

    antiSwitchState.socket.on('tokenAssigned', (data) => {
        if (data.token) {
            sessionStorage.setItem('assignedToken', data.token);
        }
    });

    antiSwitchState.offenseCount = parseInt(sessionStorage.getItem('offenseCount') || '0', 10);
    const isCurrentlyBlocked = sessionStorage.getItem('isExamBlocked') === 'true';

    antiSwitchState.isExamActive = true;
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', () => {
        isUnloading = true;
    });


    if (isCurrentlyBlocked) {
        antiSwitchState.isBlocked = true;
        
        if (typeof pauseExamTimer === 'function') {
            pauseExamTimer();
        }


        switch (antiSwitchState.offenseCount) {
            case 1:
                showWarning();
                break;
            case 2:
            case 3:
                showTokenModal();
                break;
            case 4:
                finishExamBySystem();
                break;
        }
    }
}


function deactivateAntiSwitch() {
    antiSwitchState.isExamActive = false;
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    sessionStorage.removeItem('offenseCount');
    sessionStorage.removeItem('isExamBlocked'); // PERBAIKAN
    sessionStorage.removeItem('assignedToken');
}

function handleVisibilityChange() {
    if (isUnloading) {
        return;
    }
    if (!antiSwitchState.isExamActive || !document.hidden || antiSwitchState.isBlocked) {
        return;
    }

    antiSwitchState.isBlocked = true;
    sessionStorage.setItem('isExamBlocked', 'true');
    antiSwitchState.offenseCount++;
    sessionStorage.setItem('offenseCount', antiSwitchState.offenseCount);

    if (typeof pauseExamTimer === 'function') {
        pauseExamTimer();
    }

    switch (antiSwitchState.offenseCount) {
        case 1:
            showWarning();
            break;
        case 2:
        case 3:
            requestNewToken();
            showTokenModal();
            break;
        case 4:
            finishExamBySystem();
            break;
    }
}

function requestNewToken() {
    if (antiSwitchState.socket) {
        const siswaInfo = {
            nama: examState.userInfo.nama,
            kelas: examState.userInfo.kelas
        };
        antiSwitchState.socket.emit('requestToken', siswaInfo);
    }
}

async function validateToken() {
    const tokenInput = document.getElementById('token-input');
    const tokenError = document.getElementById('token-error');
    const tokenModal = document.getElementById('token-modal');
    const token = tokenInput.value.trim();


    if (!antiSwitchState.socket || !antiSwitchState.socket.id) {
        tokenError.textContent = 'Koneksi ke server hilang, refresh halaman.';
        tokenError.classList.remove('hidden');
        return;
    }

    if (!token) {
        tokenError.textContent = 'Token tidak boleh kosong.';
        tokenError.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch('/api/ujian/validate-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                token: token,
                socketId: antiSwitchState.socket.id 
            })
        });

        const result = await response.json();

        if (result.success) {
            tokenModal.classList.add('hidden');
            if (typeof resumeExamTimer === 'function') {
                resumeExamTimer();
            }
            antiSwitchState.isBlocked = false;
            sessionStorage.removeItem('isExamBlocked');
        } else {
            tokenError.textContent = result.message || 'Token tidak valid. Coba lagi.';
            tokenError.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error saat validasi token:', error);
        tokenError.textContent = 'Gagal terhubung ke server.';
        tokenError.classList.remove('hidden');
    }
}

function showWarning() {
    const warningOverlay = document.getElementById('warning-overlay');
    if (warningOverlay) {
        warningOverlay.classList.remove('hidden');
    }
    const closeBtn = document.getElementById('close-warning-btn');
    closeBtn.onclick = () => {
        warningOverlay.classList.add('hidden');
        if (typeof resumeExamTimer === 'function') {
            resumeExamTimer();
        }
        antiSwitchState.isBlocked = false;
        sessionStorage.removeItem('isExamBlocked');
    };
}


function showTokenModal() {
    const tokenModal = document.getElementById('token-modal');
    if (tokenModal) {
        const tokenError = document.getElementById('token-error');
        const tokenInput = document.getElementById('token-input');
        tokenError.classList.add('hidden');
        tokenInput.value = '';
        tokenModal.classList.remove('hidden');
        document.getElementById('pelanggaran-count').textContent = antiSwitchState.offenseCount;
    }
}


function finishExamBySystem() {
    deactivateAntiSwitch();
    alert('Anda telah melakukan pelanggaran maksimal. Ujian akan diselesaikan secara otomatis.');
    if (typeof submitUjian === 'function') {
        const originalConfirm = window.confirm;
        window.confirm = () => true;
        submitUjian();
        window.confirm = originalConfirm;
    }
}