import { useState, useEffect } from 'react'

export function useLanguage() {
  const [language, setLanguage] = useState<"en" | "fr">("fr")

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem("language") as "en" | "fr"
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (lang: "en" | "fr") => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  return {
    language,
    setLanguage: changeLanguage,
  }
} 