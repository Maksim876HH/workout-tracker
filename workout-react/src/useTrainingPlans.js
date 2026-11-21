
import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useTrainingPlans(userId) {
  const [planState, setPlanState] = useState({
    userId: null,
    plans: [],
  })
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState(null)

  // Не показываем планы предыдущего пользователя
  const plans = planState.userId === userId
    ? planState.plans
    : []

  const loadPlans = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .order('day_of_week')

    if (error) {
      setError(error.message)
    } else {
      setPlanState({
        userId,
        plans: data || [],
      })
    }

    setLoading(false)
  }, [userId])

  // Первоначальная загрузка
  useEffect(() => {
    if (!userId) return

    let active = true

    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .order('day_of_week')

      if (!active) return

      if (error) {
        setError(error.message)
      } else {
        setPlanState({
          userId,
          plans: data || [],
        })
      }

      setLoading(false)
    }

    fetchPlans()

    return () => {
      active = false
    }
  }, [userId])

  const savePlan = async (dayOfWeek, title, exercises) => {
    if (!userId) {
      return {
        success: false,
        error: 'Please sign in first.',
      }
    }

    const existingPlan = plans.find(
      (plan) => plan.day_of_week === dayOfWeek
    )

    const payload = {
      user_id: userId,
      day_of_week: dayOfWeek,
      title,
      exercises,
      updated_at: new Date().toISOString(),
    }

    let result

    if (existingPlan) {
      result = await supabase
        .from('training_plans')
        .update(payload)
        .eq('id', existingPlan.id)
    } else {
      result = await supabase
        .from('training_plans')
        .insert(payload)
    }

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      }
    }

    await loadPlans()
    return { success: true }
  }

  const deletePlan = async (id) => {
    const { error } = await supabase
      .from('training_plans')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    await loadPlans()
    return { success: true }
  }

  return {
    plans,
    loading,
    error,
    savePlan,
    deletePlan,
    reloadPlans: loadPlans,
  }
}
