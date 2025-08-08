// file: /socket/socketManager.js (Versi Final Stabil dengan ID Unik)

const connectedStudents = {};
const activeTokens = {};

module.exports = function(io) {
  io.activeTokens = activeTokens;
  
  io.on('connection', (socket) => {
    if (socket.handshake.query.role === 'teacher') {
      socket.join('guru_monitoring_room');
      socket.on('requestInitialState', () => {
        socket.emit('initialState', connectedStudents);
      });
      return;
    }

    socket.on('studentReconnected', (reconnectData) => {
      const userId = reconnectData.userInfo.id;
      if (userId) {
        for (const oldSocketId in connectedStudents) {
          if (connectedStudents[oldSocketId].userInfo?.id === userId) {
            delete connectedStudents[oldSocketId];
            io.to('guru_monitoring_room').emit('studentDisconnected', { socketId: oldSocketId });
            break;
          }
        }
      }
      
      const studentData = {
        socketId: socket.id,
        userInfo: reconnectData.userInfo,
        nama: reconnectData.userInfo.nama,
        kelas: reconnectData.userInfo.kelas,
        aktivitas: 'Melanjutkan Ujian',
        progress: `${reconnectData.progress}/${reconnectData.totalSoal}`,
        sisaWaktu: reconnectData.sisaWaktu,
        endTime: reconnectData.sisaWaktu ? Date.now() + reconnectData.sisaWaktu : null,
        token: reconnectData.token,
        status: 'online'
      };
      connectedStudents[socket.id] = studentData;
      io.to('guru_monitoring_room').emit('updateAktivitas', studentData);
    });
    
    socket.on('aktivitas', (data) => {
      const existingStudent = connectedStudents[socket.id] || {};
      const studentData = { 
        ...existingStudent,
        ...data, 
        socketId: socket.id,
        status: 'online',
        endTime: data.sisaWaktu ? Date.now() + data.sisaWaktu : null
      };
      connectedStudents[socket.id] = studentData;
      io.to('guru_monitoring_room').emit('updateAktivitas', studentData);
    });

    socket.on('requestToken', (siswaInfo) => {
      const newToken = `TKN${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      activeTokens[socket.id] = newToken;
      if (connectedStudents[socket.id]) {
        connectedStudents[socket.id].token = newToken;
      } else {
        connectedStudents[socket.id] = { ...siswaInfo, socketId: socket.id, token: newToken };
      }
      io.to('guru_monitoring_room').emit('newTokenGenerated', connectedStudents[socket.id]);
    });

    socket.on('disconnect', () => {
      if (connectedStudents[socket.id]) delete connectedStudents[socket.id];
      if (activeTokens[socket.id]) delete activeTokens[socket.id];
      io.to('guru_monitoring_room').emit('studentDisconnected', { socketId: socket.id });
    });
  });
};