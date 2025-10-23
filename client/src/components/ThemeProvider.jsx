import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'

export function ThemeProvider({ children }) {
  const { theme, init } = useThemeStore()

  useEffect(() => {
    // Ensure theme is initialized
    init()
  }, [])

  useEffect(() => {
    // Apply theme whenever it changes
    const root = document.documentElement
    
    // Ensure the theme class is applied
    if (theme === 'dark' || useThemeStore.getState().themes[theme]?.background?.startsWith('#0') || 
        (useThemeStore.getState().themes[theme]?.background && 
         parseInt(useThemeStore.getState().themes[theme].background.slice(1), 16) < 0x808080)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return <>{children}</>
}

export default ThemeProvider
