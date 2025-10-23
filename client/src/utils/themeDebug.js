// Theme debugging utility
export const debugTheme = () => {
  console.group('🎨 Theme Debug Info')
  
  // Check localStorage
  console.log('localStorage.theme:', localStorage.getItem('theme'))
  console.log('localStorage.primaryColor:', localStorage.getItem('primaryColor'))
  console.log('localStorage.accentColor:', localStorage.getItem('accentColor'))
  
  // Check CSS variables
  const root = document.documentElement
  const computedStyle = getComputedStyle(root)
  console.log('CSS Variables:')
  console.log('  --primary:', computedStyle.getPropertyValue('--primary'))
  console.log('  --secondary:', computedStyle.getPropertyValue('--secondary'))
  console.log('  --background:', computedStyle.getPropertyValue('--background'))
  console.log('  --foreground:', computedStyle.getPropertyValue('--foreground'))
  
  // Check dark class
  console.log('Dark class:', document.documentElement.classList.contains('dark'))
  
  // Check inline styles
  console.log('Inline styles on root:')
  console.log('  --primary:', root.style.getPropertyValue('--primary'))
  console.log('  --background:', root.style.getPropertyValue('--background'))
  
  console.groupEnd()
}

// Add to window for easy access
if (typeof window !== 'undefined') {
  window.debugTheme = debugTheme
}
