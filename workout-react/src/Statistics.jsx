
function Statistics({ workouts = [] }) {
  const totalSets = workouts.length;

  const totalReps = workouts.reduce(
    (sum, workout) => sum + (Number(workout.reps) || 0),
    0
  );

  const totalVolume = workouts.reduce(
    (sum, workout) =>
      sum +
      (Number(workout.weight) || 0) *
        (Number(workout.reps) || 0),
    0
  );

  const trainingDays = new Set(
    workouts
      .filter((workout) => workout.date)
      .map((workout) => new Date(workout.date).toDateString())
  ).size;

  const exerciseCounts = workouts.reduce((counts, workout) => {
    const name = workout.exercise?.trim();

    if (name) {
      counts[name] = (counts[name] || 0) + 1;
    }

    return counts;
  }, {});

  const topExercises = Object.entries(exerciseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const today = new Date();
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    const count = workouts.filter((workout) => {
      if (!workout.date) return false;

      return (
        new Date(workout.date).toDateString() === date.toDateString()
      );
    }).length;

    return {
      label: date.toLocaleDateString('en', { weekday: 'short' }),
      count,
    };
  });

  const maxActivity = Math.max(
    1,
    ...lastSevenDays.map((day) => day.count)
  );

  return (
    <section className="statistics-section">
      <h2>Statistics Dashboard</h2>

      <div className="statistics-grid">
        <div className="stats-card">
          <span>Total Sets</span>
          <strong>{totalSets}</strong>
        </div>

        <div className="stats-card">
          <span>Training Days</span>
          <strong>{trainingDays}</strong>
        </div>

        <div className="stats-card">
          <span>Total Reps</span>
          <strong>{totalReps}</strong>
        </div>

        <div className="stats-card">
          <span>Total Volume</span>
          <strong>{totalVolume.toLocaleString()} kg</strong>
        </div>
      </div>

      <div className="statistics-panel">
        <h3>Last 7 Days</h3>

        <div className="activity-chart">
          {lastSevenDays.map((day) => (
            <div className="activity-column" key={day.label}>
              <span className="activity-count">{day.count}</span>

              <div className="activity-bar-wrapper">
                <div
                  className="activity-bar"
                  style={{
                    height: `${(day.count / maxActivity) * 100}%`,
                  }}
                />
              </div>

              <span className="activity-label">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="statistics-panel">
        <h3>Most Frequent Exercises</h3>

        {topExercises.length > 0 ? (
          <div className="top-exercises">
            {topExercises.map(([name, count]) => (
              <div className="stats-card" key={name}>
                <span>{name}</span>
                <strong>{count} sets</strong>
              </div>
            ))}
          </div>
        ) : (
          <p>No workout data yet. Start training!</p>
        )}
      </div>
    </section>
  );
}

export default Statistics;
