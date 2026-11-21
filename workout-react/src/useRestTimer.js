
import { useState, useEffect, useRef } from 'react'

export function useRestTimer() {
  const [selectedPreset, setSelectedPreset] = useState(90)
  const [timeLeft, setTimeLeft] = useState(90)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const audioContextRef = useRef(null)

  const unlockAudio = async () => {
    try {
      if (!audioContextRef.current && window.AudioContext) {
        audioContextRef.current = new window.AudioContext()
      }

      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume()
      }
    } catch (error) {
      console.warn('Audio is unavailable:', error)
    }
  }

  const playCompletionSound = () => {
    const audioContext = audioContextRef.current

    if (!audioContext || audioContext.state !== 'running') return

    ;[0, 0.35].forEach((delay) => {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()

      oscillator.connect(gain)
      gain.connect(audioContext.destination)

      oscillator.frequency.value = 880
      gain.gain.setValueAtTime(0.2, audioContext.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + delay + 0.2
      )

      oscillator.start(audioContext.currentTime + delay)
      oscillator.stop(audioContext.currentTime + delay + 0.2)
    })
  }


useEffect(() => {
  if (!isRunning || timeLeft <= 0) return

  const timer = setTimeout(() => {
    if (timeLeft === 1) {
      setTimeLeft(0)
      setIsRunning(false)
      setIsFinished(true)
      playCompletionSound()
    } else {
      setTimeLeft((previous) => previous - 1)
    }
  }, 1000)

  return () => clearTimeout(timer)
}, [isRunning, timeLeft])


  const startTimer = async () => {
    await unlockAudio()

    if (timeLeft <= 0) {
      setTimeLeft(selectedPreset)
    }

    setIsFinished(false)
    setIsRunning(true)
  }

  const stopTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(selectedPreset)
    setIsFinished(false)
  }

  const handlePresetClick = (seconds) => {
    setSelectedPreset(seconds)
    setTimeLeft(seconds)
    setIsRunning(false)
    setIsFinished(false)
  }

  const setCustomTime = (seconds) => {
    setSelectedPreset(seconds)
    setTimeLeft(seconds)
    setIsRunning(false)
    setIsFinished(false)
  }

const addTime = (seconds = 15) => {
  setTimeLeft((previous) => previous + seconds)
  setIsFinished(false)
}

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return {
    selectedPreset,
    timeLeft,
    isRunning,
    isFinished,
    startTimer,
    stopTimer,
    resetTimer,
    handlePresetClick,
    setCustomTime,
    addTime,
    formatTime,
  }
}
