import { useEffect, useState } from 'react'
import { useThemeStore } from '../store/themeStore'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'

const ThemeDebugPage = () => {
  const { theme, themes, setTheme, toggleTheme } = useThemeStore()
  const [cssVars, setCssVars] = useState({})
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  const refreshCSSVars = () => {
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)
    
    setCssVars({
      primary: computedStyle.getPropertyValue('--primary') || root.style.getPropertyValue('--primary'),
      secondary: computedStyle.getPropertyValue('--secondary') || root.style.getPropertyValue('--secondary'),
      background: computedStyle.getPropertyValue('--background') || root.style.getPropertyValue('--background'),
      foreground: computedStyle.getPropertyValue('--foreground') || root.style.getPropertyValue('--foreground'),
      accent: computedStyle.getPropertyValue('--accent') || root.style.getPropertyValue('--accent'),
    })
  }

  useEffect(() => {
    refreshCSSVars()
    addLog(`Component mounted. Current theme: ${theme}`)
  }, [])

  useEffect(() => {
    addLog(`Theme changed to: ${theme}`)
    refreshCSSVars()
  }, [theme])

  const testThemeChange = (themeId) => {
    addLog(`Testing theme change to: ${themeId}`)
    try {
      setTheme(themeId)
      addLog(`✅ setTheme(${themeId}) called successfully`)
      setTimeout(refreshCSSVars, 100)
    } catch (error) {
      addLog(`❌ Error: ${error.message}`)
    }
  }

  const testToggle = () => {
    addLog('Testing toggleTheme()')
    try {
      toggleTheme()
      addLog('✅ toggleTheme() called successfully')
      setTimeout(refreshCSSVars, 100)
    } catch (error) {
      addLog(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold mb-8">🔍 Theme System Debug</h1>

        {/* Current State */}
        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Current Theme:</strong> {theme}</p>
              <p><strong>Theme Name:</strong> {themes[theme]?.name}</p>
              <p><strong>Dark Class:</strong> {document.documentElement.classList.contains('dark') ? 'Yes' : 'No'}</p>
              <p><strong>localStorage.theme:</strong> {localStorage.getItem('theme')}</p>
            </div>
          </CardContent>
        </Card>

        {/* CSS Variables */}
        <Card>
          <CardHeader>
            <CardTitle>CSS Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshCSSVars} className="mb-4">Refresh CSS Vars</Button>
            <div className="space-y-2 font-mono text-sm">
              {Object.entries(cssVars).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="w-32">--{key}:</span>
                  <span className="flex-1">{value || 'not set'}</span>
                  {value && (
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: value }}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={testToggle}>Toggle Theme</Button>
              <Button onClick={() => testThemeChange('light')}>Set Light</Button>
              <Button onClick={() => testThemeChange('dark')}>Set Dark</Button>
              <Button onClick={() => testThemeChange('netflix')}>Set Netflix</Button>
              <Button onClick={() => testThemeChange('cyberpunk')}>Set Cyberpunk</Button>
              <Button onClick={() => testThemeChange('ocean')}>Set Ocean</Button>
            </div>
          </CardContent>
        </Card>

        {/* All Themes Grid */}
        <Card>
          <CardHeader>
            <CardTitle>All Available Themes ({Object.keys(themes).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {Object.entries(themes).map(([id, themeData]) => (
                <button
                  key={id}
                  onClick={() => testThemeChange(id)}
                  className={`p-3 rounded border-2 transition-all hover:scale-105 ${
                    theme === id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">{themeData.name}</div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: themeData.primary }} />
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: themeData.background }} />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLogs([])} variant="outline" className="mb-4">Clear Logs</Button>
            <div className="bg-secondary/50 p-4 rounded max-h-64 overflow-y-auto font-mono text-xs space-y-1">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">No logs yet...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Visual Test */}
        <Card>
          <CardHeader>
            <CardTitle>Visual Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="p-4 bg-primary text-primary-foreground rounded">Primary Background</div>
              <div className="p-4 bg-secondary text-secondary-foreground rounded">Secondary Background</div>
              <div className="p-4 bg-accent text-accent-foreground rounded">Accent Background</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ThemeDebugPage
