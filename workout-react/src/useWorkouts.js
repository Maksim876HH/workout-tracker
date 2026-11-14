
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const STORAGE_KEY = 'workout-tracker-guest-workouts'

function getGuestWorkouts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Ошибка чтения гостевых тренировок:', error)
    return []
  }
}

function saveGuestWorkouts(workouts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
    return { success: true }
  } catch (error) {
    console.error('Ошибка сохранения гостевых тренировок:', error)
    return { success: false, error }
  }
}

function createError(message) {
  return { success: false, error: new Error(message) }
}

export function useWorkouts(userId = null) {
  const [workouts, setWorkouts] = useState([])
  const [loadedKey, setLoadedKey] = useState(null)

  const currentKey = userId ?? 'guest'
  const loading = loadedKey !== currentKey

  // Загрузка данных при переключении режима или аккаунта

useEffect(() => {
  let cancelled = false

  const fetchWorkouts = async () => {
    setWorkouts([])

    try {
      if (!userId) {
        const guestWorkouts = getGuestWorkouts()

        if (!cancelled) {
          setWorkouts(guestWorkouts)
        }
      } else {
        // Получаем гостевые тренировки
        const guestWorkouts = getGuestWorkouts()

        // Переносим их в аккаунт
        if (guestWorkouts.length > 0) {
          const workoutsToImport = guestWorkouts.map(
            ({ id, ...workout }) => ({
              ...workout,
              user_id: userId,
              client_id: String(id),
            })
          )

          const { error: importError } = await supabase
            .from('workouts')
            .upsert(workoutsToImport, {
              onConflict: 'user_id,client_id',
              ignoreDuplicates: true,
            })

          if (importError) {
            console.error(
              'Ошибка импорта гостевых тренировок:',
              importError
            )
          } else if (!cancelled) {
            // Удаляем только те гостевые записи,
            // которые были успешно импортированы
            const importedIds = new Set(
              guestWorkouts.map((workout) => String(workout.id))
            )

            const currentGuestWorkouts = getGuestWorkouts()

            const remainingWorkouts = currentGuestWorkouts.filter(
              (workout) => !importedIds.has(String(workout.id))
            )

            const saveResult = saveGuestWorkouts(remainingWorkouts)

            if (!saveResult.success) {
              console.error(
                'Не удалось очистить гостевые записи:',
                saveResult.error
              )
            }
          }
        }

        // Загружаем тренировки аккаунта
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', userId)
          .order('id', { ascending: false })

        if (error) throw error

        if (!cancelled) {
          setWorkouts(data || [])
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки тренировок:', error)
    } finally {
      if (!cancelled) {
        setLoadedKey(currentKey)
      }
    }
  }

  fetchWorkouts()

  return () => {
    cancelled = true
  }
}, [userId, currentKey])
  
  // Добавление тренировки
  const addWorkout = async (newWorkout) => {
    try {
      if (!userId) {
        const guestWorkouts = getGuestWorkouts()

        const workout = {
          ...newWorkout,
          id: crypto.randomUUID(),
        }

        const updated = [workout, ...guestWorkouts]
        const result = saveGuestWorkouts(updated)

        if (!result.success) return result

        setWorkouts(updated)
        return { success: true, data: workout }
      }

      const { data, error } = await supabase
        .from('workouts')
        .insert([{ ...newWorkout, user_id: userId }])
        .select()
        .single()

      if (error) throw error

      setWorkouts((prev) => [data, ...prev])
      return { success: true, data }
    } catch (error) {
      console.error('Ошибка добавления тренировки:', error)
      return { success: false, error }
    }
  }

  // Редактирование тренировки
  const updateWorkout = async (id, updatedFields) => {
    try {
      if (!userId) {
        const guestWorkouts = getGuestWorkouts()

        const updated = guestWorkouts.map((workout) =>
          workout.id === id
            ? { ...workout, ...updatedFields }
            : workout
        )

        const result = saveGuestWorkouts(updated)
        if (!result.success) return result

        setWorkouts(updated)
        return { success: true }
      }

      const { data, error } = await supabase
        .from('workouts')
        .update(updatedFields)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      setWorkouts((prev) =>
        prev.map((workout) => workout.id === id ? data : workout)
      )

      return { success: true, data }
    } catch (error) {
      console.error('Ошибка обновления тренировки:', error)
      return { success: false, error }
    }
  }

  // Удаление тренировки
  const deleteWorkout = async (id) => {
    try {
      if (!userId) {
        const updated = getGuestWorkouts().filter(
          (workout) => workout.id !== id
        )

        const result = saveGuestWorkouts(updated)
        if (!result.success) return result

        setWorkouts(updated)
        return { success: true }
      }

      const { data, error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()

      if (error) throw error
      if (!data?.length) {
        return createError('Тренировка не найдена или недоступна.')
      }

      setWorkouts((prev) => prev.filter((workout) => workout.id !== id))
      return { success: true }
    } catch (error) {
      console.error('Ошибка удаления тренировки:', error)
      return { success: false, error }
    }
  }

  // Очистка тренировок только текущего режима
  const clearAllWorkouts = async () => {
    try {
      if (!userId) {
        const result = saveGuestWorkouts([])
        if (!result.success) return result

        setWorkouts([])
        return { success: true }
      }

      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      setWorkouts([])
      return { success: true }
    } catch (error) {
      console.error('Ошибка очистки тренировок:', error)
      return { success: false, error }
    }
  }

  return {
    workouts: loading ? [] : workouts,
    loading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    clearAllWorkouts,
  }
}
