import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { StateExtended } from '../../interfaces/StateExtended'

export function useAuthStatus() {
  const user = useSelector((state: StateExtended) => state.user)
  // const authChecker = () => (user && user.isAuthenticated && user.token && user.user)
  const authChecker = () => (user && user.isAuthenticated && user.user)
  const [isAuthenticated, setAuthenticated] = useState(authChecker())
  
  useEffect(() => {
    setAuthenticated(authChecker())
  }, [user])

  return isAuthenticated
}