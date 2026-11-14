import { useState, useEffect, useRef} from 'react';
import WorkoutCard from './WorkoutCard';
import './App.css';
import WorkoutForm from './WorkoutForm';
import RestTimer from './RestTimer';
import { useLocalStorage } from './useLocalStorage';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; 
import { format } from 'date-fns';
import { ChevronDownIcon, Calendar as CalendarIcon } from 'lucide-react';
import { useWorkouts } from './useWorkouts';
import { User, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import logoImage from './img/gantelya.png';






function App() {
  const [session, setSession] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)


const [authLoading, setAuthLoading] = useState(true)
const authEventReceived = useRef(false)

useEffect(() => {
  let mounted = true

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (mounted && !authEventReceived.current) {
      setSession(session)
      setAuthLoading(false)
    }
  })

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    authEventReceived.current = true
    setSession(session)
    setAuthLoading(false)
  })

  return () => {
    mounted = false
    subscription.unsubscribe()
  }
}, [])

  
  // --- 1. STATE (Состояние) ---
const {
  workouts,
  loading: workoutsLoading,
  addWorkout,
  updateWorkout,
  deleteWorkout,
  clearAllWorkouts,
} = useWorkouts(session?.user?.id ?? null)


const [theme, setTheme] = useLocalStorage('theme', 'dark');

  // Поиск и фильтр по дате ('today', 'yesterday', или 'YYYY-MM-DD')
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Таймер
  const [selectedPreset, setSelectedPreset] = useState(90);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isRunning, setIsRunning] = useState(false);

  // --- 2. ЭФФЕКТЫ (LocalStorage и Theme) ---
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Логика работы таймера
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRunning(false);
            alert('Rest time is over! Time for the next set!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // --- 3. ХЕНДЛЕРЫ И ФУНКЦИИ ---
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePresetClick = (seconds) => {
    setSelectedPreset(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
  };

  // Добавление нового подхода
  const handleAddWorkout = (exName, w, r) => {
  return addWorkout({
    exercise: exName,
    weight: w,
    reps: r,
    date: new Date().toISOString(),
  })
}

  // Дублирование (+1 Set)
const handleDuplicate = async (workoutToDuplicate) => {
  const result = await addWorkout({
    exercise: workoutToDuplicate.exercise,
    weight: workoutToDuplicate.weight,
    reps: workoutToDuplicate.reps,
    date: new Date().toISOString(),
  })

  if (!result.success) {
    alert(result.error?.message || 'Не удалось дублировать тренировку')
  }
}

// Редактирование
 const handleEdit = async (workoutToEdit) => {
  const newWeightInput = prompt('Enter new weight (kg):', workoutToEdit.weight)
  if (newWeightInput === null) return

  const newRepsInput = prompt('Enter new reps:', workoutToEdit.reps)
  if (newRepsInput === null) return

  const newWeight = Number(newWeightInput)
  const newReps = Number(newRepsInput)

  if (
    isNaN(newWeight) ||
    isNaN(newReps) ||
    newWeight <= 0 ||
    newReps <= 0
  ) {
    alert('Invalid input! Weight and reps must be numbers greater than 0.')
    return
  }

  const result = await updateWorkout(workoutToEdit.id, {
    weight: String(newWeight),
    reps: String(newReps),
  })

  if (!result.success) {
    alert(result.error?.message || 'Не удалось обновить тренировку')
  }
}

  // Удаление подхода
  const handleDelete = async (id) => {
  const result = await deleteWorkout(id)

  if (!result.success) {
    alert(result.error?.message || 'Не удалось удалить тренировку')
  }
}

  // Очистка всех подходов
const handleClearAll = async () => {
  if (workouts.length === 0) {
    alert('Your workout list is already empty!')
    return
  }

  if (confirm('Are you sure you want to clear all workouts for today?')) {
    const result = await clearAllWorkouts()

    if (!result.success) {
      alert(result.error?.message || 'Не удалось очистить список тренировок')
    }
  }
}

  // --- 4. ФИЛЬТРАЦИЯ ПО ДАТАМ И ПОИСКУ ---
  const isSameDay = (dateString, targetDate) => {
    const d1 = new Date(dateString);
    const d2 = new Date(targetDate);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const getFilteredWorkouts = () => {
    return workouts.filter((item) => {
      const matchesSearch = item.exercise
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      let matchesDate = true;
      const today = new Date();

      if (dateFilter === 'today') {
        matchesDate = isSameDay(item.date, today);
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = isSameDay(item.date, yesterday);
      } else if (dateFilter === 'custom' && customDate) {
        matchesDate = isSameDay(item.date, new Date(customDate));
      }

      return matchesSearch && matchesDate;
    });
  };

  const displayedWorkouts = getFilteredWorkouts();

  // Расчет общего объема
  const totalVolume = displayedWorkouts.reduce(
    (sum, w) => sum + w.weight * w.reps,
    0
  );

  if (authLoading || workoutsLoading) {
  return <div className="app-loading">Загрузка...</div>
}

  return (
    
  
    <div id="app">
      <header className="app-header">
        <div className="theme-toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  {/* кнопка входа/профиля */}
  {session ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '13px', background: 'var(--card-bg, #1e293b)', padding: '11px 17px', borderRadius: '16px', border: '1px solid var(--border-color, #334155)' }}>
      <User size={18} color="#3b82f6" />
      <button 
        onClick={() => supabase.auth.signOut()} 
        title="Sign Out"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', padding: 0 }}
      >
        <LogOut size={18} />
      </button>
    </div>
  ) : (
    <button
      onClick={() => setIsAuthModalOpen(true)}
      title="Sign In / Sign Up"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--card-bg, #1e293b)',
        color: 'var(--text-main, #f8fafc)',
        border: '1px solid var(--border-color, #334155)',
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <User size= {16} />
    </button>
  )}

  {/*переключатель темы */}
  <label className="switch" aria-label="Toggle theme">
    <input 
      type="checkbox" 
      checked={theme === 'dark'} 
      onChange={toggleTheme} 
    />
    <span className="slider"></span>
  </label>
</div>
<div className='logo-name' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
<img src={logoImage} alt="Workout Logo" className="app-logo" onClick={() => window.location.reload()} />
       <h1 className="app-title">
  <span style={{ color: '#ffffff' }}>Workout</span>{' '}
  <span style={{ color: '#22c55e' }}>Log</span>
</h1>
</div>
      </header>

      <RestTimer 
        timeLeft={timeLeft}
        isRunning={isRunning}
        selectedPreset={selectedPreset}
        formatTime={formatTime}
        handlePresetClick={handlePresetClick}
        setIsRunning={setIsRunning}
        setTimeLeft={setTimeLeft}
      />
      
      <WorkoutForm onAddWorkout={handleAddWorkout} />

     <section className="history-section">
        {/* Зеленый анимированный шар */}
        <div className="blob-container">
        <div className="blob"></div>
        </div>

        {/* Внутренний контейнер с контентом истории */}
        <div className="bg">
          <div className="history-header">
            <div className="header-top">
              <h2>Workout History</h2>
              <div className="volume-badge">
                <span>Volume:</span>
                <strong id="total-volume">{totalVolume.toLocaleString()} kg</strong>
              </div>
            </div>

            <div className="date-filter-container">
              <button
                id="filter-today-btn"
                className={`date-btn ${dateFilter === 'today' ? 'active' : ''}`}
                onClick={() => {
                  setDateFilter('today');
                  setCustomDate('');
                }}
              >
                Today
              </button>
              <button
                id="filter-yesterday-btn"
                className={`date-btn ${dateFilter === 'yesterday' ? 'active' : ''}`}
                onClick={() => {
                  setDateFilter('yesterday');
                  setCustomDate('');
                }}
              >
                Yesterday
              </button>

              <div style={{ position: 'relative', display: 'inline-block' }} ref={calendarRef}>
                <button
                  type="button"
                  className={`date-btn ${dateFilter === 'custom' ? 'active' : ''}`}
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <CalendarIcon size={15} />
                  <span>{customDate ? format(new Date(customDate), "PP") : "Pick a date"}</span>
                  <ChevronDownIcon size={15} />
                </button>

                {isCalendarOpen && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 'auto',
                    right: '0',
                    marginBottom: '8px', 
                    zIndex: 1000,
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '6px', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    color: 'var(--text-main)',
                    
                    '--rdp-cell-size': '28px',      
                    '--rdp-caption-font-size': '0.85rem', 
                    '--rdp-day-font-size': '0.8rem',      
                    fontSize: '0.8rem'
                  }}>
                    <DayPicker
                      mode="single"
                      selected={customDate ? new Date(customDate) : undefined}
                      onSelect={(day) => {
                        if (day) {
                          const formatted = format(day, "yyyy-MM-dd");
                          setCustomDate(formatted);
                          setDateFilter('custom');
                          setIsCalendarOpen(false); 
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="header-controls">
              <input
                type="text"
                id="search-input"
                className="search-input"
                placeholder="Search exercise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                id="clear-all-btn"
                className="clear-btn"
                title="Clear workouts"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
          </div>

          <ul id="workout-list">
            {displayedWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </div>
      </section>
      
      <Auth isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default App;