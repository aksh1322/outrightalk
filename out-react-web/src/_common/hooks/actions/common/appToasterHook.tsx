import { toast } from 'react-toastify'

export function useToaster() {
  const show = (message: string) => {
    toast(message)
  }
  const error = (message: string) => {
    toast.error(message)
  }
  const success = (message: string) => {
    toast.success(message)
  }
  const warning = (message: string) => {
    toast.warning(message)
  }
  return { error, show, success, warning }
}