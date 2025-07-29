import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">AI Health</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your intelligent health companion. Monitor your wellness, track symptoms, 
            and get AI-powered insights for a healthier life.
          </p>
          
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          <div className="text-center">
            <div className="text-4xl mb-4">🩺</div>
            <h3 className="text-xl font-semibold mb-2">Health Monitoring</h3>
            <p>Track vital signs, symptoms, and overall wellness metrics</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
            <p>Get personalized health recommendations powered by AI</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Health Reports</h3>
            <p>Generate comprehensive reports and track your progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
