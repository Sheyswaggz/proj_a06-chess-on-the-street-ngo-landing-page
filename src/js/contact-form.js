/**
 * Contact Form Validation and Submission Handler
 * Handles form validation, submission to Formspree, and user feedback
 */

/**
 * Validates an email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 */
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validates a required text field
 * @param {string} value - Field value to validate
 * @param {number} minLength - Minimum required length
 * @returns {boolean} True if field is valid, false otherwise
 */
function validateRequired(value, minLength = 1) {
  return value.trim().length >= minLength;
}

/**
 * Displays an error message for a form field
 * @param {HTMLElement} field - Input or textarea element
 * @param {string} message - Error message to display
 */
function showFieldError(field, message) {
  const errorId = field.getAttribute('aria-describedby');
  const errorElement = document.getElementById(errorId);

  if (errorElement) {
    errorElement.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('error');

    // Log error for debugging
    console.warn(`Form validation error on ${field.name}: ${message}`);
  }
}

/**
 * Clears error message for a form field
 * @param {HTMLElement} field - Input or textarea element
 */
function clearFieldError(field) {
  const errorId = field.getAttribute('aria-describedby');
  const errorElement = document.getElementById(errorId);

  if (errorElement) {
    errorElement.textContent = '';
    field.setAttribute('aria-invalid', 'false');
    field.classList.remove('error');
  }
}

/**
 * Validates all form fields
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} True if all fields are valid, false otherwise
 */
function validateForm(form) {
  let isValid = true;

  // Get form fields
  const nameField = form.querySelector('#name');
  const emailField = form.querySelector('#email');
  const subjectField = form.querySelector('#subject');
  const messageField = form.querySelector('#message');

  // Validate name field
  if (!validateRequired(nameField.value, 2)) {
    showFieldError(nameField, 'Please enter your name (at least 2 characters)');
    isValid = false;
  } else {
    clearFieldError(nameField);
  }

  // Validate email field
  if (!validateRequired(emailField.value)) {
    showFieldError(emailField, 'Please enter your email address');
    isValid = false;
  } else if (!validateEmail(emailField.value)) {
    showFieldError(emailField, 'Please enter a valid email address');
    isValid = false;
  } else {
    clearFieldError(emailField);
  }

  // Validate subject field
  if (!validateRequired(subjectField.value, 3)) {
    showFieldError(subjectField, 'Please enter a subject (at least 3 characters)');
    isValid = false;
  } else {
    clearFieldError(subjectField);
  }

  // Validate message field
  if (!validateRequired(messageField.value, 10)) {
    showFieldError(messageField, 'Please enter a message (at least 10 characters)');
    isValid = false;
  } else {
    clearFieldError(messageField);
  }

  if (!isValid) {
    console.error('Form validation failed');
  }

  return isValid;
}

/**
 * Displays a status message to the user
 * @param {HTMLElement} statusElement - Status message container
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success' or 'error')
 */
