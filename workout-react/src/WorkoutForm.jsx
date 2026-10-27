import { useState } from 'react';

function WorkoutForm({ onAddWorkout}) {

   const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    onAddWorkout(exercise, weight, reps);

    setExercise('');
    setWeight('');
    setReps('');
  };
  
    return (
   <section className="workout-form-section">
      <h2>Log Exercise</h2>
      <form id="workout-form" onSubmit={handleSubmit}>
        <input
          type="text"
          id="exercise-name"
          placeholder="Exercise (e.g. Bench Press)"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          required
        />
        <input
          type="number"
          id="weight"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
        />
        <input
          type="number"
          id="reps"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          required
        />
        <button type="submit">Add Set</button>
      </form>
    </section>
  );
}

export default WorkoutForm;
