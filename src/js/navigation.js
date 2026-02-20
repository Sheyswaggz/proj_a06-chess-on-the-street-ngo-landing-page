/**
 * Navigation Module
 * Handles mobile menu functionality, smooth scrolling navigation, keyboard navigation support,
 * and focus management for mobile menu with proper event handling and accessibility considerations.
 */

/**
 * Initialize mobile menu toggle functionality
 * @returns {void}
 */
function initializeMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (!menuToggle || !navMenu) {
    console.error('Navigation: Mobile menu elements not found');
    return;
  }

  /**
   * Toggle mobile menu visibility
   * @param {boolean} isOpen - Whether the menu should be open
   * @returns {void}
   */
  const toggleMenu = (isOpen) => {
    menuToggle.setAttribute('aria-expanded', isOpen.toString());
    navMenu.setAttribute('data-visible', isOpen.toString());

    if (isOpen) {
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
      // Focus first menu item for accessibility
      const firstMenuItem = navMenu.querySelector('a');
      if (firstMenuItem) {
        setTimeout(() => firstMenuItem.focus(), 100);
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      // Return focus to toggle button
      menuToggle.focus();
    }
  };

  // Toggle menu on button click
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    toggleMenu(!isExpanded);
  });

  // Close menu when clicking on menu items
  const menuLinks = navMenu.querySelectorAll('a');
  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    const isMenuOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    const isClickInsideMenu = navMenu.contains(event.target);
    const isClickOnToggle = menuToggle.contains(event.target);

    if (isMenuOpen && !isClickInsideMenu && !isClickOnToggle) {
      toggleMenu(false);
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const isMenuOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isMenuOpen) {
        toggleMenu(false);
      }
    }
  });

  // Handle focus trap within mobile menu
  navMenu.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const isMenuOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (!isMenuOpen) {
        return;
      }

      const focusableElements = navMenu.querySelectorAll('a');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  });

  // Close menu on window resize if viewport becomes desktop size
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const isMenuOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isMenuOpen && window.innerWidth > 768) {
        toggleMenu(false);
      }
    }, 250);
  });
}

/**
 * Initialize smooth scrolling for internal navigation links
 * @returns {void}
 */
function initializeSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  if (navLinks.length === 0) {
    console.warn('Navigation: No internal navigation links found');
    return;
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');

      // Skip if href is just "#" or empty
      if (!href || href === '#') {
        return;
      }

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        event.preventDefault();

        // Get header height for offset calculation
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const offsetTop = targetElement.offsetTop - headerHeight - 20;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
          // Instant scroll for users who prefer reduced motion
          window.scrollTo(0, offsetTop);
        } else {
          // Smooth scroll
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          });
        }

        // Update URL hash without scrolling
        history.pushState(null, '', href);

        // Set focus to target element for accessibility
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus({ preventScroll: true });

        // Remove tabindex after focus to restore natural tab order
        targetElement.addEventListener('blur', () => {
          targetElement.removeAttribute('tabindex');
        }, { once: true });
      }
    });
  });
}

/**
 * Initialize header scroll behavior
 * Adds/removes classes based on scroll position
 * @returns {void}
 */
function initializeHeaderScrollBehavior() {
  const header = document.querySelector('.site-header');

  if (!header) {
    console.warn('Navigation: Header element not found');
    return;
  }

  let lastScrollTop = 0;
  let ticking = false;

  const updateHeaderOnScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScrollTop = scrollTop;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeaderOnScroll);
      ticking = true;
    }
  });

  // Initial check
  updateHeaderOnScroll();
}

/**
 * Initialize current year in footer
 * @returns {void}
 */
function initializeFooterYear() {
  const yearElement = document.getElementById('current-year');

  if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.textContent = currentYear.toString();
  }
}

/**
 * Initialize all navigation functionality
 * @returns {void}
 */
function initializeNavigation() {
  try {
    initializeMobileMenu();
    initializeSmoothScrolling();
    initializeHeaderScrollBehavior();
    initializeFooterYear();
  } catch (error) {
    console.error('Navigation: Error during initialization', error);
  }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNavigation);
} else {
  initializeNavigation();
}

// Export functions for testing and external use
export {
  initializeMobileMenu,
  initializeSmoothScrolling,
  initializeHeaderScrollBehavior,
  initializeFooterYear,
  initializeNavigation,
};
