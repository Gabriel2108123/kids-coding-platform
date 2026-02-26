import React, { useState, useEffect } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ChildProfile } from '../types/family';
import '../assets/css/learning-map.css';

// Import the background image
const learningMapBg = '/images/learning-map-bg.png';

interface MapModule {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  position: { x: number; y: number };
  isCompleted: boolean;
  isUnlocked: boolean;
  icon: string;
  ageGroup: 'young_learners';
}

const LearnMapPage: React.FC = () => {
  const { currentUser, userType } = useFamilyAuth();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<MapModule | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  // Type guard for child user
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;

  // Mock data for early elementary modules - replace with API call
  const mapModules: MapModule[] = [
    {
      id: 'basics-1',
      title: 'What is Coding?',
      description: 'Learn what coding is with fun animations!',
      videoUrl: '/videos/what-is-coding.mp4',
      position: { x: 20, y: 30 },
      isCompleted: true,
      isUnlocked: true,
      icon: '🤖',
      ageGroup: 'young_learners'
    },
    {
      id: 'basics-2', 
      title: 'Computer Friends',
      description: 'Meet the parts of a computer!',
      videoUrl: '/videos/computer-parts.mp4',
      position: { x: 40, y: 25 },
      isCompleted: false,
      isUnlocked: true,
      icon: '💻',
      ageGroup: 'young_learners'
    },
    {
      id: 'basics-3',
      title: 'Magic Commands',
      description: 'Learn how to give commands to computers!',
      videoUrl: '/videos/commands.mp4',
      position: { x: 60, y: 35 },
      isCompleted: false,
      isUnlocked: false,
      icon: '✨',
      ageGroup: 'young_learners'
    }
  ];

  useEffect(() => {
    // Redirect if not the right age group for this specific map view
    if (childUser && childUser.ageGroup !== 'young_learners') {
      // eslint-disable-next-line no-console
      console.log('Wrong age group for map view, redirecting...');
      navigate('/');
    }
  }, [childUser, navigate]);

  const handleModuleClick = (module: MapModule) => {
    if (!module.isUnlocked) return;
    setSelectedModule(module);
  };

  const handleWatchVideo = () => {
    if (selectedModule) {
      setShowVideo(true);
    }
  };

  const handleVideoComplete = () => {
    // Mark module as completed and unlock next module
    // In real implementation, this would call an API
    // eslint-disable-next-line no-console
    console.log('Video completed for module:', selectedModule?.id);
    setShowVideo(false);
    setSelectedModule(null);
  };

  if (!childUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-xl text-gray-600">Loading your adventure map...</p>
        </div>
      </div>
    );
  }

  if (showVideo && selectedModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedModule.icon} {selectedModule.title}
              </h1>
              <p className="text-gray-600 text-lg">{selectedModule.description}</p>
            </div>
            
            <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-gray-600">Video Player Placeholder</p>
                <p className="text-sm text-gray-500">Video: {selectedModule.videoUrl}</p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowVideo(false)}
                className="btn bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
              >
                Back to Map
              </button>
              <button
                onClick={handleVideoComplete}
                className="btn bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                I Finished Watching! ✨
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            🗺️ Your Learning Adventure Map!
          </h1>
          <p className="text-gray-600 text-xl">
            Click on the islands to start your coding journey!
          </p>
        </div>

        {/* Adventure Map */}

        <div
          className="learning-map-container rounded-2xl shadow-xl overflow-hidden"
          style={{
            backgroundImage: `url(${learningMapBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '400px',
            backgroundColor: '#93c5fd', // Fallback blue color
          }}
        >
          {/* Optional: Overlay for color tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/60 to-green-200/60 pointer-events-none" />

          {/* Background elements (emoji clouds, etc.) */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 text-4xl floating-cloud">☁️</div>
            <div className="absolute top-20 right-20 text-3xl floating-star">🌟</div>
            <div className="absolute bottom-10 left-1/4 text-2xl">🏝️</div>
            <div className="absolute bottom-20 right-1/3 text-2xl">🌴</div>
          </div>

          {/* Module Islands */}
          {mapModules.map((module) => (
            <div
              key={module.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                module.isUnlocked 
                  ? 'hover:scale-110 hover:shadow-lg' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{ 
                left: `${module.position.x}%`, 
                top: `${module.position.y}%` 
              }}
              onClick={() => handleModuleClick(module)}
            >
              <div className={`
                relative w-24 h-24 rounded-full flex items-center justify-center text-3xl shadow-lg border-4
                ${module.isCompleted 
                  ? 'bg-green-200 border-green-400' 
                  : module.isUnlocked 
                    ? 'bg-blue-200 border-blue-400' 
                    : 'bg-gray-200 border-gray-400'
                }
              `}>
                {module.icon}
                {module.isCompleted && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    ✓
                  </div>
                )}
                {!module.isUnlocked && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                    🔒
                  </div>
                )}
              </div>
              <div className="text-center mt-2 max-w-20">
                <p className="text-sm font-bold text-gray-800">{module.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Module Details Modal */}
        {selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedModule.icon}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedModule.title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedModule.description}
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleWatchVideo}
                    className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Watch Video! 🎬
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnMapPage;
