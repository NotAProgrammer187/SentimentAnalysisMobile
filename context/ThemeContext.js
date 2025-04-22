"use client"

import { createContext, useState, useContext } from "react"
import { useColorScheme } from "react-native"

const ThemeContext = createContext(undefined)

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme()
  const [isDarkMode, setIsDarkMode] = useState(deviceTheme === "dark")

  const lightColors = {
    background: "#f4f4f5",
    text: "#18181b",
    card: "#ffffff",
    border: "#e4e4e7",
    primary: "#6366f1",
    positive: "#22c55e",
    negative: "#ef4444",
    neutral: "#f59e0b",
  }

  const darkColors = {
    background: "#18181b",
    text: "#f4f4f5",
    card: "#27272a",
    border: "#3f3f46",
    primary: "#818cf8",
    positive: "#4ade80",
    negative: "#f87171",
    neutral: "#fbbf24",
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const colors = isDarkMode ? darkColors : lightColors

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

