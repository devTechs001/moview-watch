import { useState } from 'react'
import { Bell, Lock, User, Palette, Globe, Shield } from 'lucide-react'
import Navbar from '../components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import * as Switch from '@radix-ui/react-switch'
import { useThemeStore } from '../store/themeStore'

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newReleases: true,
    recommendations: false,
    autoplay: true,
    quality: 'auto',
    language: 'en',
  })

  const handleToggle = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        {/* Account Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input type="email" defaultValue="user@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input type="tel" placeholder="+1 (555) 000-0000" />
            </div>
            <Button>Update Account</Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button>Change Password</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch.Root
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
                className="w-11 h-6 bg-secondary rounded-full relative data-[state=checked]:bg-primary transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <Switch.Root
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle('pushNotifications')}
                className="w-11 h-6 bg-secondary rounded-full relative data-[state=checked]:bg-primary transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">New Releases</h4>
                <p className="text-sm text-muted-foreground">Get notified about new movies</p>
              </div>
              <Switch.Root
                checked={settings.newReleases}
                onCheckedChange={() => handleToggle('newReleases')}
                className="w-11 h-6 bg-secondary rounded-full relative data-[state=checked]:bg-primary transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Recommendations</h4>
                <p className="text-sm text-muted-foreground">Personalized movie suggestions</p>
              </div>
              <Switch.Root
                checked={settings.recommendations}
                onCheckedChange={() => handleToggle('recommendations')}
                className="w-11 h-6 bg-secondary rounded-full relative data-[state=checked]:bg-primary transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-3">Theme</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    console.log('☀️ Light theme button clicked')
                    setTheme('light')
                  }}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    theme === 'light'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="w-full h-20 bg-white rounded mb-2 flex items-center justify-center">
                    <div className="text-2xl">☀️</div>
                  </div>
                  <p className="font-medium text-center">Light</p>
                </button>
                <button
                  onClick={() => {
                    console.log('🌙 Dark theme button clicked')
                    setTheme('dark')
                  }}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="w-full h-20 bg-gray-900 rounded mb-2 flex items-center justify-center">
                    <div className="text-2xl">🌙</div>
                  </div>
                  <p className="font-medium text-center">Dark</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Playback */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Playback
            </CardTitle>
            <CardDescription>Configure video playback settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Autoplay</h4>
                <p className="text-sm text-muted-foreground">Automatically play next episode</p>
              </div>
              <Switch.Root
                checked={settings.autoplay}
                onCheckedChange={() => handleToggle('autoplay')}
                className="w-11 h-6 bg-secondary rounded-full relative data-[state=checked]:bg-primary transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Video Quality</label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="auto">Auto</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>Manage your privacy settings and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">Download Your Data</Button>
            <Button variant="destructive" className="w-full">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
