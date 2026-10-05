import './style.css';
import { saveWorkout, getWorkouts, deleteWorkout, clearAllWorkouts, updateWorkout} from './storage.js';
import { renderWorkoutItem, renderAllWorkouts, updateTotalVolume} from './ui.js';
import { startTimer, stopTimer } from './timer.js';



// 1. Функция удаления
const handleDelete = (id, element) => {
  deleteWorkout(id);
  element.remove();

  updateTotalVolume(getWorkouts());
};



// 2. Функция дублирования 
const handleDuplicate = (workoutToDuplicate) => {
  const newWorkout = {
    id: Date.now().toString(),
    exercise: workoutToDuplicate.exercise,
    weight: workoutToDuplicate.weight,
    reps: workoutToDuplicate.reps,
    date: new Date().toISOString()
  };

  saveWorkout(newWorkout);
  renderWorkoutItem(newWorkout, handleDelete, handleDuplicate, handleEdit);

  updateTotalVolume(getWorkouts());
};




// Функция редактирования подхода
const handleEdit = (workoutToEdit, element) => {
    // 1.1 Запрашиваем новые вес и повторения с помощью prompt
  const newWeightInput = prompt('Enter new weight (kg):', workoutToEdit.weight);
  if (newWeightInput === null) return; // Пользователь отменил

  const newRepsInput = prompt('Enter new reps:', workoutToEdit.reps);
  if (newRepsInput === null) return; // Пользователь отменил

  const newWeight = Number(newWeightInput);
  const newReps = Number(newRepsInput);

  // 2.1 Валидация: проверяем, что введены положительные числа
  if (isNaN(newWeight) || isNaN(newReps) || newWeight <= 0 || newReps <= 0) {
    alert('Invalid input! Weight and reps must be numbers greater than 0.');
    return;
  }

  // 3.1 Создаем обновленный объект подхода
  const updatedWorkout = {
    ...workoutToEdit,
    weight: newWeight,
    reps: newReps
  };

  // 4.1 Обновляем хранилище
updateWorkout(updatedWorkout);

  // 5.1 Обновляем текст внутри DOM-элемента без перезагрузки всей страницы
  const infoContainer = element.querySelector('.workout-info');
  if (infoContainer) {
    infoContainer.innerHTML = `<strong>${updatedWorkout.exercise}</strong>: ${updatedWorkout.weight} kg × ${updatedWorkout.reps} reps`;
  }

  // 6.1 Пересчитываем общий объем
  updateTotalVolume(getWorkouts());
};






// 3. Загрузка подходов при старте (теперь handleDuplicate уже существует!)
const initialWorkouts = getWorkouts();
renderAllWorkouts(initialWorkouts, handleDelete, handleDuplicate, handleEdit);

// 4. Обработка формы добавления С ВАЛИДАЦИЕЙ
const form = document.getElementById('workout-form');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const exerciseInput = document.getElementById('exercise-name');
  const weightInput = document.getElementById('weight');
  const repsInput = document.getElementById('reps');

  const exerciseName = exerciseInput.value.trim();
  const weight = Number(weightInput.value);
  const reps = Number(repsInput.value);

  if (!exerciseName) {
    alert('Please enter a valid exercise name!');
    exerciseInput.focus();
    return;
  }

  if (weight <= 0 || reps <= 0) {
    alert('Weight and reps must be greater than 0!');
    return;
  }

  const newWorkout = {
    id: Date.now().toString(),
    exercise: exerciseName,
    weight: weight,
    reps: reps,
    date: new Date().toISOString()
  };

  saveWorkout(newWorkout);
  // Передаем handleDuplicate третьим аргументом и сюда тоже
  renderWorkoutItem(newWorkout, handleDelete, handleDuplicate, handleEdit);

  updateTotalVolume(getWorkouts());

  form.reset();
});





// --- ТАЙМЕР ---
const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer-btn');
const stopTimerBtn = document.getElementById('stop-timer-btn');
const presetBtns = document.querySelectorAll('.preset-btn');

