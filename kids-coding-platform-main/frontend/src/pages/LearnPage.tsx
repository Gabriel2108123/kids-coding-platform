import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import ModuleIntroduction from '../components/ModuleIntroduction';

const LearnPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId?: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {moduleId ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Learning Module: {moduleId}</h1>
            <ModuleIntroduction moduleId={moduleId} />
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose a Learning Module</h1>
            <p className="text-gray-600 text-lg mb-8">
              Select a module from your dashboard to start learning!
            </p>
            <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ready to Learn?</h2>
              <p className="text-gray-600 mb-6">
                Go back to your dashboard and click on any available module to start your coding adventure!
              </p>
              <a
                href="/"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnPage;
