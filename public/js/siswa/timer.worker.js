let timerInterval;


self.onmessage = function(e) {
  const { command, endTime } = e.data;

  if (command === 'start') {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      const sisaWaktu = endTime - Date.now();

      if (sisaWaktu <= 0) {

        self.postMessage({ status: 'done' });
        clearInterval(timerInterval);
      } else {

        self.postMessage({ status: 'tick', sisaWaktu: sisaWaktu });
      }
    },1); 
  }

  if (command === 'stop') {
    clearInterval(timerInterval);
  }
};