import React from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';

const AuthTest: React.FC = () => {
  const { loginParent, loginChild, registerParent, isLoading } = useFamilyAuth();

  const testParentLogin = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('Testing parent login...');
      await loginParent('test@example.com', 'password123');
      // eslint-disable-next-line no-console
      console.log('Parent login successful!');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Parent login failed:', error);
    }
  };

  const testParentRegistration = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('Testing parent registration...');
      await registerParent({
        email: 'newparent@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Parent',
        phone: '555-0123',
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'United States',
        agreeToTerms: true,
        agreeToPrivacyPolicy: true
      });
      // eslint-disable-next-line no-console
      console.log('Parent registration successful!');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Parent registration failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Authentication Test Component</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Status</h2>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Functions available:</p>
        <ul>
          <li>loginParent: {typeof loginParent === 'function' ? '✅' : '❌'}</li>
          <li>loginChild: {typeof loginChild === 'function' ? '✅' : '❌'}</li>
          <li>registerParent: {typeof registerParent === 'function' ? '✅' : '❌'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Actions</h2>
        <button 
          onClick={testParentLogin}
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Test Parent Login
        </button>
        
        <button 
          onClick={testParentRegistration}
          disabled={isLoading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Test Parent Registration
        </button>
      </div>

      <div>
        <h2>Instructions</h2>
        <p>1. Open browser console to see test results</p>
        <p>2. Click buttons to test authentication functions</p>
        <p>3. Check if functions are working properly</p>
      </div>
    </div>
  );
};

export default AuthTest;
