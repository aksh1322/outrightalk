import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { StateExtended } from '../../interfaces/StateExtended'

export function useAppRegistrationStepSelector() {
  const data = useSelector((state: StateExtended) => state.registration.regStep)
  return data
}

export function useAppRegistrationDataSelector() {
  const data = useSelector((state: StateExtended) => state.registration.registrationData)
  return data
}

export function useAppForgotPasswordSelector() {
  const data = useSelector((state: StateExtended) => state.registration.forgotPasswordStep)
  return data
}

export function useAppForgotPasswordDataSelector() {
  const data = useSelector((state: StateExtended) => state.registration.forgotPasswordData)
  return data
}