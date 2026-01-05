"use client"

import { useState, useEffect } from "react"

export function useTheme() {
  const [isDark, setIsDark] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (stored) {
      setIsDark(stored === "dark")
    } else {
      setIsDark(prefersDark)
    }
    setIsLoaded(true)
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!isLoaded) return

    const html = document.documentElement
    if (isDark) {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
    localStorage.setItem("theme", isDark ? "dark" : "light")
  }, [isDark, isLoaded])

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  return { isDark, toggleTheme, isLoaded }
}
