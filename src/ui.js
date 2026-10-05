// 1. Отрисовка ОДНОЙ карточки подхода (теперь принимает onDuplicate)
export function renderWorkoutItem(workout, onDelete, onDuplicate, onEdit) {
  const list = document.getElementById('workout-list');
  if (!list) return;

  const li = document.createElement('li');
  li.className = 'workout-item';
  li.dataset.id = workout.id;

  // Обернули кнопки в общий блок .workout-actions
li.innerHTML = `
    <div class="workout-info">
      <strong>${workout.exercise}</strong>: ${workout.weight} kg × ${workout.reps} reps
    </div>
    <div class="workout-actions">
      <button class="edit-btn" title="Edit set">Edit</button>
      <button class="duplicate-btn" title="Duplicate set">+1 Set</button>
      <button class="delete-btn" title="Delete set">&times;</button>
    </div>
  `;

  // Обработчик удаления
  const deleteBtn = li.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    if (onDelete) {
      onDelete(workout.id, li);
    }
  });

  // Обработчик дублирования
  const duplicateBtn = li.querySelector('.duplicate-btn');
  if (onDuplicate) {
    duplicateBtn.addEventListener('click', () => {
      onDuplicate(workout);
    });
  }

  //  обработчик клика для кнопки "Edit"
  const editBtn = li.querySelector('.edit-btn');
  if (onEdit) {
    editBtn.addEventListener('click', () => {
      onEdit(workout, li);
    });
  }

  list.appendChild(li);
}

// 2. Отрисовка ВСЕГО списка подходов (передаем onDuplicate дальше)
export function renderAllWorkouts(workouts, onDelete, onDuplicate, onEdit) {
  const list = document.getElementById('workout-list');
  if (!list) return;

  list.innerHTML = '';
  workouts.forEach(workout => renderWorkoutItem(workout, onDelete, onDuplicate, onEdit));

  updateTotalVolume(workouts);
}


export function updateTotalVolume(workouts) {
  const totalVolumeEl = document.getElementById('total-volume');
  if (!totalVolumeEl) return;

  const total = workouts.reduce((sum, workout) => {
    return sum + (workout.weight *workout.reps);
  }, 0);

  totalVolumeEl.textContent = `${total.toLocaleString()} kg`;
}