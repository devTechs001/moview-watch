# 🧪 Social Features Testing Guide

## Quick Test Steps

### 1. Social Feed (`/social`)

#### Test Post Creation
```
1. Navigate to /social
2. Click in the "What's on your mind?" textarea
3. Type a test message
4. Click "Post" button
5. ✅ Post should appear at top of feed
6. ✅ Success toast should show
```

#### Test Like Button
```
1. Find any post in the feed
2. Click the "Like" button
3. ✅ Button should turn red
4. ✅ Heart icon should fill
5. ✅ Text should change to "Liked"
6. ✅ Like count should increase
7. Click again to unlike
8. ✅ Button returns to normal
```

#### Test Comments
```
1. Click "Comment" button on any post
2. ✅ Comment section should slide in
3. Type a comment in the input
4. Click send icon
5. ✅ Comment should appear immediately
6. ✅ Comment count should update
7. ✅ Success toast should show
```

#### Test Share
```
1. Click "Share" button on any post
2. ✅ Success toast should show
3. ✅ Share count should update
```

#### Test Photo/Video Buttons
```
1. Click "Photo" button
2. ✅ Info toast: "Photo upload coming soon!"
3. Click "Video" button
4. ✅ Info toast: "Video upload coming soon!"
```

### 2. Friends Page (`/friends`)

#### Test Friend Requests
```
1. Navigate to /friends
2. If you have requests, you'll see them at top
3. Click "Accept" on a request
4. ✅ Green button should have shadow effect
5. ✅ Success toast should show
6. ✅ Request should disappear
7. ✅ Friend should appear in friends list
```

#### Test Reject Request
```
1. Click "Reject" on a request
2. ✅ Button should turn red on hover
3. ✅ Success toast should show
4. ✅ Request should disappear
```

#### Test Friend Actions
```
1. Find a friend in the list
2. Hover over the card
3. ✅ Card should lift slightly
4. ✅ Border should change color
5. Click "View Profile"
6. ✅ Should navigate to profile page
7. Go back, click "Chat"
8. ✅ Should navigate to chat page
```

### 3. Visual Tests

#### Test Hover Effects
```
✅ Post cards lift on hover
✅ Buttons change color on hover
✅ Avatars show ring on hover
✅ Friend cards have border animation
✅ Action buttons scale slightly
```

#### Test Animations
```
✅ Comment section slides in smoothly
✅ Like button scales when clicked
✅ Cards have smooth transitions
✅ Loading spinner rotates
✅ Toast notifications slide in
```

#### Test Responsive Design
```
Desktop (1920px):
✅ Feed is centered, max-width 2xl
✅ Friends in 3-column grid
✅ All elements properly spaced

Tablet (768px):
✅ Friends in 2-column grid
✅ Feed still readable
✅ Buttons properly sized

Mobile (375px):
✅ Single column layout
✅ Touch targets large enough
✅ Text readable
✅ No horizontal scroll
```

### 4. Theme Tests

#### Test Light/Dark Mode
```
1. Toggle theme in navbar
2. ✅ All cards update colors
3. ✅ Text remains readable
4. ✅ Shadows adjust properly
5. ✅ Hover states work in both modes
```

#### Test Different Themes
```
1. Go to /theme
2. Select Netflix theme
3. ✅ Social feed updates colors
4. ✅ Buttons use theme colors
5. Try other themes
6. ✅ All work correctly
```

## 🐛 Common Issues & Fixes

### Issue: Buttons Don't Respond
**Check:**
- Console for JavaScript errors
- Network tab for failed API calls
- Authentication token is valid

**Fix:**
```javascript
// Check if onClick is properly bound
console.log('Button clicked')
```

### Issue: Posts Don't Load
**Check:**
- Server is running
- API endpoint is correct
- User is authenticated

**Fix:**
```javascript
// Check API response
const response = await axios.get('/posts')
console.log(response.data)
```

### Issue: Styles Not Applying
**Check:**
- Tailwind classes are correct
- CSS file is imported
- No conflicting styles

**Fix:**
```bash
# Rebuild Tailwind
npm run dev
```

### Issue: Real-time Updates Not Working
**Check:**
- Socket.io server is running
- WebSocket connection established
- Correct socket events

**Fix:**
```javascript
// Check socket connection
socket.on('connect', () => {
  console.log('Socket connected')
})
```

## ✅ Success Criteria

All features working when:
- ✅ Posts can be created
- ✅ Like button toggles
- ✅ Comments can be added
- ✅ Share button works
- ✅ Friend requests can be accepted/rejected
- ✅ Chat button navigates
- ✅ All hover effects work
- ✅ Animations are smooth
- ✅ Responsive on all devices
- ✅ Works in all themes
- ✅ No console errors
- ✅ Toast notifications show

## 📊 Performance Checks

### Load Times
```
✅ Initial page load < 2s
✅ Post creation < 500ms
✅ Like action < 200ms
✅ Comment addition < 500ms
✅ Navigation < 100ms
```

### Smooth Interactions
```
✅ 60fps animations
✅ No jank on scroll
✅ Instant button feedback
✅ Smooth transitions
```

## 🎯 Final Checklist

Before considering complete:
- [ ] All buttons respond to clicks
- [ ] All features are functional
- [ ] Styling is modern and consistent
- [ ] Responsive on mobile/tablet/desktop
- [ ] Works in light and dark mode
- [ ] No console errors
- [ ] Toast notifications work
- [ ] Loading states show
- [ ] Error handling works
- [ ] Real-time updates work

## 🚀 Ready to Use!

If all tests pass, your social features are:
- ✨ Fully functional
- 🎨 Beautifully styled
- 📱 Responsive
- ⚡ Performant
- 🌙 Theme-aware

Enjoy your enhanced social experience!
