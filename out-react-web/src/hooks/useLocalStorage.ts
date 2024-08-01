import React, { useState, useEffect } from "react"

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): {
  state: T | undefined
  setState: React.Dispatch<React.SetStateAction<T>>
  clearState: () => void
} {
  const [state, setState] = useState<T>(() => {
    const value = localStorage.getItem(key)
    if (value) {
      return JSON.parse(value)
    } else return initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [state, key])

  const clearState = () => {
    localStorage.removeItem(key)
  }

  return { state, setState, clearState }
}
