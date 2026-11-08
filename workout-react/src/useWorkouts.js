import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export function useWorkouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  // логику загрузки внутрь useEffect, чтобы линтер не ругался
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .order('id', { ascending: false })

        if (error) throw error
        setWorkouts(data || [])
      } catch (err) {
        console.error('Ошибка при получении тренировок:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [])

  // 2. Добавление тренировки
  const addWorkout = async (newWorkout) => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert([newWorkout])
        .select()

      if (error) throw error
      if (data) {
        setWorkouts((prev) => [data[0], ...prev])
      }
    } catch (err) {
      console.error('Ошибка при добавлении тренировки:', err.message)
    }
  }

  // 3. Обновление (редактирование) тренировки
  const updateWorkout = async (id, updatedFields) => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .update(updatedFields)
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        setWorkouts((prev) =>
          prev.map((item) => (item.id === id ? data[0] : item))
        )
      }
    } catch (err) {
      console.error('Ошибка при обновлении тренировки:', err.message)
    }
  }

  // 4. Удаление тренировки
  const deleteWorkout = async (id) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)

      if (error) throw error
      setWorkouts((prev) => prev.filter((w) => w.id !== id))
    } catch (err) {
      console.error('Ошибка при удалении тренировки:', err.message)
    }
  }

  // 5. Очистка всех тренировок
  const clearAllWorkouts = async () => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .neq('id', 0) // Удаляет все записи

      if (error) throw error
      setWorkouts([])
    } catch (err) {
      console.error('Ошибка при очистке базы данных:', err.message)
    }
  }

  return { 
    workouts, 
    loading, 
    addWorkout, 
    updateWorkout, 
    deleteWorkout, 
    clearAllWorkouts 
  }
}