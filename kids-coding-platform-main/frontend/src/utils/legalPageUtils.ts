/**
 * Legal Pages Utilities
 * Functions to open legal pages (Terms of Service, Privacy Policy) in new windows
 */

interface WindowOptions {
  width?: number;
  height?: number;
  scrollbars?: boolean;
  resizable?: boolean;
  menubar?: boolean;
  toolbar?: boolean;
  location?: boolean;
  status?: boolean;
}

const DEFAULT_WINDOW_OPTIONS: WindowOptions = {
  width: 900,
  height: 700,
  scrollbars: true,
  resizable: true,
  menubar: false,
  toolbar: false,
  location: false,
  status: false,
};

/**
 * Opens a legal page in a new window with specified options
 */
const openLegalPageWindow = (url: string, title: string, options: WindowOptions = {}) => {
  const finalOptions = { ...DEFAULT_WINDOW_OPTIONS, ...options };
  
  // Calculate center position
  const left = (window.screen.width / 2) - (finalOptions.width! / 2);
  const top = (window.screen.height / 2) - (finalOptions.height! / 2);
  
  // Build window features string
  const features = [
    `width=${finalOptions.width}`,
    `height=${finalOptions.height}`,
    `left=${left}`,
    `top=${top}`,
    `scrollbars=${finalOptions.scrollbars ? 'yes' : 'no'}`,
    `resizable=${finalOptions.resizable ? 'yes' : 'no'}`,
    `menubar=${finalOptions.menubar ? 'yes' : 'no'}`,
    `toolbar=${finalOptions.toolbar ? 'yes' : 'no'}`,
    `location=${finalOptions.location ? 'yes' : 'no'}`,
    `status=${finalOptions.status ? 'yes' : 'no'}`,
  ].join(',');

  // Open the window
  const newWindow = window.open(url, title, features);
  
  // Focus the new window if it was successfully opened
  if (newWindow) {
    newWindow.focus();
  } else {
    // Fallback if popup was blocked - open in new tab
    window.open(url, '_blank');
  }

  return newWindow;
};

/**
 * Opens the Terms of Service page in a new window
 */
export const openTermsOfService = (options?: WindowOptions) => {
  const baseUrl = window.location.origin;
  const url = `${baseUrl}/terms-of-service`;
  return openLegalPageWindow(url, 'TermsOfService', {
    ...options,
    width: 900,
    height: 700,
  });
};

/**
 * Opens the Privacy Policy page in a new window
 */
export const openPrivacyPolicy = (options?: WindowOptions) => {
  const baseUrl = window.location.origin;
  const url = `${baseUrl}/privacy-policy`;
  return openLegalPageWindow(url, 'PrivacyPolicy', {
    ...options,
    width: 900,
    height: 700,
  });
};

/**
 * React hook for legal page utilities
 */
export const useLegalPages = () => {
  return {
    openTermsOfService,
    openPrivacyPolicy,
  };
};

/**
 * Check if we're in a legal page popup window
 * Useful for styling or behavior changes in popup windows
 */
export const isInLegalPageWindow = (): boolean => {
  // Check if window was opened as a popup
  return window.opener !== null && window.opener !== window;
};

/**
 * Close current legal page window
 * Only works if the window was opened by our application
 */
export const closeLegalPageWindow = () => {
  if (isInLegalPageWindow()) {
    window.close();
  }
};

const legalPageUtils = {
  openTermsOfService,
  openPrivacyPolicy,
  useLegalPages,
  isInLegalPageWindow,
  closeLegalPageWindow,
};

export default legalPageUtils;
