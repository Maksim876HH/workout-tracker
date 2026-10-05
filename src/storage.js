const STORAGE_KEY = 'workout_logs';

export function getWorkouts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveWorkout(workout) {
    const workouts = getWorkouts();
    workouts.push(workout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}



// Функция удаления ОДНОГО подхода по его id
export function deleteWorkout(id) {
    const workouts = getWorkouts();

    const updateWorkouts = workouts.filter(workout => workout.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updateWorkouts));
}

export function clearAllWorkouts() {
    localStorage.removeItem(STORAGE_KEY);
}




// Обновление существующего подхода по его ID
export function updateWorkout(updatedWorkout) {
  const workouts = getWorkouts();
  const index = workouts.findIndex(w => w.id === updatedWorkout.id);

  if (index !== -1) {
    workouts[index] = updatedWorkout;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  }
}