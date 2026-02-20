/**
 * Impact Metrics Counter Animation Module
 *
 * Handles animated counting for impact statistics using Intersection Observer API.
 * Includes accessibility support for reduced motion preferences and proper ARIA live regions.
 */

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
function prefersReducedMotion() {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Easing function for smooth counter animation
 * Uses ease-out cubic function for natural deceleration
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value
 */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Format number with proper thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
  return num.toLocaleString('en-US');
}

/**
 * Animate counter from 0 to target value
 * @param {HTMLElement} element - DOM element containing the counter
 * @param {number} target - Target number to count to
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCounter(element, target, duration) {
  // Validate inputs
  if (!element || typeof target !== 'number' || target < 0) {
    console.error('Invalid parameters for counter animation', { element, target, duration });
    return;
  }

  // If user prefers reduced motion, jump to final value immediately
  if (prefersReducedMotion()) {
    element.textContent = formatNumber(target);
    element.classList.remove('counting');
    return;
  }

  const startTime = performance.now();
  const startValue = 0;

  // Add counting class for animation effects
  element.classList.add('counting');

  /**
   * Animation frame handler
   * @param {number} currentTime - Current timestamp from requestAnimationFrame
   */
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Apply easing function
    const easedProgress = easeOutCubic(progress);

    // Calculate current value
    const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);

    // Update DOM
    element.textContent = formatNumber(currentValue);

    // Continue animation or finish
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      // Ensure we hit the exact target value
      element.textContent = formatNumber(target);
      element.classList.remove('counting');
    }
  }

  // Start animation
  requestAnimationFrame(updateCounter);
}

/**
 * Initialize counter animations for all stat elements
 */
function initializeCounters() {
  try {
    // Find all stat number elements
    const statElements = document.querySelectorAll('.stat-number[data-target]');

    if (statElements.length === 0) {
      console.warn('No stat elements found for counter animation');
      return;
    }

    // Track whether animation has been triggered
    let hasAnimated = false;

    // Create Intersection Observer
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2, // Trigger when 20% of element is visible
    };

    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        // Trigger animation when element comes into view
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;

          // Animate all counters with staggered start
          statElements.forEach((element, index) => {
            const target = parseInt(element.getAttribute('data-target'), 10);

            if (isNaN(target)) {
              console.error('Invalid data-target value', { element, target: element.getAttribute('data-target') });
              return;
            }

            // Stagger animation start by 100ms per element
            const delay = index * 100;
            const duration = 2000; // 2 seconds animation

            setTimeout(() => {
              animateCounter(element, target, duration);
            }, delay);
          });

          // Stop observing after animation is triggered
          observer.disconnect();
        }
      });
    };

    // Create observer instance
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe the impact stats container
    const impactStats = document.querySelector('.impact-stats');

    if (impactStats) {
      observer.observe(impactStats);
    } else {
      console.error('Impact stats container not found');
    }
  } catch (error) {
    console.error('Error initializing counter animations:', error);
  }
}

/**
 * Handle visibility change to pause/resume animations if needed
 */
function handleVisibilityChange() {
  if (document.hidden) {
    // Page is hidden, could pause animations if needed
    // Currently counters are one-time animations, so no action needed
  }
}

/**
 * Initialize the module when DOM is ready
 */
function init() {
  try {
    // Check if DOM is already loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeCounters);
    } else {
      // DOM is already ready, initialize immediately
      initializeCounters();
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for media query changes (reduced motion preference)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        if (e.matches) {
          // User now prefers reduced motion
          console.warn('User enabled reduced motion preference');
        }
      });
    }
  } catch (error) {
    console.error('Error initializing impact animations module:', error);
  }
}

// Initialize the module
init();

// Export functions for testing purposes
export {
  animateCounter,
  easeOutCubic,
  formatNumber,
  prefersReducedMotion,
  initializeCounters,
};
