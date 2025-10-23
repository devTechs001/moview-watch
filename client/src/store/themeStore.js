import { create } from 'zustand'

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem('theme') || 'dark',
  primaryColor: localStorage.getItem('primaryColor') || '#3b82f6',
  accentColor: localStorage.getItem('accentColor') || '#64748b',

  themes: {
    light: {
      name: 'Light',
      primary: '#3b82f6',
      secondary: '#f1f5f9',
      accent: '#64748b',
      background: '#ffffff',
      foreground: '#1e293b',
    },
    dark: {
      name: 'Dark',
      primary: '#3b82f6',
      secondary: '#1e293b',
      accent: '#64748b',
      background: '#0f172a',
      foreground: '#f1f5f9',
    },
    blue: {
      name: 'Ocean Blue',
      primary: '#0ea5e9',
      secondary: '#e0f2fe',
      accent: '#0369a1',
      background: '#f8fafc',
      foreground: '#0f172a',
    },
    purple: {
      name: 'Royal Purple',
      primary: '#8b5cf6',
      secondary: '#faf5ff',
      accent: '#7c3aed',
      background: '#fefefe',
      foreground: '#1a1a1a',
    },
    green: {
      name: 'Nature Green',
      primary: '#10b981',
      secondary: '#ecfdf5',
      accent: '#059669',
      background: '#f9fafb',
      foreground: '#111827',
    },
    red: {
      name: 'Passion Red',
      primary: '#ef4444',
      secondary: '#fef2f2',
      accent: '#dc2626',
      background: '#fefefe',
      foreground: '#1f2937',
    },
    orange: {
      name: 'Sunset Orange',
      primary: '#f97316',
      secondary: '#fff7ed',
      accent: '#ea580c',
      background: '#fefefe',
      foreground: '#1f2937',
    },
    pink: {
      name: 'Cherry Blossom',
      primary: '#ec4899',
      secondary: '#fdf2f8',
      accent: '#db2777',
      background: '#fefefe',
      foreground: '#1f2937',
    },
    cyan: {
      name: 'Electric Cyan',
      primary: '#06b6d4',
      secondary: '#ecfeff',
      accent: '#0891b2',
      background: '#f8fafc',
      foreground: '#0f172a',
    },
    indigo: {
      name: 'Deep Indigo',
      primary: '#6366f1',
      secondary: '#eef2ff',
      accent: '#4f46e5',
      background: '#fefefe',
      foreground: '#1e293b',
    },
    teal: {
      name: 'Ocean Teal',
      primary: '#14b8a6',
      secondary: '#f0fdfa',
      accent: '#0d9488',
      background: '#f9fafb',
      foreground: '#111827',
    },
    tiktok: {
      name: 'TikTok',
      primary: '#fe2c55',
      secondary: '#000000',
      accent: '#25f4ee',
      background: '#010101',
      foreground: '#ffffff',
    },
    netflix: {
      name: 'Netflix',
      primary: '#e50914',
      secondary: '#141414',
      accent: '#b20710',
      background: '#000000',
      foreground: '#ffffff',
    },
    youtube: {
      name: 'YouTube',
      primary: '#ff0000',
      secondary: '#282828',
      accent: '#cc0000',
      background: '#0f0f0f',
      foreground: '#ffffff',
    },
    spotify: {
      name: 'Spotify',
      primary: '#1db954',
      secondary: '#191414',
      accent: '#1ed760',
      background: '#121212',
      foreground: '#ffffff',
    },
    instagram: {
      name: 'Instagram',
      primary: '#e1306c',
      secondary: '#fafafa',
      accent: '#833ab4',
      background: '#ffffff',
      foreground: '#262626',
    },
    twitter: {
      name: 'Twitter',
      primary: '#1da1f2',
      secondary: '#15202b',
      accent: '#1a8cd8',
      background: '#000000',
      foreground: '#ffffff',
    },
    discord: {
      name: 'Discord',
      primary: '#5865f2',
      secondary: '#2c2f33',
      accent: '#7289da',
      background: '#36393f',
      foreground: '#ffffff',
    },
    midnight: {
      name: 'Midnight',
      primary: '#6366f1',
      secondary: '#1a1b26',
      accent: '#7aa2f7',
      background: '#16161e',
      foreground: '#c0caf5',
    },
    sunset: {
      name: 'Sunset',
      primary: '#ff6b6b',
      secondary: '#ffe66d',
      accent: '#ff8787',
      background: '#2d132c',
      foreground: '#f7f7f7',
    },
    forest: {
      name: 'Forest',
      primary: '#52b788',
      secondary: '#2d6a4f',
      accent: '#74c69d',
      background: '#1b4332',
      foreground: '#d8f3dc',
    },
    ocean: {
      name: 'Ocean',
      primary: '#0077b6',
      secondary: '#023e8a',
      accent: '#00b4d8',
      background: '#03045e',
      foreground: '#caf0f8',
    },
    neon: {
      name: 'Neon',
      primary: '#ff006e',
      secondary: '#8338ec',
      accent: '#fb5607',
      background: '#000814',
      foreground: '#ffffff',
    },
    pastel: {
      name: 'Pastel',
      primary: '#ffadad',
      secondary: '#ffd6a5',
      accent: '#fdffb6',
      background: '#ffffff',
      foreground: '#2b2d42',
    },
    cyberpunk: {
      name: 'Cyberpunk',
      primary: '#ff00ff',
      secondary: '#00ffff',
      accent: '#ffff00',
      background: '#0a0e27',
      foreground: '#ffffff',
    },
    dracula: {
      name: 'Dracula',
      primary: '#bd93f9',
      secondary: '#44475a',
      accent: '#ff79c6',
      background: '#282a36',
      foreground: '#f8f8f2',
    },
    whatsapp: {
      name: 'WhatsApp',
      primary: '#25d366',
      secondary: '#075e54',
      accent: '#128c7e',
      background: '#0a1014',
      foreground: '#e9edef',
    },
    telegram: {
      name: 'Telegram',
      primary: '#0088cc',
      secondary: '#2aabee',
      accent: '#229ed9',
      background: '#17212b',
      foreground: '#ffffff',
    },
    snapchat: {
      name: 'Snapchat',
      primary: '#fffc00',
      secondary: '#000000',
      accent: '#ffffff',
      background: '#000000',
      foreground: '#ffffff',
    },
    linkedin: {
      name: 'LinkedIn',
      primary: '#0a66c2',
      secondary: '#f3f6f8',
      accent: '#0073b1',
      background: '#ffffff',
      foreground: '#000000',
    },
    reddit: {
      name: 'Reddit',
      primary: '#ff4500',
      secondary: '#1a1a1b',
      accent: '#ff5700',
      background: '#030303',
      foreground: '#d7dadc',
    },
    twitch: {
      name: 'Twitch',
      primary: '#9146ff',
      secondary: '#18181b',
      accent: '#772ce8',
      background: '#0e0e10',
      foreground: '#efeff1',
    },
    pinterest: {
      name: 'Pinterest',
      primary: '#e60023',
      secondary: '#efefef',
      accent: '#bd081c',
      background: '#ffffff',
      foreground: '#211922',
    },
    github: {
      name: 'GitHub',
      primary: '#238636',
      secondary: '#161b22',
      accent: '#58a6ff',
      background: '#0d1117',
      foreground: '#c9d1d9',
    },
  },

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', newTheme)

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Apply theme colors
    get().applyTheme(newTheme)

    return { theme: newTheme }
  }),

  setTheme: (themeId) => {
    console.log('🎨 setTheme called with:', themeId)
    
    try {
      const state = get()
      const themeData = state.themes[themeId]
      
      if (!themeData) {
        console.error('❌ Theme not found:', themeId)
        return
      }
      
      console.log('✅ Theme data:', themeData)
      
      // Save to localStorage
      localStorage.setItem('theme', themeId)
      console.log('💾 Saved to localStorage')

      // Determine if theme is dark based on background color
      const isDarkTheme = themeId === 'dark' || 
                         (themeData && parseInt(themeData.background.slice(1), 16) < 0x808080)

      console.log('🌓 Is dark theme:', isDarkTheme)

      if (isDarkTheme) {
        document.documentElement.classList.add('dark')
        console.log('🌙 Added dark class')
      } else {
        document.documentElement.classList.remove('dark')
        console.log('☀️ Removed dark class')
      }

      // Apply theme colors
      state.applyTheme(themeId)
      console.log('🎨 Applied theme colors')

      // Update state
      set({ theme: themeId })
      console.log('✅ Theme state updated to:', themeId)
    } catch (error) {
      console.error('❌ Error in setTheme:', error)
    }
  },

  setPrimaryColor: (color) => set((state) => {
    localStorage.setItem('primaryColor', color)
    get().applyColors(color, state.accentColor)
    return { primaryColor: color }
  }),

  setAccentColor: (color) => set((state) => {
    localStorage.setItem('accentColor', color)
    get().applyColors(state.primaryColor, color)
    return { accentColor: color }
  }),

  applyTheme: (themeId) => {
    console.log('🎨 applyTheme called with:', themeId)
    
    try {
      const theme = get().themes[themeId] || get().themes.dark
      const root = document.documentElement

      console.log('📦 Theme object:', theme)

      // Apply CSS custom properties with !important for immediate effect
      root.style.setProperty('--primary', theme.primary)
      root.style.setProperty('--primary-foreground', '#ffffff')
      root.style.setProperty('--secondary', theme.secondary)
      root.style.setProperty('--secondary-foreground', theme.foreground)
      root.style.setProperty('--accent', theme.accent)
      root.style.setProperty('--accent-foreground', theme.foreground)
      root.style.setProperty('--background', theme.background)
      root.style.setProperty('--foreground', theme.foreground)
      root.style.setProperty('--card', theme.secondary)
      root.style.setProperty('--card-foreground', theme.foreground)
      root.style.setProperty('--popover', theme.secondary)
      root.style.setProperty('--popover-foreground', theme.foreground)
      root.style.setProperty('--muted', theme.secondary)
      root.style.setProperty('--muted-foreground', theme.accent)
      
      // Apply border colors based on theme brightness
      const isDark = themeId === 'dark' || theme.background === '#0f172a' || parseInt(theme.background.slice(1), 16) < 0x808080
      root.style.setProperty('--border', isDark ? '#334155' : '#e2e8f0')
      root.style.setProperty('--input', isDark ? '#334155' : '#e2e8f0')
      root.style.setProperty('--ring', theme.primary)
      
      // Force immediate visual update by setting body background
      document.body.style.backgroundColor = theme.background
      document.body.style.color = theme.foreground
      
      // Trigger a reflow to ensure changes are applied immediately
      void root.offsetHeight
      
      console.log('✅ CSS variables applied')
      console.log('  --primary:', root.style.getPropertyValue('--primary'))
      console.log('  --background:', root.style.getPropertyValue('--background'))
    } catch (error) {
      console.error('❌ Error in applyTheme:', error)
    }
  },

  applyColors: (primary, accent) => {
    const root = document.documentElement
    root.style.setProperty('--primary', primary)
    root.style.setProperty('--accent', accent)
  },

  // Initialize theme on load
  init: () => {
    const theme = localStorage.getItem('theme') || 'dark'
    const primaryColor = localStorage.getItem('primaryColor')
    const accentColor = localStorage.getItem('accentColor')

    // Apply theme first
    get().setTheme(theme)
    
    // Only apply custom colors if they exist
    if (primaryColor && accentColor) {
      get().applyColors(primaryColor, accentColor)
    }
  }
}))

// Initialize theme on module load - but only if we're in the browser
if (typeof window !== 'undefined') {
  // Don't auto-initialize here to prevent conflicts with main.jsx
  // useThemeStore.getState().init()
}
