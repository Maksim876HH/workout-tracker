
import { useState } from 'react'

function WorkoutForm({ onAddWorkout, selectedExercise }) {
 const [exercise, setExercise] = useState(selectedExercise?.name || '')
const [weight, setWeight] = useState(
  selectedExercise?.weight === '' || selectedExercise?.weight == null
    ? ''
    : String(selectedExercise.weight)
)
const [reps, setReps] = useState(
  selectedExercise ? String(selectedExercise.reps) : ''
)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')



  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const result = await onAddWorkout(exercise, weight, reps)

      if (!result?.success) {
        throw new Error(result?.error?.message || 'Не удалось сохранить тренировку')
      }

      setExercise('')
      setWeight('')
      setReps('')
    } catch (err) {
      setError(err.message || 'Произошла ошибка при сохранении')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="workout-form-section">
      <div className="blob"></div>

      <div className="bg">
        <h2>Log Exercise</h2>

        <form id="workout-form" onSubmit={handleSubmit}>
          <input
            type="text"
            id="exercise-name"
            placeholder="Exercise (e.g. Bench Press)"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            required
            disabled={saving}
          />

          <input
            type="number"
            id="weight"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            disabled={saving}
          />

          <input
            type="number"
            id="reps"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
            disabled={saving}
          />

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Add Set'}
          </button>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}

export default WorkoutForm
