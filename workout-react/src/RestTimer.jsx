
import { useState } from 'react';

function RestTimer({
  timeLeft,
  selectedPreset,
  formatTime,
  handlePresetClick,
  isFinished,
  startTimer,
  stopTimer,
  resetTimer,
  setCustomTime,
  addTime,
}) {
  const [customInputTime, setCustomInputTime] = useState('');

  const handleCustomTimeSubmit = (e) => {
    e.preventDefault();

    const input = customInputTime.trim();
    let totalSeconds;

    if (input.includes(':')) {
      const parts = input.split(':');

      if (
        parts.length !== 2 ||
        !/^\d+$/.test(parts[0]) ||
        !/^\d+$/.test(parts[1])
      ) {
        totalSeconds = 0;
      } else {
        const mins = Number(parts[0]);
        const secs = Number(parts[1]);

        totalSeconds = secs < 60 ? mins * 60 + secs : 0;
      }
    } else {
      totalSeconds = /^\d+$/.test(input) ? Number(input) : 0;
    }

    if (totalSeconds > 0 && totalSeconds <= 3600) {
      setCustomTime(totalSeconds);
      setCustomInputTime('');
    } else {
      alert('Enter a valid time (e.g., 2:00 or 90 seconds). Maximum: 60 minutes.');
    }
  };

  return (
    <section className="timer-section">
      <div className="blob"></div>

      <div className="bg">
        <h2>Rest Timer</h2>

        <div id="timer-display">{formatTime(timeLeft)}</div>

        {isFinished && (
          <p className="timer-finished">
            Rest complete! Time for your next set.
          </p>
        )}

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

        <form
          onSubmit={handleCustomTimeSubmit}
          className="custom-timer-form"
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '22px',
            marginTop: '22px',
          }}
        >
          <input
            type="text"
            placeholder="Your Time (e.g. 2:00)"
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
          <button
            id="start-timer-btn"
            className="secondary-btn-1"
            onClick={startTimer}
          >
            Start
          </button>

          <button
            id="stop-timer-btn"
            className="secondary-btn"
            onClick={stopTimer}
          >
            Stop
          </button>

          <button
            id="reset-timer-btn"
            className="secondary-btn-3"
            onClick={resetTimer}
          >
            Reset
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => addTime(15)}
          >
            +15 sec
          </button>
        </div>
      </div>
    </section>
  );
}

export default RestTimer;
