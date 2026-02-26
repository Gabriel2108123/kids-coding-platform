import React from 'react';
import { useGlobalError } from '../context/GlobalErrorContext';

/**
 * ErrorTestPage - A simple page to demonstrate the new global error display system
 */
export const ErrorTestPage: React.FC = () => {
  const { showError, showWarning, showInfo, clearAllErrors } = useGlobalError();

  const triggerError = () => {
    showError(
      'This is a test error message. The error will appear in a floating box instead of inline on the page.',
      'ErrorTestPage'
    );
  };

  const triggerWarning = () => {
    showWarning(
      'This is a test warning message. Warnings are displayed with a yellow theme.',
      'ErrorTestPage'
    );
  };

  const triggerInfo = () => {
    showInfo(
      'This is a test info message. Info messages are displayed with a blue theme.',
      'ErrorTestPage'
    );
  };

  const triggerMultipleErrors = () => {
    showError('First error message', 'ErrorTestPage');
    setTimeout(() => showWarning('Second warning message', 'ErrorTestPage'), 500);
    setTimeout(() => showInfo('Third info message', 'ErrorTestPage'), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🧪 Error Display System Demo
            </h1>
            <p className="text-gray-600 text-lg">
              Test the new floating error display system. Errors will appear in the top-right corner 
              instead of being embedded in the page content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Single Error Tests */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Single Error Tests</h2>
              
              <button
                onClick={triggerError}
                className="w-full bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors"
              >
                ❌ Trigger Error Message
              </button>

              <button
                onClick={triggerWarning}
                className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                ⚠️ Trigger Warning Message
              </button>

              <button
                onClick={triggerInfo}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                ℹ️ Trigger Info Message
              </button>
            </div>

            {/* Advanced Tests */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Advanced Tests</h2>
              
              <button
                onClick={triggerMultipleErrors}
                className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 transition-colors"
              >
                🚀 Trigger Multiple Messages
              </button>

              <button
                onClick={clearAllErrors}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
              >
                🧹 Clear All Errors
              </button>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Test Instructions:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click any button to see the error display</li>
                  <li>• Errors auto-close after 7 seconds</li>
                  <li>• Warnings/Info auto-close after 5 seconds</li>
                  <li>• Click the ✕ to close manually</li>
                  <li>• Multiple errors queue properly</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              ✅ New Error Display Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
              <div>
                <h4 className="font-semibold mb-2">User Experience:</h4>
                <ul className="space-y-1">
                  <li>• Non-intrusive floating display</li>
                  <li>• Doesn't break page layout</li>
                  <li>• Auto-dismissal with progress bar</li>
                  <li>• Manual close option</li>
                  <li>• Smooth animations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Developer Benefits:</h4>
                <ul className="space-y-1">
                  <li>• Global error management</li>
                  <li>• No need for inline error UI</li>
                  <li>• Consistent error styling</li>
                  <li>• Error deduplication</li>
                  <li>• Easy to implement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTestPage;
