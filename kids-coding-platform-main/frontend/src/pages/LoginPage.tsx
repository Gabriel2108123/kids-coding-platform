import React, { useState } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSelector from '../components/LanguageSelector';
import LegalLinks from '../components/common/LegalLinks';

interface LoginFormData {
  emailOrUsername: string;
  password: string;
  userType: 'parent' | 'child';
}

const LoginPage: React.FC = () => {
    const { loginParent, loginChild, userType, currentUser, isAuthenticated } = useFamilyAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Local loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<LoginFormData>({
    emailOrUsername: '',
    password: '',
    userType: 'child', // Default to child login since kids are primary users
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (userType: 'parent' | 'child') => {
    setFormData(prev => ({
      ...prev,
      userType,
      emailOrUsername: '', // Clear the input when switching types
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // eslint-disable-next-line no-console
    console.log('Login form submitted with data:', formData);
    
    if (!formData.emailOrUsername || !formData.password) {
      // eslint-disable-next-line no-console
      console.log('Missing required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // eslint-disable-next-line no-console
      console.log('Attempting login for user type:', formData.userType);
      if (formData.userType === 'parent') {
        await loginParent(formData.emailOrUsername, formData.password);
        // eslint-disable-next-line no-console
        console.log('Parent login completed, current auth state:', { userType, currentUser, isAuthenticated });
        navigate('/parent-dashboard');
      } else {
        await loginChild(formData.emailOrUsername, formData.password);
        navigate('/dashboard');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Login error:', error);
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterClick = () => {
    // eslint-disable-next-line no-console
    console.log('Register button clicked, user type:', formData.userType);
    if (formData.userType === 'parent') {
      navigate('/register-parent');
    } else {
      navigate('/register-parent'); // Parents must register first
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🚀 {t('appName')}
          </h1>
          <p className="text-gray-600">{t('welcomeBack')}</p>
        </div>

        {/* User Type Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => handleUserTypeChange('child')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              formData.userType === 'child'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👦 {t('signInChild')}
          </button>
          <button
            type="button"
            onClick={() => handleUserTypeChange('parent')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              formData.userType === 'parent'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👨‍👩‍👧‍👦 {t('signInParent')}
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email/Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.userType === 'parent' ? t('emailAddress') : t('username')}
            </label>
            <input
              type={formData.userType === 'parent' ? 'email' : 'text'}
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleInputChange}
              placeholder={
                formData.userType === 'parent' 
                  ? 'parent@example.com' 
                  : 'my_awesome_username'
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.emailOrUsername || !formData.password}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '🔄 Logging in...' : `🚀 ${t('signIn')}`}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">
            {formData.userType === 'child' 
              ? t('dontHaveAccount')
              : t('newToPlatform')
            }
          </p>
          <button
            onClick={handleRegisterClick}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            {formData.userType === 'child' 
              ? "Ask your parent to create a family account!" 
              : "Create a family account"
            }
          </button>
        </div>

        {/* Helper Text for Kids */}
        {formData.userType === 'child' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-xs text-center">
              💡 <strong>Need help?</strong> Ask your parent for your username and password!
            </p>
          </div>
        )}

        {/* Legal Links */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <LegalLinks 
              variant="footer"
              className="text-xs text-gray-500"
              textSize="text-xs"
              separator=" • "
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