function showStatusMessage(statusElement, message, type) {
  statusElement.textContent = message;
  statusElement.className = `form-status ${type}`;
  statusElement.setAttribute('role', type === 'error' ? 'alert' : 'status');

  // Log status for debugging
  console.log(`Form status (${type}): ${message}`);

  // Scroll to status message for visibility
  statusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Clears the status message
 * @param {HTMLElement} statusElement - Status message container
 */
function clearStatusMessage(statusElement) {
  statusElement.textContent = '';
  statusElement.className = 'form-status';
}

/**
 * Sets the form loading state
 * @param {HTMLFormElement} form - Form element
 * @param {boolean} isLoading - Loading state
 */
function setFormLoadingState(form, isLoading) {
  const submitButton = form.querySelector('button[type="submit"]');
  const formInputs = form.querySelectorAll('input, textarea');

  if (isLoading) {
    submitButton.disabled = true;
    submitButton.setAttribute('data-loading', 'true');
    submitButton.setAttribute('aria-busy', 'true');

    formInputs.forEach((input) => {
      input.disabled = true;
    });

    console.log('Form loading state: enabled');
  } else {
    submitButton.disabled = false;
    submitButton.setAttribute('data-loading', 'false');
    submitButton.setAttribute('aria-busy', 'false');

    formInputs.forEach((input) => {
      input.disabled = false;
    });

    console.log('Form loading state: disabled');
  }
}

/**
 * Resets the form to its initial state
 * @param {HTMLFormElement} form - Form element to reset
 */
function resetForm(form) {
  form.reset();

  // Clear all field errors
  const fields = form.querySelectorAll('input, textarea');
  fields.forEach((field) => {
    clearFieldError(field);
  });

  console.log('Form reset completed');
}

/**
 * Handles form submission
 * @param {Event} event - Submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const statusElement = form.querySelector('.form-status');

  // Clear previous status
  clearStatusMessage(statusElement);

  // Validate form
  if (!validateForm(form)) {
    showStatusMessage(
      statusElement,
      'Please correct the errors above and try again.',
      'error',
    );
    return;
  }

  // Set loading state
  setFormLoadingState(form, true);

  // Log submission attempt
  console.log('Form submission initiated', {
    action: form.action,
    method: form.method,
  });

  try {
    // Submit form to Formspree
    const formData = new FormData(form);
    const response = await fetch(form.action, {
      method: form.method,
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    });

    // Log response details
    console.log('Form submission response received', {
      status: response.status,
      ok: response.ok,
    });

    if (response.ok) {
      // Success - show success message
      showStatusMessage(
        statusElement,
        'Thank you for your message! We will get back to you soon.',
        'success',
      );

      // Reset form after successful submission
      setTimeout(() => {
        resetForm(form);
        clearStatusMessage(statusElement);
      }, 5000);

      console.log('Form submitted successfully');
    } else {
      // Server error - show error message
      const errorData = await response.json();
      console.error('Form submission failed', {
        status: response.status,
        errors: errorData.errors,
      });

      let errorMessage = 'Sorry, there was a problem submitting your message. Please try again.';

      // Check for specific Formspree errors
      if (errorData.errors && errorData.errors.length > 0) {
        const firstError = errorData.errors[0];
        if (firstError.message) {
          errorMessage = firstError.message;
        }
      }

      showStatusMessage(statusElement, errorMessage, 'error');
    }
  } catch (error) {
    // Network or other error
    console.error('Form submission error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    showStatusMessage(
      statusElement,
      'Sorry, there was a network error. Please check your connection and try again.',
      'error',
    );
  } finally {
    // Remove loading state
    setFormLoadingState(form, false);
  }
}

/**
 * Handles real-time field validation on blur
 * @param {Event} event - Blur event
 */
function handleFieldBlur(event) {
  const field = event.target;
  const fieldName = field.name;

  // Skip if field is empty (not touched yet)
  if (!field.value.trim()) {
    return;
  }

  // Validate individual field
  switch (fieldName) {
  case 'name':
    if (!validateRequired(field.value, 2)) {
      showFieldError(field, 'Please enter your name (at least 2 characters)');
    } else {
      clearFieldError(field);
    }
    break;

  case 'email':
    if (!validateRequired(field.value)) {
      showFieldError(field, 'Please enter your email address');
    } else if (!validateEmail(field.value)) {
      showFieldError(field, 'Please enter a valid email address');
    } else {
      clearFieldError(field);
    }
    break;

  case 'subject':
    if (!validateRequired(field.value, 3)) {
      showFieldError(field, 'Please enter a subject (at least 3 characters)');
    } else {
      clearFieldError(field);
    }
    break;

  case 'message':
    if (!validateRequired(field.value, 10)) {
      showFieldError(field, 'Please enter a message (at least 10 characters)');
    } else {
      clearFieldError(field);
    }
    break;

  default:
    break;
  }
}

/**
 * Handles field input to clear errors as user types
 * @param {Event} event - Input event
 */
function handleFieldInput(event) {
  const field = event.target;

  // Clear error if field has been marked invalid
  if (field.getAttribute('aria-invalid') === 'true') {
    clearFieldError(field);
  }
}

/**
 * Initializes the contact form
 */
function initializeContactForm() {
  const form = document.querySelector('[data-contact-form]');

  if (!form) {
    console.warn('Contact form not found on page');
    return;
  }

  console.log('Initializing contact form');

  // Add submit event listener
  form.addEventListener('submit', handleFormSubmit);

  // Add blur validation for all form fields
  const formFields = form.querySelectorAll('input, textarea');
  formFields.forEach((field) => {
    field.addEventListener('blur', handleFieldBlur);
    field.addEventListener('input', handleFieldInput);
  });

  console.log('Contact form initialized successfully');
}

// Initialize form when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContactForm);
} else {
  initializeContactForm();
}

// Export functions for testing
export {
  validateEmail,
  validateRequired,
  validateForm,
  showFieldError,
  clearFieldError,
  handleFormSubmit,
  initializeContactForm,
};
