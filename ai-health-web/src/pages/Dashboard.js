<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { healthAPI, userAPI } from '../services/api';
import { isAuthenticated, getUserInfo, logout, redirectToLogin } from '../utils/auth';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: 0,
    bloodPressure: '0/0',
    weight: 0,
    steps: 0,
    sleepHours: 0,
    waterIntake: 0
  });

  const [recentSymptoms, setRecentSymptoms] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [healthScore, setHealthScore] = useState({ score: 0, status: 'Loading...' });

  // Fetch all dashboard data on component mount
  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user name from localStorage or API
        const userInfo = getUserInfo();
        if (userInfo.fullName) {
          setUserName(userInfo.fullName);
        } else {
          // Fallback to API call
          try {
            const userProfile = await userAPI.getProfile();
            setUserName(`${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'User');
          } catch (err) {
            setUserName('User');
          }
        }

        // Fetch all dashboard data in parallel
        const [
          metricsResponse,
          symptomsResponse, 
          appointmentsResponse,
          recommendationsResponse,
          healthScoreResponse
        ] = await Promise.allSettled([
          healthAPI.getHealthMetrics(),
          healthAPI.getSymptoms(),
          healthAPI.getAppointments(),
          healthAPI.getAIRecommendations(),
          healthAPI.getHealthScore()
        ]);

        // Handle health metrics
        if (metricsResponse.status === 'fulfilled') {
          setHealthMetrics(metricsResponse.value);
        } else {
          console.warn('Failed to fetch health metrics:', metricsResponse.reason);
          // Keep default values
        }

        // Handle symptoms
        if (symptomsResponse.status === 'fulfilled') {
          setRecentSymptoms(symptomsResponse.value);
        } else {
          console.warn('Failed to fetch symptoms:', symptomsResponse.reason);
          setRecentSymptoms([]);
        }

        // Handle appointments
        if (appointmentsResponse.status === 'fulfilled') {
          setUpcomingAppointments(appointmentsResponse.value);
        } else {
          console.warn('Failed to fetch appointments:', appointmentsResponse.reason);
          setUpcomingAppointments([]);
        }

        // Handle AI recommendations
        if (recommendationsResponse.status === 'fulfilled') {
          setAiRecommendations(recommendationsResponse.value);
        } else {
          console.warn('Failed to fetch AI recommendations:', recommendationsResponse.reason);
          setAiRecommendations([
            'Unable to load AI recommendations at this time',
            'Please check your connection and try again'
          ]);
        }

        // Handle health score
        if (healthScoreResponse.status === 'fulfilled') {
          setHealthScore(healthScoreResponse.value);
        } else {
          console.warn('Failed to fetch health score:', healthScoreResponse.reason);
          setHealthScore({ score: 0, status: 'Unavailable' });
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const HealthCard = ({ title, value, unit, icon, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
          </p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  const SymptomChecker = () => {
    const [symptom, setSymptom] = useState('');
    const [severity, setSeverity] = useState('mild');
    const [submitting, setSubmitting] = useState(false);

    const handleSymptomSubmit = async (e) => {
      e.preventDefault();
      if (symptom.trim() && !submitting) {
        setSubmitting(true);
        try {
          const symptomData = {
            symptom: symptom.trim(),
            severity: severity,
            date: new Date().toISOString().split('T')[0]
          };

          // Add to API
          const newSymptom = await healthAPI.addSymptom(symptomData);
          
          // Update local state
          setRecentSymptoms([newSymptom, ...recentSymptoms]);
          setSymptom('');
          setSeverity('mild');
        } catch (error) {
          console.error('Failed to add symptom:', error);
          // Still add locally as fallback
          const fallbackSymptom = {
            id: Date.now(),
            symptom: symptom.trim(),
            severity: severity,
            date: new Date().toISOString().split('T')[0]
          };
          setRecentSymptoms([fallbackSymptom, ...recentSymptoms]);
          setSymptom('');
          setSeverity('mild');
        } finally {
          setSubmitting(false);
        }
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">🩺 Quick Symptom Check</h3>
        <form onSubmit={handleSymptomSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Describe your symptom..."
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>
          <div className="flex gap-4">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
            <button
              type="submit"
              disabled={submitting || !symptom.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Log Symptom'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const AIInsights = () => {
    const [loadingInsights, setLoadingInsights] = useState(false);

    const getMoreInsights = async () => {
      setLoadingInsights(true);
      try {
        const newRecommendations = await healthAPI.getAIRecommendations();
        setAiRecommendations(newRecommendations);
      } catch (error) {
        console.error('Failed to get more AI insights:', error);
      } finally {
        setLoadingInsights(false);
      }
    };

    return (
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">🤖 AI Health Insights</h3>
        <div className="space-y-3">
          {aiRecommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-yellow-300">•</span>
              <p className="text-sm">{recommendation}</p>
            </div>
          ))}
        </div>
        <button 
          onClick={getMoreInsights}
          disabled={loadingInsights}
          className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          {loadingInsights ? 'Loading...' : 'Get More Insights'}
        </button>
      </div>
    );
  };

  // Alert system functions
  const addAlert = (message, type = 'info') => {
    const alert = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [alert, ...prev]);
    
    // Auto-remove alert after 5 seconds for non-error alerts
    if (type !== 'error') {
      setTimeout(() => {
        removeAlert(alert.id);
      }, 5000);
    }
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-400 text-green-700';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'error': return 'bg-red-100 border-red-400 text-red-700';
      default: return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  // Quick action handlers
  const handleAIDiagnosis = async () => {
    try {
      navigate('/diagnostic');
    } catch (error) {
      console.error('Failed to navigate to diagnostic:', error);
      addAlert('Failed to open diagnostic page.', 'error');
    }
  };

  const handleScheduleAppointment = async () => {
    try {
      addAlert('Appointment scheduling feature coming soon!', 'info');
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
      addAlert('Failed to access appointment booking.', 'error');
    }
  };

  const handleGenerateReport = async () => {
    try {
      await healthAPI.generateHealthReport();
      // This would typically open the report in a new window or download it
      alert('Health report generated successfully!');
    } catch (error) {
      console.error('Failed to generate health report:', error);
      alert('Failed to generate report. Please try again later.');
    }
  };

  const handleFindClinics = async () => {
    try {
      // Get user's location or use a default
      const location = 'current'; // This would typically be obtained from geolocation
      const clinics = await healthAPI.findNearbyClinics(location);
      alert(`Found ${clinics.length || 0} nearby clinics. Feature coming soon!`);
    } catch (error) {
      console.error('Failed to find nearby clinics:', error);
      alert('Failed to find nearby clinics. Please try again later.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert System */}
      {alerts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`${getAlertColor(alert.type)} border px-4 py-3 rounded relative max-w-sm shadow-lg`}
            >
              <span className="block sm:inline pr-8">{alert.message}</span>
              <button
                onClick={() => removeAlert(alert.id)}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
              >
                <span className="sr-only">Dismiss</span>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Health Dashboard</h1>
              <p className="text-gray-600">Welcome back, {userName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                🔔 Notifications
              </button>
              <div className="relative group">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer">
                  👤
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <button 
                    onClick={logout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Metrics Grid */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Health Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HealthCard
              title="Heart Rate"
              value={healthMetrics.heartRate}
              unit="bpm"
              icon="❤️"
              color="border-red-500"
            />
            <HealthCard
              title="Blood Pressure"
              value={healthMetrics.bloodPressure}
              unit="mmHg"
              icon="🩸"
              color="border-blue-500"
            />
            <HealthCard
              title="Weight"
              value={healthMetrics.weight}
              unit="kg"
              icon="⚖️"
              color="border-green-500"
            />
            <HealthCard
              title="Steps Today"
              value={healthMetrics.steps.toLocaleString()}
              unit="steps"
              icon="👟"
              color="border-yellow-500"
            />
            <HealthCard
              title="Sleep Duration"
              value={healthMetrics.sleepHours}
              unit="hours"
              icon="😴"
              color="border-purple-500"
            />
            <HealthCard
              title="Water Intake"
              value={healthMetrics.waterIntake}
              unit="L"
              icon="💧"
              color="border-cyan-500"
            />
          </div>
        </section>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Symptom Checker */}
            <SymptomChecker />

            {/* Recent Symptoms */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Recent Symptoms</h3>
              <div className="space-y-3">
                {recentSymptoms.length > 0 ? (
                  recentSymptoms.map((symptom) => (
                    <div key={symptom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{symptom.symptom}</p>
                        <p className="text-sm text-gray-600">{symptom.date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        symptom.severity === 'mild' || symptom.severity === 'Mild' ? 'bg-green-100 text-green-800' :
                        symptom.severity === 'moderate' || symptom.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {symptom.severity}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No symptoms logged yet</p>
                    <p className="text-sm">Use the symptom checker above to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">📅 Upcoming Appointments</h3>
              <div className="space-y-3">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{appointment.doctor}</p>
                        <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{appointment.date}</p>
                        <p className="text-sm text-gray-600">{appointment.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No upcoming appointments</p>
                    <p className="text-sm">Schedule your next appointment below</p>
                  </div>
                )}
              </div>
              <button 
                onClick={handleScheduleAppointment}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Schedule New Appointment
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Insights */}
            <AIInsights />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleAIDiagnosis}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  🩺 AI Diagnostic Tool
                </button>
                <button 
                  onClick={handleScheduleAppointment}
                  className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  � Schedule Appointment
                </button>
                <button 
                  onClick={handleGenerateReport}
                  className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors"
                >
                  📊 Generate Health Report
                </button>
                <button 
                  onClick={handleFindClinics}
                  className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors"
                >
                  🏥 Find Nearby Clinics
                </button>
              </div>
            </div>

            {/* Health Score */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">🎯 Health Score</h3>
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${
                  healthScore.score >= 80 ? 'text-green-600' : 
                  healthScore.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {healthScore.score}
                </div>
                <p className="text-gray-600 mb-4">{healthScore.status}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      healthScore.score >= 80 ? 'bg-green-600' : 
                      healthScore.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${healthScore.score}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Based on recent activity and health metrics</p>
              </div>
            </div>
          </div>
        </div>      </main>
    </div>
  );
};

export default Dashboard;
=======

>>>>>>> 113f5c448a0d24ae55dc9df9cebe1b1db54699ca
