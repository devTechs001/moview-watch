import { useState, useEffect } from 'react'
import { Palette, Sun, Moon, Monitor, Star, Heart, Zap, Gem, Sparkles, Cloud, Leaf, Flame, Film, MessageCircle, Send, Briefcase, MessageSquare, Tv, Image, Code } from 'lucide-react'
import Layout from '../../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useThemeStore } from '../../store/themeStore'
import toast from 'react-hot-toast'

const EnhancedThemeSelector = () => {
  const { theme, themes, setTheme, setPrimaryColor, setAccentColor } = useThemeStore()
  const [selectedColor, setSelectedColor] = useState(themes[theme]?.primary || '#3b82f6')

  // Monitor theme changes
  useEffect(() => {
    console.log('📊 Theme state changed to:', theme)
    console.log('📊 Theme data:', themes[theme])
  }, [theme, themes])

  const themeOptions = Object.entries(themes).map(([id, themeData]) => ({
    id,
    ...themeData,
    icon: getThemeIcon(id),
  }))

  function getThemeIcon(themeId) {
    const icons = {
      light: Sun,
      dark: Moon,
      system: Monitor,
      blue: Palette,
      purple: Gem,
      green: Leaf,
      red: Flame,
      orange: Sun,
      pink: Heart,
      cyan: Zap,
      indigo: Star,
      teal: Cloud,
      tiktok: Sparkles,
      netflix: Film,
      youtube: Film,
      spotify: Zap,
      instagram: Heart,
      twitter: Zap,
      discord: Zap,
      midnight: Moon,
      sunset: Sun,
      forest: Leaf,
      ocean: Cloud,
      neon: Zap,
      pastel: Sparkles,
      cyberpunk: Zap,
      dracula: Moon,
      whatsapp: MessageCircle,
      telegram: Send,
      snapchat: Zap,
      linkedin: Briefcase,
      reddit: MessageSquare,
      twitch: Tv,
      pinterest: Image,
      github: Code,
    }
    return icons[themeId] || Palette
  }

  const colorOptions = [
    '#3b82f6', '#ef4444', '#10b981', '#f97316',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#f59e0b', '#6366f1', '#14b8a6', '#64748b'
  ]

  const accentColors = [
    '#64748b', '#6b7280', '#374151', '#1f2937',
    '#0f172a', '#1e293b', '#334155', '#475569',
    '#94a3b8', '#cbd5e1', '#f1f5f9', '#e2e8f0'
  ]

  const handleThemeChange = (themeId) => {
    console.log('🖱️ handleThemeChange clicked:', themeId)
    console.log('Current theme before change:', theme)
    
    try {
      setTheme(themeId)
      console.log('✅ setTheme called successfully')
      toast.success(`Theme changed to ${themes[themeId]?.name}`)
    } catch (error) {
      console.error('❌ Error in handleThemeChange:', error)
      toast.error('Failed to change theme')
    }
  }

  const handlePrimaryColorChange = (color) => {
    console.log('🎨 handlePrimaryColorChange clicked:', color)
    
    try {
      setPrimaryColor(color)
      setSelectedColor(color)
      toast.success(`Primary color: ${color}`)
    } catch (error) {
      console.error('❌ Error in handlePrimaryColorChange:', error)
      toast.error('Failed to change primary color')
    }
  }

  const handleAccentColorChange = (color) => {
    console.log('🎨 handleAccentColorChange clicked:', color)
    
    try {
      setAccentColor(color)
      toast.success(`Accent color: ${color}`)
    } catch (error) {
      console.error('❌ Error in handleAccentColorChange:', error)
      toast.error('Failed to change accent color')
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Theme Settings</h1>
          <p className="text-muted-foreground">Customize your visual experience with our beautiful themes.</p>
        </div>

        {/* Current Theme Display */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Current Theme: {themes[theme]?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-lg border-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}></div>
              <div>
                <p className="font-medium">{themes[theme]?.name}</p>
                <p className="text-sm text-muted-foreground">Primary: {themes[theme]?.primary}</p>
                <p className="text-sm text-muted-foreground">Accent: {themes[theme]?.accent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {themeOptions.map((themeOption) => (
            <Card
              key={themeOption.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                theme === themeOption.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleThemeChange(themeOption.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg ${themeOption.id === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-gray-900'} flex items-center justify-center`}>
                    <themeOption.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{themeOption.name}</h3>
                    <p className="text-sm text-muted-foreground">{themeOption.description}</p>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="flex gap-2 mb-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: themeOption.primary }}
                  ></div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: themeOption.secondary }}
                  ></div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: themeOption.accent }}
                  ></div>
                </div>

                <Button
                  variant={theme === themeOption.id ? 'default' : 'outline'}
                  className="w-full"
                >
                  {theme === themeOption.id ? 'Active' : 'Select'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Color Customization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Primary Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {colorOptions.map((color) => (
                  <button
                    key={`primary-${color}`}
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                      selectedColor === color ? 'border-primary ring-2 ring-primary/20' : 'border-white'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handlePrimaryColorChange(color)}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Selected: {selectedColor}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accent Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {accentColors.map((color) => (
                  <button
                    key={`accent-${color}`}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleAccentColorChange(color)}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Current accent color</p>
            </CardContent>
          </Card>
        </div>

        {/* Theme Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button>Primary Button</Button>
                <Button variant="outline">Secondary Button</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-4 bg-primary/10 rounded"></div>
                  <div className="w-3/4 h-4 bg-secondary rounded"></div>
                  <div className="w-1/2 h-4 bg-accent/20 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-8 bg-primary/20 rounded border"></div>
                  <div className="w-3/4 h-8 bg-secondary/50 rounded border"></div>
                  <div className="w-1/2 h-8 bg-accent/10 rounded border"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default EnhancedThemeSelector
