/**
 * Donation Module
 * Handles donation amount selection and Stripe Checkout preparation
 */

/**
 * Donation configuration
 */
const donationConfig = {
  currency: 'USD',
  minAmount: 1,
  maxAmount: 1000000,
  presetAmounts: [10, 25, 50, 100, 250, 500],
  stripePublicKey: null, // To be configured when Stripe is integrated
};

/**
 * Donation state management
 */
const donationState = {
  selectedAmount: null,
  customAmount: null,
  isProcessing: false,
};

/**
 * Format currency amount for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
function formatCurrency(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency', { amount, currency, error });
    return `$${amount}`;
  }
}

/**
 * Validate donation amount
 * @param {number} amount - Amount to validate
 * @returns {object} Validation result with isValid and error message
 */
function validateDonationAmount(amount) {
  // Check if amount is a number
  if (typeof amount !== 'number' || isNaN(amount)) {
    return {
      isValid: false,
      error: 'Please enter a valid amount',
    };
  }

  // Check minimum amount
  if (amount < donationConfig.minAmount) {
    return {
      isValid: false,
      error: `Minimum donation amount is ${formatCurrency(donationConfig.minAmount)}`,
    };
  }

  // Check maximum amount
  if (amount > donationConfig.maxAmount) {
    return {
      isValid: false,
      error: `Maximum donation amount is ${formatCurrency(donationConfig.maxAmount)}`,
    };
  }

  // Amount is valid
  return {
    isValid: true,
    error: null,
  };
}

/**
 * Parse and sanitize amount input
 * @param {string} input - Raw input value
 * @returns {number|null} Parsed amount or null if invalid
 */
function parseAmountInput(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Remove currency symbols, spaces, and commas
  const cleanInput = input.replace(/[$,\s]/g, '');

  // Parse as float
  const amount = parseFloat(cleanInput);

  // Check if parsing was successful
  if (isNaN(amount)) {
    return null;
  }

  // Round to 2 decimal places
  return Math.round(amount * 100) / 100;
}

/**
 * Create preset amount button
 * @param {number} amount - Preset amount value
 * @returns {HTMLElement} Button element
 */
function createPresetButton(amount) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'donation-amount-button';
  button.setAttribute('data-amount', amount.toString());
  button.setAttribute('role', 'radio');
  button.setAttribute('aria-checked', 'false');
  button.textContent = formatCurrency(amount);

  return button;
}

/**
 * Handle preset amount selection
 * @param {HTMLElement} button - Selected button element
 * @param {number} amount - Selected amount
 */
function handlePresetSelection(button, amount) {
  // Validate amount
  const validation = validateDonationAmount(amount);
  if (!validation.isValid) {
    console.error('Invalid preset amount', { amount, error: validation.error });
    return;
  }

  // Clear all other preset selections
  const container = button.closest('[data-donation-selector]');
  if (container) {
    const allButtons = container.querySelectorAll('[data-amount]');
    allButtons.forEach((btn) => {
      btn.classList.remove('selected', 'active');
      btn.setAttribute('aria-checked', 'false');
    });
  }

  // Select current button
  button.classList.add('selected', 'active');
  button.setAttribute('aria-checked', 'true');

  // Clear custom amount input
  const customInput = container?.querySelector('[data-custom-amount]');
  if (customInput) {
    customInput.value = '';
    customInput.classList.remove('error');
    customInput.setAttribute('aria-invalid', 'false');
  }

  // Update state
  donationState.selectedAmount = amount;
  donationState.customAmount = null;

  // Log selection
  console.log('Preset amount selected', {
    amount,
    formattedAmount: formatCurrency(amount),
  });

  // Dispatch custom event
  const event = new CustomEvent('donationAmountSelected', {
    detail: {
      amount,
      type: 'preset',
    },
  });
  window.dispatchEvent(event);
}

/**
 * Handle custom amount input
 * @param {HTMLInputElement} input - Input element
 * @param {string} value - Input value
 */
function handleCustomAmountInput(input, value) {
  // Parse input value
  const amount = parseAmountInput(value);

  // Clear preset selections
  const container = input.closest('[data-donation-selector]');
  if (container) {
    const presetButtons = container.querySelectorAll('[data-amount]');
    presetButtons.forEach((btn) => {
      btn.classList.remove('selected', 'active');
      btn.setAttribute('aria-checked', 'false');
    });
  }

  // Handle empty input
  if (value.trim() === '') {
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
    donationState.selectedAmount = null;
    donationState.customAmount = null;
    return;
  }

  // Handle invalid input
  if (amount === null) {
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    donationState.selectedAmount = null;
    donationState.customAmount = null;
    console.warn('Invalid custom amount input', { value });
    return;
  }

  // Validate amount
  const validation = validateDonationAmount(amount);
  if (!validation.isValid) {
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    donationState.selectedAmount = null;
    donationState.customAmount = null;

    // Show error message
    const errorElement = input.parentElement?.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = validation.error;
    }

    console.warn('Custom amount validation failed', {
      amount,
      error: validation.error,
    });
    return;
  }

  // Amount is valid
  input.classList.remove('error');
  input.setAttribute('aria-invalid', 'false');

  // Clear error message
  const errorElement = input.parentElement?.querySelector('.error-message');
  if (errorElement) {
    errorElement.textContent = '';
  }

  // Update state
  donationState.selectedAmount = amount;
  donationState.customAmount = amount;

  // Log selection
  console.log('Custom amount entered', {
    amount,
    formattedAmount: formatCurrency(amount),
  });

  // Dispatch custom event
  const event = new CustomEvent('donationAmountSelected', {
    detail: {
      amount,
      type: 'custom',
    },
  });
  window.dispatchEvent(event);
}

