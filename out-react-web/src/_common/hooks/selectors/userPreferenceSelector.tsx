import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { StateExtended } from '../../interfaces/StateExtended'

export function useAppUserPreferencesSelector() {
  const data = useSelector((state: StateExtended) => state.userPreferences.userPreferences)
  return data
}