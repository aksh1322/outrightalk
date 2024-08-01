import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { StateExtended } from '../../interfaces/StateExtended'


export function useAppAmountSelector() {
  const amount = useSelector((state: StateExtended) => state.amount)

  return amount
} 