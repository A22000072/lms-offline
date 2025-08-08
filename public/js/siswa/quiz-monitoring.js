window.ujianMonitor = {
    socket: null,
    userInfo: {},
    isInitialized: false,

    init: function() {
        if (this.isInitialized) return;
        try {
            this.socket = io();
            this.isInitialized = true;
            // console.log('[MONITOR] Monitor berhasil diinisialisasi dan terhubung.');
        } catch (error) {
            console.error('[MONITOR] Gagal menginisialisasi Socket.IO.', error);
        }
    },

    setUser: function(info) {
        this.userInfo = info;
        // console.log('[MONITOR] Informasi siswa disimpan:', this.userInfo);
    },

    track: function(aktivitas, progress = '', sisaWaktu = 0) {
        if (!this.isInitialized || !this.socket) {
            console.warn('[MONITOR] Monitor belum diinisialisasi.');
            return;
        }
        if (!this.userInfo.nama || !this.userInfo.kelas) {
            console.warn('[MONITOR] Informasi siswa belum ada, aktivitas tidak dikirim.');
            return;
        }

        const data = {
            nama: this.userInfo.nama,
            kelas: this.userInfo.kelas,
            aktivitas: aktivitas,
            progress: progress,
            waktu: new Date().toISOString(),
            sisaWaktu: sisaWaktu
        };
        
        this.socket.emit('aktivitas', data);
        // console.log('[MONITOR] Aktivitas terkirim ->', data);
    }
};

window.ujianMonitor.init();