/**
 * Google Analytics 4 Event Tracking Module
 * Provides custom event tracking for user interactions with privacy considerations
 */

/**
 * Check if Google Analytics is available
 * @returns {boolean} Whether gtag is available
 */
function isGtagAvailable() {
  return typeof window.gtag === 'function' && typeof window.dataLayer !== 'undefined';
}

/**
 * Log analytics errors without throwing
 * @param {string} context - Context where error occurred
 * @param {Error} error - Error object
 */
function logAnalyticsError(context, error) {
  console.error(`Analytics Error [${context}]:`, {
    message: error.message,
    name: error.name,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track donation interaction event
 * @param {Object} params - Event parameters
 * @param {number} params.amount - Donation amount
 * @param {string} params.type - Type of donation ('preset' or 'custom')
 * @param {string} [params.method] - Payment method (e.g., 'stripe')
 * @param {string} [params.status] - Donation status ('initiated', 'completed', 'failed')
 */
function trackDonation(params) {
  try {
    if (!isGtagAvailable()) {
      console.warn('Google Analytics not available for donation tracking');
      return;
    }

    const {
      amount,
      type,
      method = 'stripe',
      status = 'initiated',
    } = params;

    // Validate required parameters
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid donation amount');
    }

    if (!type || (type !== 'preset' && type !== 'custom')) {
      throw new Error('Invalid donation type');
    }

    // Track donation event
    window.gtag('event', 'donation', {
      event_category: 'engagement',
      event_label: `${type}_donation`,
      value: amount,
      currency: 'USD',
      donation_amount: amount,
      donation_type: type,
      payment_method: method,
      donation_status: status,
      timestamp: new Date().toISOString(),
    });

    console.log('Donation event tracked', {
      amount,
      type,
      method,
      status,
    });
  } catch (error) {
    logAnalyticsError('trackDonation', error);
  }
}

/**
 * Track volunteer signup event
 * @param {Object} params - Event parameters
 * @param {string} [params.source] - Source of signup (e.g., 'hero_cta', 'footer')
 * @param {string} [params.program] - Volunteer program interest
 */
function trackVolunteerSignup(params = {}) {
  try {
    if (!isGtagAvailable()) {
      console.warn('Google Analytics not available for volunteer signup tracking');
      return;
    }

    const {
      source = 'unknown',
      program = 'general',
    } = params;

    // Track volunteer signup event
    window.gtag('event', 'volunteer_signup', {
      event_category: 'engagement',
      event_label: 'volunteer_interest',
      signup_source: source,
      volunteer_program: program,
      timestamp: new Date().toISOString(),
    });

    console.log('Volunteer signup event tracked', {
      source,
      program,
    });
  } catch (error) {
    logAnalyticsError('trackVolunteerSignup', error);
  }
}

/**
 * Track form submission event
 * @param {Object} params - Event parameters
 * @param {string} params.formName - Name of the form
 * @param {string} params.formType - Type of form ('contact', 'newsletter', etc.)
 * @param {string} [params.status] - Submission status ('success', 'error')
 */
function trackFormSubmission(params) {
  try {
    if (!isGtagAvailable()) {
      console.warn('Google Analytics not available for form submission tracking');
      return;
    }

    const {
      formName,
      formType,
      status = 'submitted',
    } = params;

    // Validate required parameters
    if (!formName || typeof formName !== 'string') {
      throw new Error('Invalid form name');
    }

    if (!formType || typeof formType !== 'string') {
      throw new Error('Invalid form type');
    }

    // Track form submission event
    window.gtag('event', 'form_submission', {
      event_category: 'engagement',
      event_label: formName,
      form_name: formName,
      form_type: formType,
      submission_status: status,
      timestamp: new Date().toISOString(),
    });

    console.log('Form submission event tracked', {
      formName,
      formType,
      status,
    });
  } catch (error) {
    logAnalyticsError('trackFormSubmission', error);
  }
}

/**
 * Track program inquiry event
 * @param {Object} params - Event parameters
 * @param {string} params.programName - Name of the program
 * @param {string} [params.action] - Action taken ('view', 'inquiry', 'signup')
 */
function trackProgramInquiry(params) {
  try {
    if (!isGtagAvailable()) {
      console.warn('Google Analytics not available for program inquiry tracking');
      return;
    }

    const {
      programName,
      action = 'view',
    } = params;

    // Validate required parameters
    if (!programName || typeof programName !== 'string') {
      throw new Error('Invalid program name');
    }

    // Track program inquiry event
    window.gtag('event', 'program_inquiry', {
      event_category: 'engagement',
      event_label: programName,
      program_name: programName,
      inquiry_action: action,
      timestamp: new Date().toISOString(),
    });

    console.log('Program inquiry event tracked', {
      programName,
      action,
    });
  } catch (error) {
    logAnalyticsError('trackProgramInquiry', error);
  }
}

/**
 * Track navigation click event
 * @param {Object} params - Event parameters
 * @param {string} params.destination - Navigation destination
 * @param {string} [params.source] - Navigation source (e.g., 'header', 'footer', 'inline')
 * @param {string} [params.linkText] - Text of the link clicked
 */
function trackNavigationClick(params) {
  try {
    if (!isGtagAvailable()) {
      console.warn('Google Analytics not available for navigation click tracking');
      return;
    }

    const {
      destination,
      source = 'unknown',
      linkText = '',
    } = params;

    // Validate required parameters
    if (!destination || typeof destination !== 'string') {
      throw new Error('Invalid navigation destination');
    }

    // Track navigation click event
    window.gtag('event', 'navigation_click', {
      event_category: 'navigation',
      event_label: destination,
      navigation_destination: destination,
      navigation_source: source,
      link_text: linkText,
      timestamp: new Date().toISOString(),
    });

    console.log('Navigation click event tracked', {
      destination,
      source,
      linkText,
    });
  } catch (error) {
    logAnalyticsError('trackNavigationClick', error);
  }
}

/**
 * Track scroll depth milestone
 * @param {Object} params - Event parameters
 * @param {number} params.depth - Scroll depth percentage (e.g., 25, 50, 75, 100)
 * @param {string} [params.page] - Page identifier
 */
function trackScrollDepth(params) {
  try {
    if (!isGtagAvailable()) {
      console.warn('Google Analytics not available for scroll depth tracking');
      return;
    }

    const {
      depth,
      page = window.location.pathname,
    } = params;

    // Validate required parameters
    if (typeof depth !== 'number' || depth < 0 || depth > 100) {
      throw new Error('Invalid scroll depth');
    }

    // Track scroll depth event
    window.gtag('event', 'scroll_depth', {
      event_category: 'engagement',
      event_label: `${depth}%`,
      scroll_percentage: depth,
      page_path: page,
      timestamp: new Date().toISOString(),
    });

    console.log('Scroll depth event tracked', {
      depth,
      page,
    });
  } catch (error) {
    logAnalyticsError('trackScrollDepth', error);
  }
}

/**
 * Track social media link click
 * @param {Object} params - Event parameters
 * @param {string} params.platform - Social media platform (e.g., 'facebook', 'twitter')
 * @param {string} [params.location] - Location of link (e.g., 'header', 'footer')
 */
function trackSocialClick(params) {
  try {
    if (!isGtagAvailable()) {
      console.warn('Google Analytics not available for social click tracking');
      return;
    }

    const {
      platform,
      location = 'unknown',
    } = params;

    // Validate required parameters
    if (!platform || typeof platform !== 'string') {
      throw new Error('Invalid social media platform');
    }

    // Track social media click event
    window.gtag('event', 'social_click', {
      event_category: 'engagement',
      event_label: platform,
      social_platform: platform,
      link_location: location,
      timestamp: new Date().toISOString(),
    });

    console.log('Social media click event tracked', {
      platform,
      location,
    });
  } catch (error) {
    logAnalyticsError('trackSocialClick', error);
  }
}

/**
 * Track custom event
 * @param {string} eventName - Name of the custom event
 * @param {Object} [params] - Event parameters
 */
function trackCustomEvent(eventName, params = {}) {
  try {
    if (!isGtagAvailable()) {
      console.warn('Google Analytics not available for custom event tracking');
      return;
    }

    // Validate event name
    if (!eventName || typeof eventName !== 'string') {
      throw new Error('Invalid event name');
    }

    // Add timestamp to parameters
    const eventParams = {
      ...params,
      timestamp: new Date().toISOString(),
    };

    // Track custom event
    window.gtag('event', eventName, eventParams);

    console.log('Custom event tracked', {
      eventName,
      params: eventParams,
    });
  } catch (error) {
    logAnalyticsError('trackCustomEvent', error);
  }
}

/**
 * Initialize analytics tracking
 * Sets up global event listeners if needed
 */
function initializeAnalytics() {
  try {
    if (!isGtagAvailable()) {
      console.warn('Google Analytics not available - tracking disabled');
      return;
    }

    console.log('Analytics tracking initialized', {
      timestamp: new Date().toISOString(),
    });

    // Dispatch custom event to signal analytics is ready
    const analyticsReadyEvent = new CustomEvent('analyticsReady', {
      detail: {
        timestamp: new Date().toISOString(),
      },
    });
    window.dispatchEvent(analyticsReadyEvent);
  } catch (error) {
    logAnalyticsError('initializeAnalytics', error);
  }
}

// Initialize analytics when module loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnalytics);
} else {
  initializeAnalytics();
}

// Export tracking functions
export {
  trackDonation,
  trackVolunteerSignup,
  trackFormSubmission,
  trackProgramInquiry,
  trackNavigationClick,
  trackScrollDepth,
  trackSocialClick,
  trackCustomEvent,
  initializeAnalytics,
  isGtagAvailable,
};
