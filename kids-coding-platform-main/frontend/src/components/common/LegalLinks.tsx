import React from 'react';
import { useLegalPages } from '../../utils/legalPageUtils';

interface LegalLinksProps {
  className?: string;
  variant?: 'footer' | 'inline' | 'modal';
  showIcons?: boolean;
  textSize?: 'text-xs' | 'text-sm' | 'text-base' | 'text-lg';
  textColor?: string;
  separator?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * LegalLinks - Reusable component for Terms of Service and Privacy Policy links
 * Opens the legal pages in new windows for better UX
 */
export const LegalLinks: React.FC<LegalLinksProps> = ({
  className = '',
  variant = 'footer',
  showIcons = false,
  textSize = 'text-sm',
  textColor = 'text-gray-600 hover:text-gray-800',
  separator = '•',
  orientation = 'horizontal'
}) => {
  const { openTermsOfService, openPrivacyPolicy } = useLegalPages();

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openTermsOfService();
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openPrivacyPolicy();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'footer':
        return 'space-x-4';
      case 'inline':
        return 'inline-flex items-center space-x-2';
      case 'modal':
        return 'flex flex-col space-y-2';
      default:
        return '';
    }
  };

  const linkClassName = `
    ${textSize} ${textColor} 
    cursor-pointer transition-colors duration-200 
    hover:underline focus:outline-none focus:underline
  `;

  const containerClassName = `
    ${className} 
    ${getVariantStyles()}
    ${orientation === 'vertical' ? 'flex flex-col space-y-2' : 'flex items-center'}
  `;

  const TermsLink = (
    <button
      onClick={handleTermsClick}
      className={linkClassName}
      type="button"
      aria-label="Open Terms of Service in new window"
    >
      {showIcons && <span className="mr-1">📄</span>}
      Terms of Service
    </button>
  );

  const PrivacyLink = (
    <button
      onClick={handlePrivacyClick}
      className={linkClassName}
      type="button"
      aria-label="Open Privacy Policy in new window"
    >
      {showIcons && <span className="mr-1">🔒</span>}
      Privacy Policy
    </button>
  );

  if (orientation === 'vertical') {
    return (
      <div className={containerClassName}>
        {TermsLink}
        {PrivacyLink}
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {TermsLink}
      {variant !== 'modal' && (
        <span className={`${textSize} ${textColor} select-none`}>
          {separator}
        </span>
      )}
      {PrivacyLink}
    </div>
  );
};

/**
 * LegalLinksFooter - Pre-configured for footer usage
 */
export const LegalLinksFooter: React.FC<{ className?: string }> = ({ className }) => (
  <LegalLinks
    className={className}
    variant="footer"
    textSize="text-xs"
    textColor="text-gray-500 hover:text-gray-700"
  />
);

/**
 * LegalLinksModal - Pre-configured for modal/form usage
 */
export const LegalLinksModal: React.FC<{ className?: string }> = ({ className }) => (
  <LegalLinks
    className={className}
    variant="modal"
    textSize="text-sm"
    textColor="text-blue-600 hover:text-blue-800"
    orientation="vertical"
    showIcons={true}
  />
);

/**
 * LegalLinksInline - Pre-configured for inline usage in text
 */
export const LegalLinksInline: React.FC<{ className?: string }> = ({ className }) => (
  <LegalLinks
    className={className}
    variant="inline"
    textSize="text-sm"
    textColor="text-blue-600 hover:text-blue-800"
    separator="and"
  />
);

export default LegalLinks;
