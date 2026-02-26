import React, { useState } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { useNavigate } from 'react-router-dom';
import LegalLinks from '../components/common/LegalLinks';

interface ParentRegistrationForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  agreeToTerms: boolean;
  agreeToPrivacyPolicy: boolean;
  emailVerificationCode: string;
}

const ParentRegistrationPage: React.FC = () => {
  const { registerParent, isLoading } = useFamilyAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ParentRegistrationForm>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    agreeToTerms: false,
    agreeToPrivacyPolicy: false,
    emailVerificationCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form: 1=Basic Info, 2=Password, 3=Email Verification
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeResendTimer, setCodeResendTimer] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.(com|co)$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address ending in .com or .co';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!formData.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the Terms of Service';
    }
    
    if (!formData.agreeToPrivacyPolicy) {
      errors.agreeToPrivacyPolicy = 'You must agree to the Privacy Policy';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Email verification functions
  const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationEmail = async () => {
    const code = generateVerificationCode();
    setGeneratedCode(code);
    
    // In a real implementation, you would call your email service here
    // For development: code is stored in generatedCode state for validation
    // TODO: Replace with actual email service in production
    
    // Start resend timer (60 seconds)
    setCodeResendTimer(60);
    const timer = setInterval(() => {
      setCodeResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // TODO: Replace with actual email service call
    // await emailService.sendVerificationCode(formData.email, code);
  };

  const validateVerificationCode = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.emailVerificationCode) {
      errors.emailVerificationCode = 'Verification code is required';
    } else if (formData.emailVerificationCode !== generatedCode) {
      errors.emailVerificationCode = 'Invalid verification code';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      // Send verification email before proceeding to step 3
      await sendVerificationEmail();
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // eslint-disable-next-line no-console
    console.log('Registration form submitted, step:', step, 'formData:', formData);
    
    if (step === 1) {
      handleNext();
      return;
    }
    
    if (step === 2) {
      handleNext();
      return;
    }
    
    if (step === 3) {
      if (!validateVerificationCode()) {
        return;
      }
    }
    
    if (step === 2 && !validateStep2()) {
      // eslint-disable-next-line no-console
      console.log('Step 2 validation failed');
      return;
    }

    try {
      // eslint-disable-next-line no-console
      console.log('Attempting parent registration...');
      await registerParent({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        agreeToTerms: formData.agreeToTerms,
        agreeToPrivacyPolicy: formData.agreeToPrivacyPolicy,
      });
      
      // eslint-disable-next-line no-console
      console.log('Registration successful, navigating to dashboard...');
      // Redirect to parent dashboard to add children
      navigate('/parent-dashboard');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Registration error:', error);
      // Error is handled by context
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">👨‍👩‍👧‍👦 Family Information</h2>
        <p className="text-gray-600 text-sm">Let's set up your family account</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="John"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.firstName && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Smith"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.lastName && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="parent@example.com"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            validationErrors.email ? 'border-red-300' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.email && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+1 (555) 123-4567"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address *
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="123 Main Street"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            validationErrors.address ? 'border-red-300' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.address && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="New York"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              validationErrors.city ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.city && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="NY"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              validationErrors.state ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.state && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.state}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code *
          </label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            placeholder="10001"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              validationErrors.zipCode ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {validationErrors.zipCode && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.zipCode}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">🔐 Secure Your Account</h2>
        <p className="text-gray-600 text-sm">Create a strong password and agree to our terms</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a strong password"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10 ${
              validationErrors.password ? 'border-red-300' : 'border-gray-300'
            }`}
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
        {validationErrors.password && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          Must be at least 8 characters long
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10 ${
              validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {validationErrors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-start">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            required
          />
          <label className="ml-2 text-sm text-gray-700">
            I agree to the{' '}
            <LegalLinks 
              variant="inline"
              className="text-purple-600 hover:text-purple-700 underline"
            /> *
          </label>
        </div>
        {validationErrors.agreeToTerms && (
          <p className="text-red-500 text-xs">{validationErrors.agreeToTerms}</p>
        )}

        <div className="flex items-start">
          <input
            type="checkbox"
            name="agreeToPrivacyPolicy"
            checked={formData.agreeToPrivacyPolicy}
            onChange={handleInputChange}
            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            required
          />
          <label className="ml-2 text-sm text-gray-700">
            I have read and understand the{' '}
            <LegalLinks 
              variant="inline"
              className="text-purple-600 hover:text-purple-700 underline"
            /> *
          </label>
        </div>
        {validationErrors.agreeToPrivacyPolicy && (
          <p className="text-red-500 text-xs">{validationErrors.agreeToPrivacyPolicy}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-700 text-xs">
          📋 <strong>What's next?</strong> After creating your account, you'll be able to add your children's profiles and set up their learning preferences!
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">📧 Email Verification</h2>
        <p className="text-gray-600 text-sm">We've sent a 6-digit code to {formData.email}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-blue-600 text-lg">📬</span>
          <p className="text-blue-700 text-sm font-medium">Check your email</p>
        </div>
        <p className="text-blue-600 text-xs">
          Enter the 6-digit verification code we sent to your email address.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Verification Code *
        </label>
        <input
          type="text"
          name="emailVerificationCode"
          value={formData.emailVerificationCode}
          onChange={handleInputChange}
          placeholder="Enter 6-digit code"
          maxLength={6}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg font-mono tracking-widest ${
            validationErrors.emailVerificationCode ? 'border-red-300' : 'border-gray-300'
          }`}
          required
        />
        {validationErrors.emailVerificationCode && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.emailVerificationCode}</p>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={sendVerificationEmail}
          disabled={codeResendTimer > 0}
          className="text-purple-600 hover:text-purple-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {codeResendTimer > 0 
            ? `Resend code in ${codeResendTimer}s` 
            : 'Resend verification code'
          }
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-green-700 text-xs">
          🔐 <strong>Security:</strong> This helps us verify your email address and keep your account secure.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🚀 Create Family Account
          </h1>
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className={`w-8 h-2 rounded-full ${step >= 1 ? 'bg-purple-500' : 'bg-gray-200'}`} />
            <div className={`w-8 h-2 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-gray-200'}`} />
            <div className={`w-8 h-2 rounded-full ${step >= 3 ? 'bg-purple-500' : 'bg-gray-200'}`} />
          </div>
          <p className="text-gray-600 text-sm">
            Step {step} of 3
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Creating...' : step === 1 ? 'Next →' : step === 2 ? 'Send Code →' : '🎉 Create Account'}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">
            Already have an account?
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Sign in to your family account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentRegistrationPage;
