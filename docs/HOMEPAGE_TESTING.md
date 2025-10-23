# 🧪 HomePage - Testing Guide

## Quick Test (2 minutes)

### 1. Hero Section Buttons
```
✅ Click "Watch Now" → Should navigate to /watch/featured
✅ Click "More Info" → Should navigate to /movie/featured
✅ Both buttons should have hover effects
✅ Toast notification if movie not available
```

### 2. Category Filters
```
✅ Click "Action" → Movies filter + toast shows
✅ Click "Comedy" → Movies filter + toast shows
✅ Click "All" → Shows all movies + toast
✅ Active category has primary color
✅ Smooth transitions between categories
```

### 3. View All Buttons
```
✅ Continue Watching "View All" → Navigate to /history
✅ Top Rated "View All" → Navigate to /movies + toast
✅ Trending "View All" → Navigate to /trending
✅ All buttons have hover effects
```

### 4. Movie Cards
```
✅ Click any movie card → Navigate to movie details
✅ Hover shows overlay with play button
✅ Like button works
✅ Bookmark button works
✅ Share button works
```

## Detailed Testing

### Hero Section

#### Test Watch Now Button
1. Open `/home`
2. Locate hero section at top
3. Click "Watch Now" button
4. **Expected**: Navigate to `/watch/featured`
5. **Verify**: URL changes, watch page loads

#### Test More Info Button
1. On hero section
2. Click "More Info" button
3. **Expected**: Navigate to `/movie/featured`
4. **Verify**: Movie details page opens

#### Test Featured Movie Data
1. Check hero section displays:
   - Movie title
   - Rating (with star icon)
   - Year
   - Genres
   - Duration
   - Description
2. **Expected**: All data visible and formatted

### Category Filtering

#### Test Each Category
```bash
For each category (All, Action, Comedy, Drama, Thriller, Sci-Fi, Horror):
1. Click category button
2. Verify:
   ✅ Button becomes active (primary color)
   ✅ Toast notification appears
   ✅ Movies grid updates
   ✅ Section title changes
```

#### Test Category Scroll (Mobile)
1. Resize browser to mobile width (< 768px)
2. Scroll categories horizontally
3. **Expected**: Smooth horizontal scroll
4. **Verify**: All categories accessible

### Section Navigation

#### Continue Watching
1. Scroll to "Continue Watching" section
2. Click "View All →" button
3. **Expected**: Navigate to `/history`
4. **Verify**: History page loads

#### Top Rated
1. Scroll to "Top Rated" section
2. Click "View All →" button
3. **Expected**: 
   - Navigate to `/movies`
   - Toast: "Showing top rated movies"
4. **Verify**: Movies page loads with toast

#### Trending This Week
1. Scroll to "Trending This Week" section
2. Click "View All →" button
3. **Expected**: Navigate to `/trending`
4. **Verify**: Trending page loads

### Responsive Testing

#### Mobile (375px)
```
✅ 2 columns in movie grid
✅ Hero buttons stack vertically
✅ Categories scroll horizontally
✅ Text sizes appropriate
✅ All buttons accessible
✅ No horizontal overflow
```

#### Tablet (768px)
```
✅ 3 columns in movie grid
✅ Hero buttons side by side
✅ Categories visible
✅ Proper spacing
✅ Touch targets large enough
```

#### Desktop (1920px)
```
✅ 5 columns in movie grid
✅ Full hero section
✅ All categories visible
✅ Proper margins
✅ Content centered
```

## Visual Testing

### Hover Effects
```
Test hover on:
✅ Watch Now button → Shadow increases
✅ More Info button → Background lightens
✅ Category buttons → Background changes
✅ View All buttons → Text color changes to primary
✅ Movie cards → Lift effect + overlay
```

### Active States
```
✅ Selected category has primary background
✅ Button press shows scale effect
✅ Focus states visible for keyboard navigation
```

### Transitions
```
✅ All transitions smooth (200-300ms)
✅ No janky animations
✅ Hover effects responsive
✅ Category changes smooth
```

## Functional Testing

### Navigation Flow
```
Home → Click Watch Now → Watch Page
Home → Click More Info → Movie Details
Home → Click Category → Filter Movies
Home → Click View All → Respective Page
Home → Click Movie Card → Movie Details
```

### Data Loading
```
✅ Loading skeletons show while fetching
✅ Demo data loads if API fails
✅ No broken images
✅ No undefined text
✅ Error handling works
```

### Toast Notifications
```
✅ Category change shows toast
✅ View All (Top Rated) shows toast
✅ Toast auto-dismisses after 3s
✅ Toast has proper styling
✅ Multiple toasts stack correctly
```

## Performance Testing

### Load Times
```
✅ Initial page load < 2s
✅ Category switch < 500ms
✅ Navigation instant
✅ Images load progressively
✅ No layout shift
```

### Smooth Scrolling
```
✅ Scroll performance 60fps
✅ No jank on category scroll
✅ Smooth movie grid scroll
✅ Hero section smooth
```

## Browser Compatibility

### Chrome/Edge
```
✅ All features work
✅ Animations smooth
✅ Hover effects correct
```

### Firefox
```
✅ All features work
✅ Backdrop blur works
✅ Transitions smooth
```

### Safari
```
✅ All features work
✅ -webkit-backdrop-filter works
✅ Gradients render correctly
```

## Accessibility Testing

### Keyboard Navigation
```
✅ Tab through all buttons
✅ Enter/Space activates buttons
✅ Focus visible
✅ Logical tab order
```

### Screen Reader
```
✅ Buttons have aria-labels
✅ Images have alt text
✅ Sections have headings
✅ Navigation announced
```

## Error Scenarios

### API Failure
1. Disconnect from server
2. Reload page
3. **Expected**: Demo movies load
4. **Verify**: No broken UI

### Missing Movie ID
1. Click button with no movie
2. **Expected**: Toast notification
3. **Verify**: No navigation, friendly message

### Slow Connection
1. Throttle network to 3G
2. Load page
3. **Expected**: Loading skeletons show
4. **Verify**: Progressive loading

## Success Criteria

All tests pass when:
- ✅ Every button navigates correctly
- ✅ All hover effects work
- ✅ Toast notifications appear
- ✅ Categories filter movies
- ✅ Responsive on all devices
- ✅ No console errors
- ✅ Smooth animations
- ✅ Fast load times
- ✅ Graceful error handling
- ✅ Accessible to all users

## Quick Checklist

```
[ ] Watch Now button works
[ ] More Info button works
[ ] All 7 categories filter correctly
[ ] 3 View All buttons navigate
[ ] Movie cards are clickable
[ ] Mobile responsive (2 cols)
[ ] Tablet responsive (3 cols)
[ ] Desktop responsive (5 cols)
[ ] All hover effects work
[ ] Toast notifications show
[ ] No console errors
[ ] Loading states work
[ ] Images load correctly
[ ] Keyboard navigation works
```

## Report Issues

If any test fails:
1. Note which test failed
2. Check browser console for errors
3. Verify network requests in DevTools
4. Check if server is running
5. Clear cache and retry

## All Tests Passing? 🎉

Your HomePage is fully functional and ready for production!

**Next Steps:**
1. Test on real devices
2. Get user feedback
3. Monitor analytics
4. Optimize further if needed