/**
 * Initialize Stripe Checkout (placeholder)
 * @param {number} amount - Donation amount
 * @returns {Promise<void>}
 */
async function initializeStripeCheckout(amount) {
  try {
    console.log('Preparing Stripe Checkout', {
      amount,
      currency: donationConfig.currency,
    });

    // Check if Stripe is configured
    if (!donationConfig.stripePublicKey) {
      throw new Error('Stripe public key not configured');
    }

    // TODO: Implement Stripe Checkout integration
    // 1. Create checkout session on backend
    // 2. Redirect to Stripe Checkout
    // 3. Handle success/cancel redirects

    console.warn('Stripe Checkout integration pending', {
      amount,
      currency: donationConfig.currency,
      publicKey: donationConfig.stripePublicKey ? 'configured' : 'not configured',
    });

    // Placeholder: Show user that integration is coming
    throw new Error('Stripe Checkout integration coming soon');
  } catch (error) {
    console.error('Error initializing Stripe Checkout', {
      name: error.name,
      message: error.message,
      amount,
    });
    throw error;
  }
}

/**
 * Handle donation submission
 * @param {Event} event - Submit event
 * @returns {Promise<void>}
 */
async function handleDonationSubmit(event) {
  event.preventDefault();

  // Check if amount is selected
  if (!donationState.selectedAmount || donationState.selectedAmount <= 0) {
    console.warn('Donation submit attempted without valid amount');
    return;
  }

  // Prevent double submission
  if (donationState.isProcessing) {
    console.warn('Donation already processing');
    return;
  }

  try {
    // Set processing state
    donationState.isProcessing = true;

    // Log donation attempt
    console.log('Donation submission initiated', {
      amount: donationState.selectedAmount,
      type: donationState.customAmount ? 'custom' : 'preset',
      timestamp: new Date().toISOString(),
    });

    // Initialize Stripe Checkout
    await initializeStripeCheckout(donationState.selectedAmount);
  } catch (error) {
    console.error('Donation submission failed', {
      name: error.name,
      message: error.message,
      amount: donationState.selectedAmount,
    });

    // Show error to user
    alert(`Unable to process donation: ${error.message}`);
  } finally {
    // Reset processing state
    donationState.isProcessing = false;
  }
}

/**
 * Initialize donation selector
 * @returns {void}
 */
function initializeDonationSelector() {
  try {
    const donationContainer = document.querySelector('[data-donation-selector]');

    if (!donationContainer) {
      console.warn('Donation selector container not found');
      return;
    }

    // Initialize preset amount buttons
    const presetButtons = donationContainer.querySelectorAll('[data-amount]');
    presetButtons.forEach((button) => {
      const amount = parseInt(button.getAttribute('data-amount'), 10);

      if (isNaN(amount)) {
        console.error('Invalid preset amount', {
          button,
          amount: button.getAttribute('data-amount'),
        });
        return;
      }

      // Click handler
      button.addEventListener('click', () => {
        handlePresetSelection(button, amount);
      });

      // Keyboard accessibility
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handlePresetSelection(button, amount);
        }
      });
    });

    // Initialize custom amount input
    const customInput = donationContainer.querySelector('[data-custom-amount]');
    if (customInput) {
      // Input handler
      customInput.addEventListener('input', (event) => {
        handleCustomAmountInput(customInput, event.target.value);
      });

      // Focus handler
      customInput.addEventListener('focus', () => {
        // Clear preset selections when focusing custom input
        const presetBtns = donationContainer.querySelectorAll('[data-amount]');
        presetBtns.forEach((btn) => {
          btn.classList.remove('selected', 'active');
          btn.setAttribute('aria-checked', 'false');
        });
      });

      // Blur handler - format value
      customInput.addEventListener('blur', () => {
        if (donationState.customAmount !== null) {
          customInput.value = donationState.customAmount.toFixed(2);
        }
      });
    }

    // Initialize submit button
    const submitButton = donationContainer.querySelector('[data-donate-button]');
    if (submitButton) {
      submitButton.addEventListener('click', handleDonationSubmit);
    }

    console.log('Donation selector initialized successfully', {
      presetButtons: presetButtons.length,
      hasCustomInput: !!customInput,
      hasSubmitButton: !!submitButton,
    });
  } catch (error) {
    console.error('Error initializing donation selector', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDonationSelector);
} else {
  initializeDonationSelector();
}

// Export functions for testing and external use
export {
  initializeDonationSelector,
  validateDonationAmount,
  parseAmountInput,
  formatCurrency,
  handlePresetSelection,
  handleCustomAmountInput,
  handleDonationSubmit,
  initializeStripeCheckout,
};
