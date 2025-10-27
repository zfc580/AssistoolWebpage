# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a marketing landing page for a WeChat Keyboard contact import tool. The page targets WeChat Keyboard users who need contact import functionality that other input methods already provide.

## Architecture

### Frontend Structure
- **Pure Static Site**: HTML5 + CSS3 + Vanilla JavaScript (no frameworks)
- **Single Page Application**: All content on one page with smooth scrolling navigation
- **Responsive Design**: Mobile-first approach with breakpoints for tablets and desktops

### Key Files
- `index.html` - Main landing page with semantic HTML5 structure
- `styles/main.css` - Core styling with CSS custom properties and modern design
- `styles/responsive.css` - Comprehensive responsive design for all screen sizes
- `scripts/main.js` - DOM interactions, form validation, countdown timer, animations
- `scripts/api.js` - API abstraction layer with offline fallback support

### CSS Architecture
- Uses CSS custom properties (`:root`) for consistent theming
- Component-based styling with clear separation of concerns
- Mobile-first responsive design with progressive enhancement
- Animation and transition effects throughout

### JavaScript Architecture
- **Modular Design**: Separate files for main functionality vs API handling
- **Event-Driven**: DOM event listeners and custom event handling
- **Progressive Enhancement**: Works offline with localStorage fallback
- **Performance Optimized**: Debouncing, throttling, lazy loading

## Configuration

### API Configuration
Located in `scripts/api.js` - Update `API_CONFIG.baseURL` to point to your backend:
```javascript
const API_CONFIG = {
    baseURL: 'https://your-api-domain.com/api', // Replace with actual API
    timeout: 10000,
    endpoints: {
        submitEmail: '/email/subscribe',
        trackEvent: '/analytics/track',
        getStats: '/stats/public'
    }
};
```

### Countdown Timer
Configured in `scripts/main.js` - Target date is set to 15 days from page load:
```javascript
const targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 15);
targetDate.setHours(0, 0, 0, 0);
```

## Key Features

### Email Collection System
- Real-time email validation with regex pattern
- API submission with localStorage fallback
- Success modal with confirmation
- Duplicate email detection

### Offline Support
- LocalStorage for email submissions when API unavailable
- Automatic sync when connection restored
- Batch event tracking for analytics

### Animation System
- Intersection Observer for scroll animations
- CSS animations with performance optimization
- Reduced motion support for accessibility

### Responsive Breakpoints
- Mobile: <576px
- Small Tablet: 576px-767px
- Large Tablet: 768px-991px
- Desktop: 992px-1199px
- Large Desktop: 1200px+

## Development Notes

### No Build Process
This is a static site with no compilation steps. Simply open `index.html` in a browser or serve via any web server.

### Browser Compatibility
- Modern browsers (ES6+ support required)
- CSS Grid and Flexbox support
- LocalStorage API required

### Color Scheme
- Primary: WeChat Green (#07c160)
- Secondary: Purple gradient background
- Text: Dark gray hierarchy for readability

### Performance Considerations
- All CSS and JS are non-blocking
- Images use optimized formats
- Fonts use system font stack for speed
- Animations use CSS transforms for GPU acceleration