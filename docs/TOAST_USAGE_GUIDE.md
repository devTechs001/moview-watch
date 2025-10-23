# 🍞 Toast Notifications - Usage Guide

## react-hot-toast Methods

### ✅ Available Methods

```javascript
import toast from 'react-hot-toast'

// Success
toast.success('Operation successful!')

// Error
toast.error('Something went wrong!')

// Loading
toast.loading('Processing...')

// Default/Info (use toast() with icon)
toast('Information message', { icon: 'ℹ️' })

// Custom
toast.custom((t) => (
  <div>Custom content</div>
))
```

### ❌ NOT Available

```javascript
// ❌ WRONG - toast.info does NOT exist
toast.info('This will cause an error')

// ✅ CORRECT - Use toast() with icon instead
toast('This is the correct way', { icon: 'ℹ️' })
```

## Common Usage Patterns

### Success Messages
```javascript
toast.success('Post created!')
toast.success('Payment successful!')
toast.success('Settings saved!')
```

### Error Messages
```javascript
toast.error('Failed to load data')
toast.error('Invalid credentials')
toast.error('Network error')
```

### Info Messages
```javascript
// Use toast() with custom icon
toast('Feature coming soon!', { icon: '📷' })
toast('Select a movie to watch', { icon: 'ℹ️' })
toast('Post options coming soon!', { icon: '⚙️' })
```

### Loading States
```javascript
const loadingToast = toast.loading('Uploading...')

// Later, update it
toast.success('Upload complete!', { id: loadingToast })
// or
toast.error('Upload failed', { id: loadingToast })
```

### Custom Icons
```javascript
toast('Photo upload coming soon!', { icon: '📷' })
toast('Video upload coming soon!', { icon: '🎥' })
toast('PayPal payment available soon', { icon: '💳' })
toast('Processing payment', { icon: '💰' })
toast('Razorpay for India', { icon: '🇮🇳' })
toast('Global payment', { icon: '🌍' })
```

## Configuration Options

### Duration
```javascript
toast.success('Quick message', { duration: 2000 }) // 2 seconds
toast.error('Important error', { duration: 5000 }) // 5 seconds
```

### Position
```javascript
toast('Top center', { position: 'top-center' })
toast('Bottom right', { position: 'bottom-right' })
```

### Custom Styling
```javascript
toast.success('Styled message', {
  style: {
    background: '#333',
    color: '#fff',
  },
})
```

### With Icon
```javascript
toast('Custom icon', {
  icon: '👏',
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
  },
})
```

## Fixed Files

### EnhancedSocialFeed.jsx
```javascript
// Before (❌ Error)
onClick={() => toast.info('Photo upload coming soon!')}

// After (✅ Fixed)
onClick={() => toast('Photo upload coming soon!', { icon: '📷' })}
```

### HomePage.jsx
```javascript
// Before (❌ Error)
toast.info('Select a movie to watch')

// After (✅ Fixed)
toast('Select a movie to watch', { icon: 'ℹ️' })
```

### SubscriptionCheckout.jsx
```javascript
// Before (❌ Error)
toast.info('PayPal payment will be available soon')

// After (✅ Fixed)
toast('PayPal payment will be available soon', { icon: '💳' })
```

## Best Practices

### 1. Use Appropriate Methods
```javascript
✅ toast.success() for successful operations
✅ toast.error() for errors
✅ toast.loading() for async operations
✅ toast() with icon for info messages
```

### 2. Keep Messages Short
```javascript
✅ toast.success('Saved!')
❌ toast.success('Your settings have been successfully saved to the database')
```

### 3. Use Icons for Context
```javascript
toast('Coming soon!', { icon: '🚀' })
toast('New feature!', { icon: '✨' })
toast('Warning!', { icon: '⚠️' })
```

### 4. Handle Async Operations
```javascript
const saveData = async () => {
  const toastId = toast.loading('Saving...')
  
  try {
    await api.save()
    toast.success('Saved!', { id: toastId })
  } catch (error) {
    toast.error('Failed to save', { id: toastId })
  }
}
```

## Common Icons

```javascript
// Actions
'✅' - Success
'❌' - Error
'ℹ️' - Info
'⚠️' - Warning
'⚙️' - Settings
'🔄' - Loading/Refresh

// Media
'📷' - Photo
'🎥' - Video
'🎵' - Audio
'📄' - Document

// Social
'❤️' - Like
'💬' - Comment
'🔗' - Share
'👤' - User

// Payment
'💳' - Card
'💰' - Money
'🏦' - Bank
'🌍' - Global

// Status
'🚀' - Launch
'✨' - New
'🎉' - Celebration
'🔔' - Notification
```

## Global Configuration

In `App.jsx` or `main.jsx`:

```javascript
import { Toaster } from 'react-hot-toast'

<Toaster 
  position="top-right"
  toastOptions={{
    duration: 3000,
    style: {
      background: 'var(--card)',
      color: 'var(--card-foreground)',
      border: '1px solid var(--border)',
    },
    success: {
      duration: 3000,
      iconTheme: {
        primary: 'var(--primary)',
        secondary: '#fff',
      },
    },
    error: {
      duration: 4000,
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    },
  }}
/>
```

## Troubleshooting

### Error: toast.info is not a function
**Solution:** Use `toast()` with icon instead
```javascript
// ❌ Wrong
toast.info('Message')

// ✅ Correct
toast('Message', { icon: 'ℹ️' })
```

### Toast not showing
**Check:**
1. Toaster component is rendered
2. react-hot-toast is installed
3. No console errors

### Toast styling issues
**Solution:** Use CSS variables for theme compatibility
```javascript
toast.success('Message', {
  style: {
    background: 'var(--card)',
    color: 'var(--card-foreground)',
  },
})
```

## Summary

✅ Use `toast.success()` for success
✅ Use `toast.error()` for errors  
✅ Use `toast.loading()` for loading
✅ Use `toast()` with icon for info
❌ Never use `toast.info()` - it doesn't exist!

All toast errors are now fixed! 🎉