let selectedTime = 90;

presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    presetBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    selectedTime = Number(btn.dataset.time);

    stopTimer();
    const mins = String(Math.floor(selectedTime / 60)).padStart(2, '0');
    const secs = String(selectedTime % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
  });
});

startTimerBtn.addEventListener('click', () => {
  startTimer(selectedTime, timerDisplay, () => {
    alert('Rest time is over! Time for the next set!');
  });
});

stopTimerBtn.addEventListener('click', () => {
  stopTimer();
});

const resetTimerBtn = document.getElementById('reset-timer-btn');
if (resetTimerBtn) {
  resetTimerBtn.addEventListener('click', () => {
    stopTimer();
    const mins = String(Math.floor(selectedTime / 60)).padStart(2, '0');
    const secs = String(selectedTime % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
  });
}




// --- СМЕНА ТЕМЫ ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  document.body.classList.add('light-theme');
  themeToggleBtn.textContent = '🌙 Dark';
}

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');

  const isLight = document.body.classList.contains('light-theme');

  if (isLight) {
    themeToggleBtn.textContent = '🌙 Dark';
    localStorage.setItem('theme', 'light');
  } else {
    themeToggleBtn.textContent = '☀️ Light';
    localStorage.setItem('theme', 'dark');
  }
});





// --- ФИЛЬТРАЦИЯ И ПОИСК ---
const searchInput = document.getElementById('search-input');

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const allWorkouts = getWorkouts();

    const filteredWorkouts = allWorkouts.filter(workout =>
      workout.exercise.toLowerCase().includes(query)
    );

    renderAllWorkouts(filteredWorkouts, handleDelete, handleDuplicate, handleEdit);
  });
}





// --- ОЧИСТКА ВСЕХ ПОДХОДОВ ---
const clearAllBtn = document.getElementById('clear-all-btn');

if (clearAllBtn) {
  clearAllBtn.addEventListener('click', () => {
    const workouts = getWorkouts();
    if (workouts.length === 0) {
      alert('Your workout list is already empty!');
      return;
    }

    if (confirm('Are you sure you want to clear all workouts for today?')) {
      clearAllWorkouts();
      renderAllWorkouts([], handleDelete, handleDuplicate, handleEdit);
    }
  });
}




// Функция проверки, совпадают ли две даты (без учета времени)
const isSameDate = (dateString, targetDate) => {
  const d1 = new Date(dateString);
  const d2 = new Date(targetDate);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Функция отображения подходов за конкретную дату
let selectedDate = new Date(); // По умолчанию — сегодня

const filterWorkoutsByDate = (targetDate) => {
  selectedDate = targetDate;
  const allWorkouts = getWorkouts();
  const filtered = allWorkouts.filter(w => isSameDay(w.date, selectedDate));
  renderAllWorkouts(filtered, handleDelete, handleDuplicate, handleEdit);
};

// --- ОБРАБОТЧИКИ КНОПОК ДАТЫ ---
const todayBtn = document.getElementById('filter-today-btn');
const yesterdayBtn = document.getElementById('filter-yesterday-btn');
const customDateInput = document.getElementById('custom-date-input');

if (todayBtn && yesterdayBtn && customDateInput) {
  todayBtn.addEventListener('click', () => {
    todayBtn.classList.add('active');
    yesterdayBtn.classList.remove('active');
    customDateInput.value = '';
    filterWorkoutsByDate(new Date());
  });

  yesterdayBtn.addEventListener('click', () => {
    yesterdayBtn.classList.add('active');
    todayBtn.classList.remove('active');
    customDateInput.value = '';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    filterWorkoutsByDate(yesterday);
  });

  customDateInput.addEventListener('change', (e) => {
    if (!e.target.value) return;
    todayBtn.classList.remove('active');
    yesterdayBtn.classList.remove('active');
    filterWorkoutsByDate(new Date(e.target.value));
  });
}