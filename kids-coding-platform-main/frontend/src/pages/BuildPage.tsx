import React, { useState } from 'react';
import Header from '../components/Header';
import EnhancedGameBuilder from '../components/EnhancedGameBuilder';
import SimpleBlocklyEditor from '../editor/SimpleBlocklyEditor';

const BuildPage: React.FC = () => {
  const [useSimpleEditor, setUseSimpleEditor] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-6">
            {/* Toggle between editors for testing */}
            <div className="mb-4 text-center">
              <button
                onClick={() => setUseSimpleEditor(!useSimpleEditor)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {useSimpleEditor ? 'Switch to Enhanced Editor' : 'Switch to Simple Editor (For Testing)'}
              </button>
            </div>

            {useSimpleEditor ? (
              <div className="w-full h-96 mb-6">
                <h2 className="text-2xl font-bold mb-4">Simple Blockly Test</h2>
                <SimpleBlocklyEditor onCodeChange={(code) => {
                  // Generated code will be used for game execution
                  if (code) {
                    // Handle generated code
                  }
                }} />
              </div>
            ) : (
              <EnhancedGameBuilder />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildPage;
