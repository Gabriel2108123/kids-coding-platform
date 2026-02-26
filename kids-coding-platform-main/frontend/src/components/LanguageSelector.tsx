import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

interface LanguageSelectorProps {
  className?: string;
  showFlag?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  showFlag = true 
}) => {
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {showFlag ? `${lang.flag} ${lang.nativeName}` : lang.nativeName}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector;
