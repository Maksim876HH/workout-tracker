let timerInterval = null;
let timeLeft = 0;

//  Запуск таймера с возможностью передать любое время (в секундах)
export function startTimer(seconds, displayElement, onFinish) {
  // Если таймер уже тикает — останавливаем его перед новым запуском
  stopTimer();

  timeLeft = seconds;
  updateDisplay(displayElement, timeLeft);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay(displayElement, timeLeft);

    if (timeLeft <= 0) {
      stopTimer();
      if (onFinish) onFinish();
    }
  }, 1000);
}

// Функция остановки и сброса
export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Вспомогательная функция форматирования времени (01:30)
function updateDisplay(element, seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');

  element.textContent = `${formattedMins}:${formattedSecs}`;
}