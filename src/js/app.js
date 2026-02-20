/**
 * Main Application Module
 * Coordinates all interactive components and initializes the application
 */

import { initializeNavigation } from './navigation.js';
import { initializeCounters } from './impact-animations.js';
import { initializeContactForm } from './contact-form.js';

/**
 * Application state management
 */
const appState = {
  isInitialized: false,
  modules: {
    navigation: false,
    counters: false,
    contactForm: false,
    donation: false,
  },
};

/**
 * Initialize donation amount selector
 * @returns {void}
 */
function initializeDonationSelector() {
  try {
    const donationContainer = document.querySelector('[data-donation-selector]');

    if (!donationContainer) {
      console.warn('Donation selector container not found');
      appState.modules.donation = false;
      return;
    }

    const amountButtons = donationContainer.querySelectorAll('[data-amount]');
    const customAmountInput = donationContainer.querySelector('[data-custom-amount]');
    const donateButton = donationContainer.querySelector('[data-donate-button]');

    if (!amountButtons.length && !customAmountInput) {
      console.warn('No donation amount controls found');
      appState.modules.donation = false;
      return;
    }

    let selectedAmount = null;

    /**
     * Update donate button with selected amount
     * @param {number|null} amount - Selected donation amount
     */
    const updateDonateButton = (amount) => {
      if (!donateButton) {
        return;
      }

      if (amount && amount > 0) {
        donateButton.disabled = false;
        donateButton.setAttribute('aria-disabled', 'false');
        const buttonText = donateButton.querySelector('.button-text');
        if (buttonText) {
          buttonText.textContent = `Donate $${amount}`;
        }
      } else {
        donateButton.disabled = true;
        donateButton.setAttribute('aria-disabled', 'true');
        const buttonText = donateButton.querySelector('.button-text');
        if (buttonText) {
          buttonText.textContent = 'Select Amount';
        }
      }
    };

    /**
     * Clear all amount button selections
     */
    const clearAmountSelections = () => {
      amountButtons.forEach((btn) => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
      });
    };

    /**
     * Handle preset amount button click
     * @param {Event} event - Click event
     */
    const handleAmountButtonClick = (event) => {
      const button = event.currentTarget;
      const amount = parseInt(button.getAttribute('data-amount'), 10);

      if (isNaN(amount) || amount <= 0) {
        console.error('Invalid donation amount', { amount: button.getAttribute('data-amount') });
        return;
      }

      // Clear previous selections
      clearAmountSelections();
      if (customAmountInput) {
        customAmountInput.value = '';
      }

      // Set new selection
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
      selectedAmount = amount;

      // Update donate button
      updateDonateButton(selectedAmount);

      console.log('Preset amount selected', { amount: selectedAmount });
    };

    /**
     * Validate custom amount input
     * @param {string} value - Input value
     * @returns {number|null} Validated amount or null
     */
    const validateCustomAmount = (value) => {
      const cleanValue = value.replace(/[^0-9.]/g, '');
      const amount = parseFloat(cleanValue);

      if (isNaN(amount)) {
        return null;
      }

      // Minimum donation $1
      if (amount < 1) {
        return null;
      }

      // Maximum donation $1,000,000
      if (amount > 1000000) {
        return null;
      }

      // Round to 2 decimal places
      return Math.round(amount * 100) / 100;
    };

    /**
     * Handle custom amount input change
     * @param {Event} event - Input event
     */
    const handleCustomAmountInput = (event) => {
      const input = event.target;
      const amount = validateCustomAmount(input.value);

      if (amount !== null) {
        // Clear preset selections
        clearAmountSelections();
        selectedAmount = amount;

        // Update donate button
        updateDonateButton(selectedAmount);

        // Clear any previous error
        input.classList.remove('error');
        input.setAttribute('aria-invalid', 'false');

        console.log('Custom amount entered', { amount: selectedAmount });
      } else if (input.value.trim() !== '') {
        // Show error for invalid input
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
        selectedAmount = null;
        updateDonateButton(null);
      } else {
        // Empty input - clear error
        input.classList.remove('error');
        input.setAttribute('aria-invalid', 'false');
        selectedAmount = null;
        updateDonateButton(null);
      }
    };

    /**
     * Handle donate button click
     * @param {Event} event - Click event
     */
    const handleDonateClick = (event) => {
      event.preventDefault();

      if (!selectedAmount || selectedAmount <= 0) {
        console.warn('Donate button clicked without valid amount');
        return;
      }

      console.log('Initiating donation', {
        amount: selectedAmount,
        timestamp: new Date().toISOString(),
      });

      // TODO: Integrate with Stripe Checkout
      // This will be implemented when Stripe integration is added
      // For now, log the intention
      console.warn('Stripe Checkout integration pending', {
        amount: selectedAmount,
        currency: 'USD',
      });

      // Placeholder: Show user feedback
      alert(`Thank you for your interest in donating $${selectedAmount}. Stripe Checkout integration coming soon!`);
    };

    // Attach event listeners to preset amount buttons
    amountButtons.forEach((button) => {
      button.addEventListener('click', handleAmountButtonClick);

      // Keyboard accessibility
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleAmountButtonClick(event);
        }
      });
    });

    // Attach event listener to custom amount input
    if (customAmountInput) {
      customAmountInput.addEventListener('input', handleCustomAmountInput);
      customAmountInput.addEventListener('blur', () => {
        // Format value on blur
        if (selectedAmount !== null && customAmountInput === document.activeElement.previousElementSibling) {
          customAmountInput.value = selectedAmount.toFixed(2);
        }
      });
    }

    // Attach event listener to donate button
    if (donateButton) {
      donateButton.addEventListener('click', handleDonateClick);
    }

    // Initialize button state
    updateDonateButton(null);

    appState.modules.donation = true;
    console.log('Donation selector initialized successfully');
  } catch (error) {
    console.error('Error initializing donation selector', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    appState.modules.donation = false;
  }
}

