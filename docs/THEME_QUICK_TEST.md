# 🚀 Theme System - Quick Test Guide

## Step 1: Start the App
```bash
cd client
npm run dev
```

## Step 2: Open Debug Page
Navigate to: **`http://localhost:5173/theme-debug`**

## Step 3: Open Browser Console
Press **F12** or **Ctrl+Shift+I**

## Step 4: Click Any Theme Button
You should see logs like:
```
🖱️ handleThemeChange clicked: netflix
🎨 setTheme called with: netflix
✅ Theme data: {name: "Netflix", ...}
💾 Saved to localStorage
🌙 Added dark class
🎨 Applied theme colors
✅ Theme state updated to: netflix
```

## ✅ If You See Logs = Working!
The theme system is functioning. Colors should change immediately.

## ❌ If No Logs = Problem!
Check:
1. Any JavaScript errors in console?
2. Is the page fully loaded?
3. Try clicking different buttons
4. Try refreshing the page

## Quick Console Tests

### Test 1: Check Store
```javascript
useThemeStore.getState().theme
```
Should show current theme name (e.g., "dark", "netflix")

### Test 2: Manual Theme Change
```javascript
useThemeStore.getState().setTheme('netflix')
```
Should change theme to Netflix and show logs

### Test 3: Check CSS Variables
```javascript
getComputedStyle(document.documentElement).getPropertyValue('--primary')
```
Should show a color value (e.g., "#e50914")

### Test 4: Check localStorage
```javascript
localStorage.getItem('theme')
```
Should show current theme name

## Other Pages to Test

1. **`/theme`** - Full theme selector with 40+ themes
2. **`/settings`** - Light/Dark toggle
3. **Navbar** - Sun/moon icon toggle

## Common Issues

### Issue: "Cannot read property 'setTheme'"
**Solution**: Store not initialized. Refresh page.

### Issue: Colors don't change but logs appear
**Solution**: CSS variables not applying. Check:
```javascript
document.documentElement.style.getPropertyValue('--primary')
```

### Issue: Theme resets on refresh
**Solution**: localStorage not working. Check browser settings.

## Emergency Reset

If everything is broken:
```javascript
localStorage.clear()
location.reload()
```

## Need More Help?
See **`THEME_DEBUG_GUIDE.md`** for detailed troubleshooting.

---

## Expected Behavior

✅ Click theme → See console logs → Colors change immediately → Theme persists after refresh

That's it! If this works, your theme system is fully functional.
