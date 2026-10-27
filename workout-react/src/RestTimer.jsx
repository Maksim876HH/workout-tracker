import { useState } from 'react';

function RestTimer({ 
  timeLeft, 
  selectedPreset, 
  formatTime, 
  handlePresetClick, 
  setIsRunning, 
  setTimeLeft 
}) {
  const [customInputTime, setCustomInputTime] = useState('');

  // Функция для парсинга формата "ММ:СС" или просто секунд
  const handleCustomTimeSubmit = (e) => {
    e.preventDefault();
    const input = customInputTime.trim();

    let totalSeconds;

    if (input.includes(':')) {
      const parts = input.split(':');
      const mins = Number(parts[0]) || 0;
      const secs = Number(parts[1]) || 0;
      totalSeconds = mins * 60 + secs;
    } else {
      totalSeconds = Number(input) || 0;
    }

    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsRunning(false);
      setCustomInputTime('');
    } else {
      alert('Please enter a valid time (e.g., 2:00 or 90)!');
    }
  };

  return (
    <section className="timer-section">
      <h2>Rest Timer</h2>
      <div id="timer-display">{formatTime(timeLeft)}</div>

      <div className="timer-presets">
        {[30, 60, 90, 120].map((time) => (
          <button
            key={time}
            type="button"
            className={`preset-btn ${selectedPreset === time ? 'active' : ''}`}
            onClick={() => handlePresetClick(time)}
          >
            {time < 60 ? `${time}s` : `${time / 60}m`}
          </button>
        ))}
      </div>

      <form onSubmit={handleCustomTimeSubmit} className="custom-timer-form" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '22px', marginTop: '22px' }}>
  <input
  
    type="text"
    placeholder="Your Time"
    value={customInputTime}
    onChange={(e) => setCustomInputTime(e.target.value)}
    className="custom-time-input"
    
  />
        <button
          type="submit"
          className="secondary-btn"
          style={{ padding: '6px 12px', fontSize: '14px' }}
        >
          Set Time
        </button>
      </form>

      <div className="timer-controls">
        <button id="start-timer-btn" className="secondary-btn-1" onClick={() => setIsRunning(true)}>
          Start
        </button>
        <button
          id="stop-timer-btn"
          className="secondary-btn"
          onClick={() => setIsRunning(false)}
        >
          Stop
        </button>
        <button
          id="reset-timer-btn"
          className="secondary-btn-3"
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(selectedPreset);
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}

export default RestTimer;