/**
 * Handle mobile-specific optimizations
 * @returns {void}
 */
function initializeMobileOptimizations() {
  try {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 768;

    if (isMobile || isSmallScreen) {
      // Add mobile class to body
      document.body.classList.add('mobile-device');

      // Optimize touch events
      document.addEventListener('touchstart', () => {}, { passive: true });

      // Prevent zoom on double-tap for form inputs
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, false);

      console.log('Mobile optimizations applied', {
        isMobile,
        isSmallScreen,
        screenWidth: window.innerWidth,
      });
    }
  } catch (error) {
    console.error('Error applying mobile optimizations', {
      name: error.name,
      message: error.message,
    });
  }
}

/**
 * Handle graceful degradation for older browsers
 * @returns {void}
 */
function handleGracefulDegradation() {
  try {
    // Check for required browser features
    const requiredFeatures = {
      intersectionObserver: 'IntersectionObserver' in window,
      fetch: 'fetch' in window,
      promise: 'Promise' in window,
      requestAnimationFrame: 'requestAnimationFrame' in window,
    };

    const missingFeatures = Object.entries(requiredFeatures)
      .filter(([_key, supported]) => !supported)
      .map(([key]) => key);

    if (missingFeatures.length > 0) {
      console.warn('Browser missing some features, degrading gracefully', {
        missingFeatures,
      });

      // Add fallback class to body
      document.body.classList.add('legacy-browser');

      // Disable animations if requestAnimationFrame not supported
      if (!requiredFeatures.requestAnimationFrame) {
        document.body.classList.add('no-animations');
      }
    } else {
      console.log('All required browser features supported');
    }
  } catch (error) {
    console.error('Error checking browser features', {
      name: error.name,
      message: error.message,
    });
  }
}

/**
 * Initialize all application modules
 * @returns {void}
 */
function initializeApp() {
  try {
    if (appState.isInitialized) {
      console.warn('App already initialized');
      return;
    }

    console.log('Initializing Chess on the Street application', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    // Check browser compatibility and apply graceful degradation
    handleGracefulDegradation();

    // Apply mobile optimizations
    initializeMobileOptimizations();

    // Initialize navigation module
    try {
      initializeNavigation();
      appState.modules.navigation = true;
      console.log('Navigation module initialized');
    } catch (error) {
      console.error('Failed to initialize navigation module', error);
      appState.modules.navigation = false;
    }

    // Initialize impact counters
    try {
      initializeCounters();
      appState.modules.counters = true;
      console.log('Impact counters initialized');
    } catch (error) {
      console.error('Failed to initialize impact counters', error);
      appState.modules.counters = false;
    }

    // Initialize contact form
    try {
      initializeContactForm();
      appState.modules.contactForm = true;
      console.log('Contact form initialized');
    } catch (error) {
      console.error('Failed to initialize contact form', error);
      appState.modules.contactForm = false;
    }

    // Initialize donation selector
    initializeDonationSelector();

    // Mark app as initialized
    appState.isInitialized = true;

    // Log initialization summary
    const successfulModules = Object.entries(appState.modules)
      .filter(([_key, initialized]) => initialized)
      .map(([key]) => key);

    const failedModules = Object.entries(appState.modules)
      .filter(([_key, initialized]) => !initialized)
      .map(([key]) => key);

    console.log('Application initialization complete', {
      successful: successfulModules,
      failed: failedModules,
      timestamp: new Date().toISOString(),
    });

    // Dispatch custom event for app ready
    const appReadyEvent = new CustomEvent('appReady', {
      detail: {
        modules: appState.modules,
        timestamp: new Date().toISOString(),
      },
    });
    window.dispatchEvent(appReadyEvent);
  } catch (error) {
    console.error('Critical error during application initialization', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Even if initialization fails, try to provide basic functionality
    document.body.classList.add('app-error');
  }
}

/**
 * Handle visibility change to pause/resume functionality
 */
function handleVisibilityChange() {
  if (document.hidden) {
    console.log('Page hidden, pausing non-critical functionality');
  } else {
    console.log('Page visible, resuming functionality');
  }
}

/**
 * Handle page unload for cleanup
 */
function handlePageUnload() {
  console.log('Page unloading, cleaning up', {
    timestamp: new Date().toISOString(),
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Listen for visibility changes
document.addEventListener('visibilitychange', handleVisibilityChange);

// Listen for page unload
window.addEventListener('beforeunload', handlePageUnload);

// Export for testing
export {
  initializeApp,
  initializeDonationSelector,
  initializeMobileOptimizations,
  handleGracefulDegradation,
};
