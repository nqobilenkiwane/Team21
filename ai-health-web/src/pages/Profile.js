import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

function Profile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
            <div className="space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-xl font-semibold mb-2">Profile Page</h2>
            <p className="text-gray-600">Profile management features coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
