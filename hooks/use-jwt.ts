import { useMemo } from "react"

export function useJwt(token?: string) {
  return useMemo(() => {
    if (!token) return null
    try {
      return JSON.parse(atob(token.split(".")[1]))
    } catch {
      return null
    }
  }, [token])
} 