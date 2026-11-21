
import { useState } from 'react'

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

function TrainingPlanner({
  plans = [],
  loading,
  savePlan,
  deletePlan,
  onSelectExercise,
}) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [title, setTitle] = useState('')
  const [exercises, setExercises] = useState([])
  const [exerciseName, setExerciseName] = useState('')
  const [weight, setWeight] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const currentPlan = plans.find(
    (plan) => plan.day_of_week === selectedDay
  )

  const loadSelectedPlan = (day) => {
    setSelectedDay(day)

    const plan = plans.find(
      (item) => item.day_of_week === day
    )

    setTitle(plan?.title || '')
    setExercises(plan?.exercises || [])
    setMessage('')
  }

  const addExercise = () => {
    if (!exerciseName.trim()) {
      setMessage('Enter an exercise name.')
      return
    }

    if (
      !Number.isInteger(Number(sets)) ||
      !Number.isInteger(Number(reps)) ||
      Number(sets) < 1 ||
      Number(reps) < 1 ||
      (weight !== '' &&
        (!Number.isFinite(Number(weight)) || Number(weight) < 0))
    ) {
      setMessage('Enter valid sets, reps and weight.')
      return
    }

    setExercises((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        name: exerciseName.trim(),
        weight: weight === '' ? '' : Number(weight),
        sets: Number(sets),
        reps: Number(reps),
      },
    ])

    setExerciseName('')
    setWeight('')
    setMessage('')
  }

  const removeExercise = (id) => {
    setExercises((previous) =>
      previous.filter((exercise) => exercise.id !== id)
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    const result = await savePlan(
      selectedDay,
      title.trim(),
      exercises
    )

    setSaving(false)

    if (result.success) {
      setMessage('Plan saved successfully!')
    } else {
      setMessage(result.error || 'Could not save the plan.')
    }
  }

  const handleDelete = async () => {
    if (!currentPlan) return

    if (!window.confirm('Delete this training plan?')) return

    const result = await deletePlan(currentPlan.id)

    if (result.success) {
      setTitle('')
      setExercises([])
      setMessage('Plan deleted.')
    } else {
      setMessage(result.error || 'Could not delete the plan.')
    }
  }

  return (
    <section className="planner-section">
      <h2>Training Planner</h2>

      {loading ? (
        <p>Loading plans...</p>
      ) : (
        <>
          <div className="planner-days">
            {DAYS.map((day, index) => (
              <button
                key={day}
                type="button"
                className={
                  selectedDay === index
                    ? 'planner-day active'
                    : 'planner-day'
                }
                onClick={() => loadSelectedPlan(index)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          <div className="planner-panel">
            <h3>{DAYS[selectedDay]}</h3>

            <label htmlFor="plan-title">Workout name</label>
            <input
              id="plan-title"
              type="text"
              placeholder="e.g. Chest and Triceps"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <h3>Exercises</h3>

            <div className="planner-exercise-form">
              <input
                type="text"
                placeholder="Exercise name"
                value={exerciseName}
                onChange={(event) => setExerciseName(event.target.value)}
              />

              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />

              <input
                type="number"
                min="1"
                step="1"
                placeholder="Sets"
                value={sets}
                onChange={(event) => setSets(event.target.value)}
              />

              <input
                type="number"
                min="1"
                step="1"
                placeholder="Reps"
                value={reps}
                onChange={(event) => setReps(event.target.value)}
              />

              <button
                type="button"
                className="planner-add-btn"
                onClick={addExercise}
              >
                + Add Exercise
              </button>
            </div>

            <div className="planner-exercise-list">
              {exercises.length === 0 ? (
                <p>No exercises added yet.</p>
              ) : (
                exercises.map((exercise) => (
                  <div
                    className="planner-exercise"
                    key={exercise.id}
                  >
                    <div>
                      <strong>{exercise.name}</strong>
                      <p>
                        {exercise.sets} sets × {exercise.reps} reps
                        {exercise.weight !== '' &&
                          ` · ${exercise.weight} kg`}
                      </p>
                    <button
                         type="button"
                            onClick={() => onSelectExercise(exercise)}>Use in Log Exercise
                        </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      aria-label={`Remove ${exercise.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="planner-actions">
              <button
                type="button"
                className="planner-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Plan'}
              </button>

              {currentPlan && (
                <button
                  type="button"
                  className="planner-delete-btn"
                  onClick={handleDelete}
                >
                  Delete Plan
                </button>
              )}
            </div>

            {message && (
              <p className="planner-message" role="status">
                {message}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default TrainingPlanner
